// Sends OTP codes by real email via Gmail's SMTP — the thing that used to
// just be a "mock inbox" rendered in the UI. Lives in src/lib/backend/
// alongside the other server-only (*.server.ts) modules: like those, this
// is only ever dynamically imported inside a server function handler
// (never at module scope), so it's safe even though campus.functions.ts —
// which ships a client stub — imports it indirectly.
//
// Setup (see README.md for the full walkthrough):
//   1. Turn on 2-Step Verification on the sending Gmail account.
//   2. Create an "App Password" for it (myaccount.google.com/apppasswords).
//   3. Set GMAIL_USER=<that gmail address> and
//      GMAIL_APP_PASSWORD=<the 16-character app password> in .env.
// Without those two env vars set, sendOtpEmail() below just returns
// `false` — every caller in campus.functions.ts already treats that as
// "fall back to showing the code on screen", so the whole app keeps
// working (just without real email) if Gmail isn't configured yet.
import nodemailer from "nodemailer";

// A nodemailer "transporter" opens/manages the actual SMTP connection.
// Building one is a little expensive (it validates the config), so it's
// created at most once per server process and reused — module-scope cache,
// not a fresh transporter per email.
let cachedTransporter: nodemailer.Transporter | null | undefined;

function getTransporter(): nodemailer.Transporter | null {
  if (cachedTransporter !== undefined) return cachedTransporter; // already resolved (success OR "not configured") — don't redo the work

  const user = process.env["GMAIL_USER"];
  const pass = process.env["GMAIL_APP_PASSWORD"];
  if (!user || !pass) {
    cachedTransporter = null; // not configured — cache the "no" so we don't re-check env vars on every OTP request
    return null;
  }

  // service: "gmail" is nodemailer's built-in shorthand for Gmail's SMTP
  // host/port/TLS settings — we only need to supply credentials.
  cachedTransporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
  return cachedTransporter;
}

// The three flows that send a code — matches otp_codes.purpose in the DB
// schema (db/init/03_app_schema.sql) exactly, so a purpose can't silently
// mismatch between the email wording and what's actually stored/checked.
export type OtpPurpose = "registration" | "login" | "password_reset";

const SUBJECT_BY_PURPOSE: Record<OtpPurpose, string> = {
  registration: "Verify your CampusMobi account",
  login: "Your CampusMobi sign-in code",
  password_reset: "Reset your CampusMobi password",
};

const INTRO_BY_PURPOSE: Record<OtpPurpose, string> = {
  registration: "Use this code to verify your new CampusMobi account:",
  login: "Use this code to finish signing in to CampusMobi:",
  password_reset: "Use this code to reset your CampusMobi password:",
};

// Attempts to email a 6-digit code to `to`. Returns true only if nodemailer
// reports the send succeeded — callers use that boolean to decide whether
// they can safely omit the code from their response (real delivery worked)
// or need to fall back to returning it for an on-screen "mock inbox"
// (Gmail not configured, or the send itself failed for some other reason —
// a bad address, a network hiccup, etc).
export async function sendOtpEmail(to: string, code: string, purpose: OtpPurpose): Promise<boolean> {
  const transporter = getTransporter();
  if (!transporter) return false;

  try {
    await transporter.sendMail({
      from: `CampusMobi <${process.env["GMAIL_USER"]}>`,
      to,
      subject: SUBJECT_BY_PURPOSE[purpose],
      // Plain-text version — always included alongside HTML, since some
      // mail clients (and screen readers) prefer or require it.
      text: `${INTRO_BY_PURPOSE[purpose]}\n\n${code}\n\nThis code expires in 5 minutes. If you didn't request this, you can ignore this email.`,
      html: `
        <div style="font-family: system-ui, sans-serif; max-width: 420px; margin: 0 auto;">
          <p style="font-size: 15px; color: #1c1b18;">${INTRO_BY_PURPOSE[purpose]}</p>
          <p style="font-size: 32px; font-weight: 700; letter-spacing: 6px; margin: 20px 0; color: #7a1f1f;">${code}</p>
          <p style="font-size: 13px; color: #6f6b62;">This code expires in 5 minutes. If you didn't request this, you can safely ignore this email.</p>
        </div>
      `,
    });
    return true;
  } catch (e) {
    // A failed send (wrong app password, Gmail rate-limiting, no network,
    // etc.) shouldn't crash the request — log it server-side and let the
    // caller's fallback (show the code on screen) take over instead.
    console.error("sendOtpEmail failed", e);
    return false;
  }
}
