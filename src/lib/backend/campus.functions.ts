// ============================================================================
// Server functions for CampusMobi — the entire backend API surface.
// ============================================================================
// Every exported `createServerFn(...)` below is callable from the browser
// like a normal async function (see src/lib/frontend/campus-store.tsx,
// which wraps each one with useServerFn()) but the code inside .handler()
// only ever actually runs on the server — TanStack Start's compiler strips
// the handler body out of the client bundle and replaces the call with an
// HTTP request under the hood. That's why this file can safely read
// process.env, hash passwords, and query MySQL directly.
//
// Two related conventions to know before editing this file:
//   1. Module scope (outside any handler) holds ONLY imports, types, and
//      server-fn *declarations* — no real logic. Everything that touches
//      the database or does real work lives inside a .handler() callback.
//   2. db.server.ts / auth.server.ts / email.server.ts (true server-only
//      files — see their own "*.server.ts" naming) are imported with a
//      dynamic `await import(...)` *inside* each handler, never as a normal
//      top-level `import` at the top of this file. A top-level import would
//      pull server-only code (raw SQL, Gmail credentials) into the bundle
//      TanStack tries to ship to the browser. Always follow this pattern
//      when adding a new handler.
import { createServerFn } from "@tanstack/react-start";
import { requireAuth } from "@/lib/backend/auth-middleware";
import { z } from "zod";
import { FEE_TYPES, STUDENT_EMAIL_DOMAIN } from "../shared/campus-constants";

// ---------------------------------------------------------------------------
// Shared types — the shape the FRONTEND sees. Deliberately camelCase and
// decoupled from the database's snake_case column names (see the UserRow
// type + toUser() mapper further down): the UI should never need to know
// the DB schema changed.
// ---------------------------------------------------------------------------
export type User = {
  id: string;
  email: string; // institutional login address, e.g. 220012345@iws.ac.za — NOT where OTP emails go
  name: string;
  studentId: string;
  role: "student" | "admin";
  faculty: string;
  course: string;
  yearOfStudy: number;
  residence: string;
  avatarInitials: string;
  isVerified: boolean;
};

export type Payment = {
  id: string;
  userId: string;
  feeType: string;
  amount: number;
  paystackReference: string | null;
  status: "pending" | "success" | "failed";
  createdAt: string;
};

export type ClassSession = {
  id: string;
  code: string;
  module: string;
  day: string;
  start: string;
  end: string;
  venue: string;
  lecturer: string;
  kind: "Lecture" | "Practical" | "Tutorial";
};

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  studentId: string;
  role: string;
  isVerified: boolean;
};

export type DashboardData = {
  user: User;
  payments: Payment[];
  isAdmin: boolean;
  admin?: {
    users: AdminUser[];
    paymentCount: number;
    revenue: number;
  };
};

// Raw shape of a `users` row as MySQL returns it (snake_case columns,
// is_verified as a 0/1 tinyint). Only used internally by toUser() below —
// the rest of the app never sees this shape.
type UserRow = {
  id: string;
  email: string;
  name: string;
  student_id: string;
  faculty: string;
  course: string;
  year_of_study: number;
  residence: string;
  avatar_initials: string;
  role: string;
  is_verified: number;
};

// Converts one MySQL `users` row into the camelCase User shape the frontend
// expects. Every server function that returns user data funnels through
// this single mapping function, so a column rename only has to be fixed
// here, not at every call site.
function toUser(row: UserRow): User {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    studentId: row.student_id,
    role: row.role as User["role"],
    faculty: row.faculty,
    course: row.course,
    yearOfStudy: row.year_of_study,
    residence: row.residence,
    avatarInitials: row.avatar_initials,
    isVerified: !!row.is_verified, // MySQL BOOLEAN comes back as 0/1, not true/false
  };
}

// ============ Registration ============
// Registration succeeds only for a student number that appears — unclaimed —
// in student_roster: the real Faculty of Natural Sciences enrolled-students
// list (transcribed from the WSU prospectus), the local stand-in for the
// registrar's real system. Anyone typing a random 9-digit number is
// rejected; the account's name/faculty/programme are pulled from the
// roster (via its real qualification/department), not from what the
// person typed. `personalEmail` is new: it's where OTP codes actually get
// emailed (see email.server.ts) — the institutional address derived below
// stays the account's login identifier either way.
export const registerStudent = createServerFn({ method: "POST" })
  .validator((input) =>
    z
      .object({
        studentNumber: z.string().regex(/^\d{9}$/, "Enter a 9-digit student number"),
        password: z.string().min(6),
        // This is a REAL address (Gmail, etc.) — unlike the institutional
        // @iws.ac.za one below, which is a demo domain with no mailbox.
        personalEmail: z.string().email("Enter a valid personal email address"),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    // The institutional login address is deterministic from the student
    // number — the person never types it, it's always <number>@iws.ac.za.
    const email = `${data.studentNumber}@${STUDENT_EMAIL_DOMAIN}`;
    // Dynamic imports (see the file-level comment above) — keeps db/auth
    // server-only code out of the client bundle.
    const { db, randomUUID } = await import("./db.server");
    const { hashPassword, createSession } = await import("./auth.server");

    // Look up this student number in the real roster, joining through to
    // get its faculty/qualification name — this is the "is this person
    // actually enrolled" check the whole registration flow hinges on.
    const roster = (await db
      .prepare(
        `SELECT sr.student_number, sr.full_name, sr.year_of_study, sr.residence, sr.claimed_by_user_id,
                q.name AS course, d.name AS faculty
         FROM student_roster sr
         JOIN qualifications q ON q.qualification_id = sr.qualification_id
         JOIN departments d ON d.department_id = q.department_id
         WHERE sr.student_number = ?`,
      )
      .get(data.studentNumber)) as
      | {
          student_number: string;
          full_name: string;
          year_of_study: number;
          residence: string;
          claimed_by_user_id: string | null;
          course: string;
          faculty: string;
        }
      | undefined;

    // Not in the roster at all — reject outright, don't create an account.
    if (!roster) {
      return {
        ok: false as const,
        error: "That student number isn't on our list of enrolled WSU students.",
      };
    }
    // In the roster, but someone already registered against it — one
    // account per student number, enforced here (and again by the
    // fk_roster_claimed_by foreign key at the DB level as a backstop).
    if (roster.claimed_by_user_id) {
      return {
        ok: false as const,
        error: "An account for that student number already exists — try signing in instead.",
      };
    }

    // Passed both checks — actually create the account. Everything except
    // email/password/personalEmail is copied straight from the roster row,
    // not from anything the person typed, by design (see the module-level
    // comment above this handler).
    const id = randomUUID();
    await db
      .prepare(
        `INSERT INTO users (id, email, personal_email, password_hash, name, student_id, faculty, course, year_of_study, residence, avatar_initials, role, is_verified)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'student', 0)`,
      )
      .run(
        id,
        email,
        data.personalEmail,
        hashPassword(data.password), // scrypt hash — see auth.server.ts; the plaintext password is never stored or logged
        roster.full_name,
        roster.student_number,
        roster.faculty,
        roster.course,
        roster.year_of_study,
        roster.residence,
        // Avatar initials: first letter of each word in the full name,
        // capped at 2 characters — e.g. "Thabo Nkosi" -> "TN".
        roster.full_name
          .split(" ")
          .map((part) => part[0])
          .join("")
          .slice(0, 2)
          .toUpperCase(),
      );
    // Marks this roster row as claimed so the same student number can't be
    // registered again (the check earlier in this handler relies on this).
    await db
      .prepare("UPDATE student_roster SET claimed_by_user_id = ? WHERE student_number = ?")
      .run(id, roster.student_number);

    // Registration itself is a real signed-in session already — the
    // account just isn't `is_verified` yet, which the client (auth.tsx)
    // uses to force the OTP screen before letting the person into the app
    // proper. See requestOtp/verifyOtp below for that step.
    const token = await createSession(id);
    return { ok: true as const, token };
  });

// Password sign-in. Note this does NOT create a fully-usable session by
// itself in the UI's flow — the client (auth.tsx) always follows a
// successful login() with a requestOtp({purpose:"login"}) + OTP screen
// before navigating into the app, exactly mirroring how registration's OTP
// step works. Server-side, the session token this returns IS valid the
// moment it's issued (there's no separate "pending 2FA" session state —
// see the README's security-gaps note for why that's a known simplification,
// same as it always was for the registration OTP gate).
// Account lockout after repeated failed logins — the app's mitigation
// against password-guessing/brute-force attacks. 3 wrong passwords in a
// row locks that ACCOUNT (not the caller's IP — see rate-limit.ts for the
// separate, IP-based general request limiter) out for LOCKOUT_MS, after
// which the counter resets and normal attempts resume.
const MAX_LOGIN_ATTEMPTS = 3;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes

export const login = createServerFn({ method: "POST" })
  .validator((input) =>
    z.object({ email: z.string().email(), password: z.string().min(1) }).parse(input),
  )
  .handler(async ({ data }) => {
    const email = data.email.trim().toLowerCase();
    const { db } = await import("./db.server");
    const { verifyPassword, createSession } = await import("./auth.server");

    let row:
      | { id: string; password_hash: string; failed_login_attempts: number; locked_until: string | null }
      | undefined;
    try {
      row = (await db
        .prepare(
          "SELECT id, password_hash, failed_login_attempts, locked_until FROM users WHERE email = ?",
        )
        .get(email)) as typeof row;
    } catch (e) {
      // A DB-connection failure (wrong credentials, unreachable host, TLS
      // misconfig...) is not the same as "wrong password" — don't leak the
      // driver's raw error string to the login form. Full detail still
      // lands in the server console for whoever's debugging it.
      console.error("login: database error", e);
      return { ok: false as const, error: "Couldn't reach the database. Please try again shortly." };
    }

    // Account doesn't exist — same generic message as a wrong password
    // (see below), so this branch never confirms/denies an email exists.
    if (!row) return { ok: false as const, error: "Invalid university email or password." };

    // Currently locked out from a previous run of failed attempts — reject
    // immediately, WITHOUT even checking the password. This matters: it
    // means a locked-out attacker can't keep spending server CPU time on
    // scrypt hashing (see auth.server.ts) while locked out, which is
    // itself a small additional defence against resource-exhaustion abuse.
    if (row.locked_until && new Date(row.locked_until) > new Date()) {
      const minutesLeft = Math.ceil((new Date(row.locked_until).getTime() - Date.now()) / 60000);
      return {
        ok: false as const,
        error: `Too many failed attempts. Try again in ${minutesLeft} minute${minutesLeft === 1 ? "" : "s"}.`,
      };
    }

    if (!verifyPassword(data.password, row.password_hash)) {
      const attempts = row.failed_login_attempts + 1;
      if (attempts >= MAX_LOGIN_ATTEMPTS) {
        // Hit the limit — lock the account and reset the counter, so the
        // NEXT lockout (after this one expires) needs another full
        // MAX_LOGIN_ATTEMPTS, rather than triggering again on attempt 1.
        const lockedUntil = new Date(Date.now() + LOCKOUT_MS).toISOString();
        await db
          .prepare("UPDATE users SET failed_login_attempts = 0, locked_until = ? WHERE id = ?")
          .run(lockedUntil, row.id);
      } else {
        await db
          .prepare("UPDATE users SET failed_login_attempts = ? WHERE id = ?")
          .run(attempts, row.id);
      }
      // Same generic message every time — never reveal the attempt count
      // or whether THIS attempt was the one that triggered a lockout, since
      // that itself would be a side channel confirming the account exists.
      return { ok: false as const, error: "Invalid university email or password." };
    }

    // Correct password — clear any accumulated failed-attempt state.
    if (row.failed_login_attempts > 0 || row.locked_until) {
      await db
        .prepare("UPDATE users SET failed_login_attempts = 0, locked_until = NULL WHERE id = ?")
        .run(row.id);
    }
    const token = await createSession(row.id);
    return { ok: true as const, token };
  });

export const logout = createServerFn({ method: "POST" })
  .middleware([requireAuth]) // requireAuth resolves the bearer token and supplies context.userId/db below
  .handler(async ({ context }) => {
    const { destroySession } = await import("./auth.server");
    await destroySession(context.token);
    return { ok: true as const };
  });

// The single "give me everything the dashboard needs" call — user profile,
// their payment history, and (only if they're an admin) the admin panel's
// data too. One round trip instead of three separate ones.
export const getMyDashboard = createServerFn({ method: "GET" })
  .middleware([requireAuth])
  .handler(async ({ context }) => {
    const { db, userId } = context; // userId came from resolving the session token — see auth-middleware.ts

    const row = (await db.prepare("SELECT * FROM users WHERE id = ?").get(userId)) as
      | UserRow
      | undefined;
    if (!row) throw new Error("Account not found."); // shouldn't happen (token resolved to a userId that no longer exists)
    const user = toUser(row);

    const paymentRows = (await db
      .prepare(
        "SELECT id, user_id, fee_type, amount, paystack_reference, status, created_at FROM payments WHERE user_id = ? ORDER BY created_at DESC",
      )
      .all(userId)) as {
      id: string;
      user_id: string;
      fee_type: string;
      amount: number;
      paystack_reference: string | null;
      status: string;
      created_at: string;
    }[];
    // Map snake_case DB rows -> camelCase Payment[] the frontend expects,
    // same pattern as toUser() above.
    const payments: Payment[] = paymentRows.map((p) => ({
      id: p.id,
      userId: p.user_id,
      feeType: p.fee_type,
      amount: Number(p.amount), // MySQL DECIMAL comes back as a string via mysql2 unless cast
      paystackReference: p.paystack_reference,
      status: p.status as Payment["status"],
      createdAt: p.created_at,
    }));

    const isAdmin = user.role === "admin";
    let admin: DashboardData["admin"];
    if (isAdmin) {
      // Only queried at all for admin accounts — a student's dashboard
      // call never touches the full users table or payment totals.
      const allUsers = (await db
        .prepare(
          "SELECT id, name, email, student_id, role, is_verified FROM users ORDER BY name ASC",
        )
        .all()) as {
        id: string;
        name: string;
        email: string;
        student_id: string;
        role: string;
        is_verified: number;
      }[];
      const users: AdminUser[] = allUsers.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        studentId: u.student_id,
        role: u.role,
        isVerified: !!u.is_verified,
      }));
      const paymentCount = (
        (await db.prepare("SELECT COUNT(*) AS n FROM payments").get()) as { n: number }
      ).n;
      const revenue =
        ((await db
          .prepare("SELECT COALESCE(SUM(amount),0) AS s FROM payments WHERE status = 'success'")
          .get()) as { s: number }
        ).s ?? 0;
      admin = { users, paymentCount, revenue: Number(revenue) };
    }

    return { user, payments, isAdmin, admin };
  });

// ============ Timetable ============
// Real, per-student schedule — driven by which modules this student's
// roster entry is actually enrolled in this semester (module_enrollments)
// and the class sections those modules run (timetable_slots), both from
// the real WSU Faculty of Natural Sciences catalog.
const DAY_SHORT: Record<string, string> = {
  Monday: "Mon",
  Tuesday: "Tue",
  Wednesday: "Wed",
  Thursday: "Thu",
  Friday: "Fri",
};
const KIND_FROM_SESSION_TYPE: Record<string, ClassSession["kind"]> = {
  lecture: "Lecture",
  tutorial: "Tutorial",
  practical: "Practical",
};

export const getMyTimetable = createServerFn({ method: "GET" })
  .middleware([requireAuth])
  .handler(async ({ context }) => {
    const { db, userId } = context;

    // The join chain: this user -> their roster entry (by student number)
    // -> the modules they're enrolled in this semester -> the actual class
    // slots for those modules, matched on the RIGHT semester and the
    // student's own department (so two departments' sections of a
    // shared module code don't collide).
    const rows = (await db
      .prepare(
        `SELECT ts.slot_id, m.module_code, m.module_name, ts.day_of_week, ts.start_time, ts.end_time,
                ts.venue, ts.session_type, CONCAT(st.title, ' ', st.first_name, ' ', st.last_name) AS lecturer
         FROM users u
         JOIN student_roster sr        ON sr.student_number = u.student_id
         JOIN qualifications q         ON q.qualification_id = sr.qualification_id
         JOIN module_enrollments me    ON me.student_number = sr.student_number
         JOIN modules m                ON m.module_id = me.module_id
         JOIN timetable_slots ts       ON ts.module_id = m.module_id
                                       AND ts.semester_id = me.semester_id
                                       AND ts.department_id = q.department_id
         LEFT JOIN staff st            ON st.staff_id = ts.staff_id
         WHERE u.id = ?
         ORDER BY ts.day_of_week, ts.start_time`,
      )
      .all(userId)) as {
      slot_id: number;
      module_code: string;
      module_name: string;
      day_of_week: string;
      start_time: string;
      end_time: string;
      venue: string;
      session_type: string;
      lecturer: string | null;
    }[];

    const sessions: ClassSession[] = rows.map((r) => ({
      id: String(r.slot_id),
      code: r.module_code,
      module: r.module_name,
      day: DAY_SHORT[r.day_of_week] ?? r.day_of_week,
      start: r.start_time.slice(0, 5), // "09:00:00" -> "09:00" (drop seconds)
      end: r.end_time.slice(0, 5),
      venue: r.venue,
      lecturer: r.lecturer ?? "TBC", // LEFT JOIN staff — a slot can have no assigned lecturer yet
      kind: KIND_FROM_SESSION_TYPE[r.session_type] ?? "Lecture",
    }));

    return { sessions };
  });

// ============ OTP / two-factor authentication ============
// One mechanism, reused for THREE separate flows — which one is in play is
// tracked purely by the `purpose` column (registration | login |
// password_reset). Delivery: if the account has a personal_email on file
// AND Gmail is configured (see email.server.ts), the code is emailed for
// real and never appears in the response at all. Otherwise it falls back
// to being returned as `mockInboxCode`, which the UI renders as an
// on-screen "inbox" — this keeps the whole flow demoable even without
// Gmail set up (e.g. a teammate who hasn't configured GMAIL_APP_PASSWORD
// yet, or an account created before personal_email existed).
const OTP_PURPOSES = ["registration", "login"] as const;

export const requestOtp = createServerFn({ method: "POST" })
  .middleware([requireAuth])
  // Optional on purpose (defaults to "registration") so existing call
  // sites that pass no data at all still work unchanged.
  .validator((input) => z.object({ purpose: z.enum(OTP_PURPOSES).default("registration") }).parse(input ?? {}))
  .handler(async ({ data, context }) => {
    const { db, userId } = context;
    const { randomUUID } = await import("./db.server");
    const { generateOtp } = await import("./auth.server");
    const { sendOtpEmail } = await import("./email.server");

    const user = (await db.prepare("SELECT email, personal_email FROM users WHERE id = ?").get(userId)) as
      | { email: string; personal_email: string | null }
      | undefined;

    const { code, codeHash, expiresAt } = generateOtp();
    await db
      .prepare("INSERT INTO otp_codes (id, user_id, code_hash, purpose, expires_at) VALUES (?, ?, ?, ?, ?)")
      .run(randomUUID(), userId, codeHash, data.purpose, expiresAt);

    // Prefer the real personal email if one's on file; fall back to the
    // (fake, undeliverable) institutional address only so `deliverTo` is
    // never empty for display purposes — sendOtpEmail will simply fail
    // silently against a @iws.ac.za address, same effect as not sending.
    const deliverTo = user?.personal_email ?? user?.email ?? "";
    const emailed = user?.personal_email ? await sendOtpEmail(deliverTo, code, data.purpose) : false;

    return {
      email: deliverTo,
      emailed,
      // The whole point of real delivery: when it worked, the code is
      // simply never present in this response — nothing for the UI to
      // accidentally render on screen. Only the fallback path returns it.
      mockInboxCode: emailed ? undefined : code,
    };
  });

export const verifyOtp = createServerFn({ method: "POST" })
  .middleware([requireAuth])
  .validator((input) =>
    z.object({ code: z.string().length(6), purpose: z.enum(OTP_PURPOSES).default("registration") }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { db, userId } = context;
    const { verifyOtpHash } = await import("./auth.server");

    // Most recent unconsumed code for THIS purpose specifically — a
    // pending "login" code and a pending "registration" code (if both
    // somehow existed) never get cross-matched against each other.
    const otp = (await db
      .prepare(
        `SELECT id, code_hash, expires_at FROM otp_codes
         WHERE user_id = ? AND purpose = ? AND consumed_at IS NULL
         ORDER BY created_at DESC LIMIT 1`,
      )
      .get(userId, data.purpose)) as { id: string; code_hash: string; expires_at: string } | undefined;

    if (!otp) return { ok: false as const, error: "No pending code — request a new one." };
    if (new Date(otp.expires_at) < new Date())
      return { ok: false as const, error: "That code expired — request a new one." };
    if (!verifyOtpHash(data.code, otp.code_hash))
      return { ok: false as const, error: "Incorrect code." };

    // One-time use: mark it consumed so the same code can't be replayed.
    await db.prepare("UPDATE otp_codes SET consumed_at = ? WHERE id = ?").run(
      new Date().toISOString(),
      otp.id,
    );
    // is_verified is a permanent "this account completed registration"
    // flag — only the registration flow should ever set it. A login OTP
    // (purpose: "login") succeeding doesn't touch it; the account was
    // already verified from registration, or this check wouldn't be an
    // issue in the first place.
    if (data.purpose === "registration") {
      await db.prepare("UPDATE users SET is_verified = 1 WHERE id = ?").run(userId);
    }

    return { ok: true as const };
  });

// ============ Forgot password ============
// Same OTP machinery as above, keyed by purpose = 'password_reset'
// instead. Deliberately doesn't reveal whether an email address has an
// account — the response shape is identical either way; a mock inbox code
// is only ever generated (and returned as a fallback) when one does,
// matching how a real "check your email" screen behaves.
export const requestPasswordReset = createServerFn({ method: "POST" })
  .validator((input) => z.object({ email: z.string().email() }).parse(input))
  .handler(async ({ data }) => {
    const email = data.email.trim().toLowerCase();
    const { db, randomUUID } = await import("./db.server");
    const { generateOtp } = await import("./auth.server");
    const { sendOtpEmail } = await import("./email.server");

    const user = (await db.prepare("SELECT id, personal_email FROM users WHERE email = ?").get(email)) as
      | { id: string; personal_email: string | null }
      | undefined;

    if (!user) {
      // Same success response either way — don't leak account existence.
      return { ok: true as const, mockInboxCode: undefined };
    }

    const { code, codeHash, expiresAt } = generateOtp();
    await db
      .prepare(
        "INSERT INTO otp_codes (id, user_id, code_hash, purpose, expires_at) VALUES (?, ?, ?, 'password_reset', ?)",
      )
      .run(randomUUID(), user.id, codeHash, expiresAt);

    const emailed = user.personal_email ? await sendOtpEmail(user.personal_email, code, "password_reset") : false;

    return { ok: true as const, mockInboxCode: emailed ? undefined : code };
  });

export const resetPassword = createServerFn({ method: "POST" })
  .validator((input) =>
    z
      .object({
        email: z.string().email(),
        code: z.string().length(6),
        newPassword: z.string().min(6),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const email = data.email.trim().toLowerCase();
    const { db } = await import("./db.server");
    const { hashPassword, verifyOtpHash, destroyAllSessions } = await import("./auth.server");

    const user = (await db.prepare("SELECT id FROM users WHERE email = ?").get(email)) as
      | { id: string }
      | undefined;
    // Same generic error as an actually-wrong code — still don't confirm
    // whether the email exists.
    if (!user) return { ok: false as const, error: "Incorrect code." };

    const otp = (await db
      .prepare(
        `SELECT id, code_hash, expires_at FROM otp_codes
         WHERE user_id = ? AND purpose = 'password_reset' AND consumed_at IS NULL
         ORDER BY created_at DESC LIMIT 1`,
      )
      .get(user.id)) as { id: string; code_hash: string; expires_at: string } | undefined;

    if (!otp) return { ok: false as const, error: "No pending code — request a new one." };
    if (new Date(otp.expires_at) < new Date())
      return { ok: false as const, error: "That code expired — request a new one." };
    if (!verifyOtpHash(data.code, otp.code_hash))
      return { ok: false as const, error: "Incorrect code." };

    await db
      .prepare("UPDATE otp_codes SET consumed_at = ? WHERE id = ?")
      .run(new Date().toISOString(), otp.id);
    await db
      .prepare("UPDATE users SET password_hash = ? WHERE id = ?")
      .run(hashPassword(data.newPassword), user.id);
    // Invalidate every existing session — if someone else had the old
    // password and a live session, this kicks them out immediately.
    await destroyAllSessions(user.id);

    return { ok: true as const };
  });

// ============ Payment gateway (Paystack sandbox, with a simulated fallback) ============
export const initiatePayment = createServerFn({ method: "POST" })
  .middleware([requireAuth])
  .validator((input) => z.object({ feeId: z.string().min(1) }).parse(input))
  .handler(async ({ data, context }) => {
    const { db, userId } = context;
    const { randomUUID } = await import("./db.server");
    const fee = FEE_TYPES.find((f) => f.id === data.feeId);
    if (!fee) return { ok: false as const, error: "Unknown fee type." };

    // The payment row is created as 'pending' up front, REGARDLESS of
    // whether Paystack is configured — the row itself is always real, only
    // the card-processing step below is ever simulated.
    const paymentId = randomUUID();
    await db
      .prepare("INSERT INTO payments (id, user_id, fee_type, amount, status) VALUES (?, ?, ?, ?, 'pending')")
      .run(paymentId, userId, fee.label, fee.amount);

    const secretKey = process.env["PAYSTACK_SECRET_KEY"];
    if (!secretKey) {
      // No live Paystack key configured — fall back to an in-app simulated checkout.
      // The payment row above is real; only the card-processing step is mocked, so
      // this stays fully demoable without anyone signing up for a Paystack account.
      // Add PAYSTACK_SECRET_KEY at any point to switch to real sandbox checkout.
      return { ok: true as const, paymentId, simulated: true as const };
    }

    const user = (await db.prepare("SELECT email FROM users WHERE id = ?").get(userId)) as
      | { email: string }
      | undefined;
    const email = user?.email ?? `${userId}@iws.ac.za`;
    const res = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: { Authorization: `Bearer ${secretKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        amount: Math.round(fee.amount * 100), // kobo/cents — smallest currency unit
        currency: "ZAR",
        reference: paymentId,
        callback_url: process.env["PAYSTACK_CALLBACK_URL"] ?? undefined,
      }),
    });
    const json = (await res.json()) as {
      status: boolean;
      message: string;
      data?: { authorization_url: string; reference: string };
    };
    if (!json.status || !json.data) {
      await db.prepare("UPDATE payments SET status = 'failed' WHERE id = ?").run(paymentId);
      return {
        ok: false as const,
        error: json.message ?? "Paystack could not start this transaction.",
      };
    }

    await db
      .prepare("UPDATE payments SET paystack_reference = ? WHERE id = ?")
      .run(json.data.reference, paymentId);

    return {
      ok: true as const,
      authorizationUrl: json.data.authorization_url,
      paymentId,
      simulated: false as const,
    };
  });

// Confirms a simulated (no-Paystack-key) checkout. Ownership is enforced with an
// explicit WHERE user_id = ? — the local equivalent of the old RLS "own payments" policy.
export const completeSimulatedPayment = createServerFn({ method: "POST" })
  .middleware([requireAuth])
  .validator((input) => z.object({ paymentId: z.string().min(1) }).parse(input))
  .handler(async ({ data, context }) => {
    const { db, userId } = context;
    const result = await db
      .prepare(
        "UPDATE payments SET status = 'success', paystack_reference = ? WHERE id = ? AND user_id = ?",
      )
      .run(`SIM-${data.paymentId.slice(0, 8)}`, data.paymentId, userId);
    // changes === 0 means either the payment doesn't exist OR it belongs to
    // someone else — both cases are indistinguishable from the outside on
    // purpose (same as the ownership check pattern used elsewhere).
    if (result.changes === 0) return { ok: false as const, error: "Payment not found." };
    return { ok: true as const };
  });

export const verifyPayment = createServerFn({ method: "POST" })
  .middleware([requireAuth])
  .validator((input) => z.object({ reference: z.string().min(1) }).parse(input))
  .handler(async ({ data, context }) => {
    const { db, userId } = context;
    const secretKey = process.env["PAYSTACK_SECRET_KEY"];
    if (!secretKey) return { ok: false as const, error: "PAYSTACK_SECRET_KEY is not configured." };

    // Server-to-server call to Paystack to confirm the real outcome —
    // NEVER trust a status the client claims for itself, since the
    // browser could report "success" for a payment that actually failed.
    const res = await fetch(`https://api.paystack.co/transaction/verify/${data.reference}`, {
      headers: { Authorization: `Bearer ${secretKey}` },
    });
    const json = (await res.json()) as { status: boolean; data?: { status: string } };
    const succeeded = json.status && json.data?.status === "success";

    const result = await db
      .prepare("UPDATE payments SET status = ? WHERE user_id = ? AND paystack_reference = ?")
      .run(succeeded ? "success" : "failed", userId, data.reference);
    if (result.changes === 0) return { ok: false as const, error: "Payment not found." };

    return { ok: true as const, status: succeeded ? ("success" as const) : ("failed" as const) };
  });
