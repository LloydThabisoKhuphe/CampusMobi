-- =====================================================================
-- CampusMobi — application tables
-- Builds on the catalog from 01/02. Runs automatically on first
-- container start, right after the catalog is created.
-- =====================================================================
USE campusmobi;
SET FOREIGN_KEY_CHECKS = 0;

-- The institution's real enrolled-students roster (Faculty of Natural
-- Sciences, WSU) — the local equivalent of a registrar's system.
-- Registration below only succeeds for a student number that appears
-- here and hasn't already been claimed by an account.
DROP TABLE IF EXISTS student_roster;
CREATE TABLE student_roster (
    student_number      CHAR(9) PRIMARY KEY,
    full_name            VARCHAR(120) NOT NULL,
    qualification_id      INT UNSIGNED NOT NULL,
    year_of_study           TINYINT UNSIGNED NOT NULL DEFAULT 1,
    residence                 VARCHAR(60) NOT NULL DEFAULT 'Not allocated',
    claimed_by_user_id          VARCHAR(36) NULL,
    CONSTRAINT fk_roster_qualification FOREIGN KEY (qualification_id)
        REFERENCES qualifications(qualification_id) ON DELETE RESTRICT,
    INDEX idx_roster_qualification (qualification_id)
) ENGINE=InnoDB;

-- Which modules a roster entry is actually taking this semester — this is
-- what makes the Timetable screen genuinely personalised instead of a
-- static mock. Keyed to the natural student_number (not a login account),
-- since a student can be enrolled before ever creating a CampusMobi login.
DROP TABLE IF EXISTS module_enrollments;
CREATE TABLE module_enrollments (
    enrollment_id    BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    student_number    CHAR(9) NOT NULL,
    module_id          INT UNSIGNED NOT NULL,
    semester_id          INT UNSIGNED NOT NULL,
    status                 ENUM('enrolled','passed','failed','withdrawn') NOT NULL DEFAULT 'enrolled',
    UNIQUE KEY uq_student_module_semester (student_number, module_id, semester_id),
    CONSTRAINT fk_enrollment_roster FOREIGN KEY (student_number)
        REFERENCES student_roster(student_number) ON DELETE CASCADE,
    CONSTRAINT fk_enrollment_module FOREIGN KEY (module_id)
        REFERENCES modules(module_id) ON DELETE CASCADE,
    CONSTRAINT fk_enrollment_semester FOREIGN KEY (semester_id)
        REFERENCES semesters(semester_id) ON DELETE CASCADE,
    INDEX idx_enrollment_student (student_number)
) ENGINE=InnoDB;

-- CampusMobi accounts. Created only once a roster entry is claimed
-- (see registerStudent in campus.functions.ts) — a listing in
-- student_roster is eligibility, this is an actual login.
DROP TABLE IF EXISTS users;
CREATE TABLE users (
    id              VARCHAR(36) PRIMARY KEY,
    email           VARCHAR(120) NOT NULL UNIQUE,
    -- The student's own real email (e.g. Gmail) — collected at registration
    -- and used ONLY as the delivery address for OTP codes (see
    -- email.server.ts). The institutional `email` column above stays the
    -- login identifier either way; this is nullable so accounts created
    -- before this column existed (or without Gmail configured) still work —
    -- requestOtp() falls back to showing the code on screen when it's NULL.
    personal_email  VARCHAR(190) NULL,
    password_hash   VARCHAR(255) NOT NULL,
    name            VARCHAR(120) NOT NULL,
    student_id      CHAR(9) NOT NULL DEFAULT '',
    faculty         VARCHAR(150) NOT NULL DEFAULT '',
    course          VARCHAR(150) NOT NULL DEFAULT '',
    year_of_study   TINYINT UNSIGNED NOT NULL DEFAULT 1,
    residence       VARCHAR(60) NOT NULL DEFAULT 'Not allocated',
    avatar_initials VARCHAR(4) NOT NULL DEFAULT '',
    role            ENUM('student','admin') NOT NULL DEFAULT 'student',
    is_verified     BOOLEAN NOT NULL DEFAULT FALSE,
    -- Login rate limiting (max 3 attempts — see the login handler in
    -- campus.functions.ts). failed_login_attempts resets to 0 on any
    -- successful login; hitting MAX_LOGIN_ATTEMPTS sets locked_until and
    -- resets the counter, so a NEW lockout window starts fresh rather
    -- than instantly re-triggering on the next single failed attempt.
    failed_login_attempts TINYINT UNSIGNED NOT NULL DEFAULT 0,
    locked_until           TIMESTAMP NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_user_email_domain CHECK (email LIKE '%@iws.ac.za' OR email LIKE '%@wsu.ac.za'),
    INDEX idx_users_student_id (student_id)
) ENGINE=InnoDB;

ALTER TABLE student_roster
    ADD CONSTRAINT fk_roster_claimed_by FOREIGN KEY (claimed_by_user_id)
        REFERENCES users(id) ON DELETE SET NULL;

-- Session tokens: only a SHA-256 hash of the bearer token is ever stored.
-- expires_at/created_at are app-generated ISO-8601 strings compared purely
-- in JS (never in SQL), so they're kept as VARCHAR rather than a native
-- MySQL datetime type — this avoids any timezone/format translation risk
-- moving off SQLite's equally string-typed TEXT columns.
DROP TABLE IF EXISTS sessions;
CREATE TABLE sessions (
    token_hash  CHAR(64) PRIMARY KEY,
    user_id     VARCHAR(36) NOT NULL,
    created_at  VARCHAR(40) NOT NULL,
    expires_at  VARCHAR(40) NOT NULL,
    CONSTRAINT fk_session_user FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_sessions_user (user_id)
) ENGINE=InnoDB;

-- One-time-pin codes for registration verification, sign-in 2FA, AND
-- forgot-password (`purpose` tells the app which flow issued/expects it —
-- see requestOtp/verifyOtp in campus.functions.ts). Only the SHA-256 hash
-- of the 6-digit code is stored, never the plaintext.
DROP TABLE IF EXISTS otp_codes;
CREATE TABLE otp_codes (
    id           VARCHAR(36) PRIMARY KEY,
    user_id       VARCHAR(36) NOT NULL,
    code_hash      CHAR(64) NOT NULL,
    purpose         ENUM('registration','login','password_reset') NOT NULL DEFAULT 'registration',
    expires_at        VARCHAR(40) NOT NULL,
    consumed_at        VARCHAR(40) NULL,
    created_at            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_otp_user FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_otp_user (user_id, created_at DESC)
) ENGINE=InnoDB;

-- WSU administration fees (remarking, certificates, gym access, etc.) paid
-- through Paystack — a fixed published fee schedule (see campus-constants.ts),
-- separate from the tuition/registration ledger in fee_structure above.
DROP TABLE IF EXISTS payments;
CREATE TABLE payments (
    id                  VARCHAR(36) PRIMARY KEY,
    user_id              VARCHAR(36) NOT NULL,
    fee_type              VARCHAR(60) NOT NULL,
    amount                  DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    paystack_reference        VARCHAR(100) UNIQUE,
    status                       ENUM('pending','success','failed') NOT NULL DEFAULT 'pending',
    created_at                     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_payment_user FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_payments_user (user_id, created_at DESC)
) ENGINE=InnoDB;

SET FOREIGN_KEY_CHECKS = 1;
