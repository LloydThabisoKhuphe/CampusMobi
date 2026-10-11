-- =====================================================================
-- CampusMobi — Real academic catalog
-- Faculty of Natural Sciences, Walter Sisulu University (Mthatha Campus)
-- Source: WSU Faculty of Natural Sciences Prospectus (2021). Departments,
-- qualifications, module codes/credits and the curriculum mapping below
-- are transcribed from that document. Staff records are fictional.
-- Runs automatically on first container start (docker-entrypoint-initdb.d).
-- =====================================================================

CREATE DATABASE IF NOT EXISTS campusmobi
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE campusmobi;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS departments;
CREATE TABLE departments (
    department_id   INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    department_code VARCHAR(10) NOT NULL UNIQUE,
    name            VARCHAR(120) NOT NULL,
    faculty         VARCHAR(120) NOT NULL DEFAULT 'Faculty of Natural Sciences',
    campus          VARCHAR(60)  NOT NULL DEFAULT 'Mthatha',
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

DROP TABLE IF EXISTS staff;
CREATE TABLE staff (
    staff_id        INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    staff_number    VARCHAR(15) NOT NULL UNIQUE,
    title           VARCHAR(10)  NOT NULL DEFAULT 'Mr',
    first_name      VARCHAR(60)  NOT NULL,
    last_name       VARCHAR(60)  NOT NULL,
    email           VARCHAR(120) NOT NULL UNIQUE,
    department_id   INT UNSIGNED NOT NULL,
    role            ENUM('lecturer','senior_lecturer','hod','professor') NOT NULL DEFAULT 'lecturer',
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_staff_department FOREIGN KEY (department_id)
        REFERENCES departments(department_id) ON DELETE RESTRICT
) ENGINE=InnoDB;

DROP TABLE IF EXISTS qualifications;
CREATE TABLE qualifications (
    qualification_id   INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    qualification_code VARCHAR(15) NOT NULL UNIQUE,
    name                VARCHAR(150) NOT NULL,
    department_id       INT UNSIGNED NOT NULL,
    degree_type         ENUM('diploma','bachelor','honours','masters','doctorate') NOT NULL,
    nqf_level            TINYINT UNSIGNED NOT NULL,
    duration_years       TINYINT UNSIGNED NOT NULL,
    is_extended          BOOLEAN NOT NULL DEFAULT FALSE,
    min_credits           SMALLINT UNSIGNED NOT NULL DEFAULT 360,
    hod_staff_id          INT UNSIGNED NULL,
    created_at             TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_qual_department FOREIGN KEY (department_id)
        REFERENCES departments(department_id) ON DELETE RESTRICT,
    CONSTRAINT fk_qual_hod FOREIGN KEY (hod_staff_id)
        REFERENCES staff(staff_id) ON DELETE SET NULL
) ENGINE=InnoDB;

DROP TABLE IF EXISTS modules;
CREATE TABLE modules (
    module_id     INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    module_code   VARCHAR(15) NOT NULL UNIQUE,
    module_name   VARCHAR(150) NOT NULL,
    department_id INT UNSIGNED NOT NULL,
    credits       TINYINT UNSIGNED NOT NULL,
    nqf_level     TINYINT UNSIGNED NOT NULL,
    created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_module_department FOREIGN KEY (department_id)
        REFERENCES departments(department_id) ON DELETE RESTRICT
) ENGINE=InnoDB;

DROP TABLE IF EXISTS qualification_modules;
CREATE TABLE qualification_modules (
    qualification_module_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    qualification_id  INT UNSIGNED NOT NULL,
    module_id          INT UNSIGNED NOT NULL,
    year_level          TINYINT UNSIGNED NOT NULL,
    semester             TINYINT UNSIGNED NOT NULL,           -- 1, 2, or 0 for year-long
    module_type          ENUM('core','foundation','elective') NOT NULL DEFAULT 'core',
    UNIQUE KEY uq_qual_module (qualification_id, module_id),
    CONSTRAINT fk_qm_qualification FOREIGN KEY (qualification_id)
        REFERENCES qualifications(qualification_id) ON DELETE CASCADE,
    CONSTRAINT fk_qm_module FOREIGN KEY (module_id)
        REFERENCES modules(module_id) ON DELETE CASCADE
) ENGINE=InnoDB;

DROP TABLE IF EXISTS module_prerequisites;
CREATE TABLE module_prerequisites (
    module_id         INT UNSIGNED NOT NULL,
    prerequisite_id   INT UNSIGNED NOT NULL,
    PRIMARY KEY (module_id, prerequisite_id),
    CONSTRAINT fk_prereq_module FOREIGN KEY (module_id)
        REFERENCES modules(module_id) ON DELETE CASCADE,
    CONSTRAINT fk_prereq_prereq FOREIGN KEY (prerequisite_id)
        REFERENCES modules(module_id) ON DELETE CASCADE,
    CONSTRAINT chk_no_self_prereq CHECK (module_id <> prerequisite_id)
) ENGINE=InnoDB;

DROP TABLE IF EXISTS academic_years;
CREATE TABLE academic_years (
    academic_year_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    year_label        VARCHAR(9) NOT NULL UNIQUE,
    start_date        DATE NOT NULL,
    end_date          DATE NOT NULL,
    is_current        BOOLEAN NOT NULL DEFAULT FALSE
) ENGINE=InnoDB;

DROP TABLE IF EXISTS semesters;
CREATE TABLE semesters (
    semester_id       INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    academic_year_id  INT UNSIGNED NOT NULL,
    semester_number   TINYINT UNSIGNED NOT NULL,
    start_date        DATE NOT NULL,
    end_date          DATE NOT NULL,
    UNIQUE KEY uq_year_semester (academic_year_id, semester_number),
    CONSTRAINT fk_semester_year FOREIGN KEY (academic_year_id)
        REFERENCES academic_years(academic_year_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- One lecture/tutorial/practical section per module per semester per
-- department — department_id disambiguates a module cross-listed to more
-- than one department's cohort (e.g. a shared first-year Maths module).
DROP TABLE IF EXISTS timetable_slots;
CREATE TABLE timetable_slots (
    slot_id       INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    module_id      INT UNSIGNED NOT NULL,
    semester_id      INT UNSIGNED NOT NULL,
    department_id      INT UNSIGNED NOT NULL,
    staff_id             INT UNSIGNED NULL,
    session_type          ENUM('lecture','tutorial','practical') NOT NULL DEFAULT 'lecture',
    day_of_week              ENUM('Monday','Tuesday','Wednesday','Thursday','Friday') NOT NULL,
    start_time                 TIME NOT NULL,
    end_time                     TIME NOT NULL,
    venue                          VARCHAR(60) NOT NULL,
    created_at                       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_slot_module FOREIGN KEY (module_id)
        REFERENCES modules(module_id) ON DELETE CASCADE,
    CONSTRAINT fk_slot_semester FOREIGN KEY (semester_id)
        REFERENCES semesters(semester_id) ON DELETE CASCADE,
    CONSTRAINT fk_slot_department FOREIGN KEY (department_id)
        REFERENCES departments(department_id) ON DELETE CASCADE,
    CONSTRAINT fk_slot_staff FOREIGN KEY (staff_id)
        REFERENCES staff(staff_id) ON DELETE SET NULL,
    CONSTRAINT chk_slot_time CHECK (end_time > start_time),
    INDEX idx_slot_module_semester (module_id, semester_id)
) ENGINE=InnoDB;

-- Kept for the full academic-records picture (tuition/registration/residence
-- schedule per qualification) even though the live app's own "pay fees"
-- screen below uses its own simpler administration-fees table.
DROP TABLE IF EXISTS fee_categories;
CREATE TABLE fee_categories (
    fee_category_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name             VARCHAR(60) NOT NULL UNIQUE,
    description         VARCHAR(255) NULL
) ENGINE=InnoDB;

DROP TABLE IF EXISTS fee_structure;
CREATE TABLE fee_structure (
    fee_structure_id  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    qualification_id    INT UNSIGNED NULL,
    fee_category_id       INT UNSIGNED NOT NULL,
    academic_year_id        INT UNSIGNED NOT NULL,
    amount                     DECIMAL(10,2) NOT NULL,
    UNIQUE KEY uq_fee (qualification_id, fee_category_id, academic_year_id),
    CONSTRAINT fk_fee_qualification FOREIGN KEY (qualification_id)
        REFERENCES qualifications(qualification_id) ON DELETE CASCADE,
    CONSTRAINT fk_fee_category FOREIGN KEY (fee_category_id)
        REFERENCES fee_categories(fee_category_id) ON DELETE CASCADE,
    CONSTRAINT fk_fee_year FOREIGN KEY (academic_year_id)
        REFERENCES academic_years(academic_year_id) ON DELETE CASCADE
) ENGINE=InnoDB;

SET FOREIGN_KEY_CHECKS = 1;
