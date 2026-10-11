// Password hashing + opaque session tokens — no external auth provider,
// no third-party auth library. Everything here is Node's built-in `crypto`
// module: scrypt for password hashing (memory-hard, resistant to GPU
// cracking, no extra dependency), random 32-byte session tokens stored
// only as a SHA-256 hash server-side (the raw token is handed to the
// client exactly once, at login/register, and never persisted anywhere).
import crypto from "node:crypto";
import { db, randomUUID } from "./db.server";

const SCRYPT_KEYLEN = 64; // output hash length in bytes — must match between hashPassword and verifyPassword
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // sessions are valid for 30 days after creation

// Hashes a plaintext password for storage. A fresh random salt is generated
// per password (never reused), and stored alongside the hash as
// "salt:hash" — verifyPassword() below splits it back apart.
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, SCRYPT_KEYLEN).toString("hex");
  return `${salt}:${hash}`;
}

// Checks a login attempt's plaintext password against the stored
// "salt:hash" string. Re-derives the hash using the SAME salt that was
// used originally, then compares.
export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false; // malformed stored value — fail closed, not open
  const check = crypto.scryptSync(password, salt, SCRYPT_KEYLEN);
  const expected = Buffer.from(hash, "hex");
  // timingSafeEqual (not ===) so a wrong password takes the same amount of
  // time to reject regardless of how many leading bytes happened to
  // match — prevents a timing attack from leaking the real hash byte by byte.
  return check.length === expected.length && crypto.timingSafeEqual(check, expected);
}

// Issues a new session: generates a random opaque token, stores ONLY its
// hash in the `sessions` table (so a database leak doesn't hand out usable
// tokens), and returns the raw token for the caller to send to the client.
export async function createSession(userId: string): Promise<string> {
  const token = crypto.randomBytes(32).toString("base64url"); // 256 bits of randomness — this IS the session, nothing else identifies it
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString();
  await db
    .prepare("INSERT INTO sessions (token_hash, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)")
    .run(tokenHash, userId, new Date().toISOString(), expiresAt);
  return token;
}

// Turns a client-supplied token back into a userId, or null if it's
// missing/unknown/expired. Called on every authenticated request — see
// auth-middleware.ts, which wraps this for use in server functions.
export async function resolveSession(token: string): Promise<string | null> {
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const row = (await db
    .prepare("SELECT user_id, expires_at FROM sessions WHERE token_hash = ?")
    .get(tokenHash)) as { user_id: string; expires_at: string } | undefined;
  if (!row) return null; // no session with this token hash exists at all
  if (new Date(row.expires_at) < new Date()) {
    // Expired — clean it up now rather than leaving dead rows around
    // (lazy deletion: only happens when someone actually tries to use it).
    await db.prepare("DELETE FROM sessions WHERE token_hash = ?").run(tokenHash);
    return null;
  }
  return row.user_id;
}

// Signs out ONE session (e.g. a normal "log out" click) — the token that
// was used to call this becomes invalid immediately; other sessions for
// the same user (a different device, say) are untouched.
export async function destroySession(token: string): Promise<void> {
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  await db.prepare("DELETE FROM sessions WHERE token_hash = ?").run(tokenHash);
}

// Invalidates EVERY existing session for a user — used after a password
// reset, so a stolen or shared session token stops working immediately
// the moment the password changes.
export async function destroyAllSessions(userId: string): Promise<void> {
  await db.prepare("DELETE FROM sessions WHERE user_id = ?").run(userId);
}

// Generates a 6-digit OTP code (as a zero-padded string, e.g. "004821"),
// its SHA-256 hash (what actually gets stored — see otp_codes table), and
// an ISO expiry timestamp 5 minutes out. The plaintext `code` is returned
// so the CALLER can email it (see email.server.ts) — it is never itself
// written to the database, only `codeHash` is.
export function generateOtp() {
  const code = String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");
  const codeHash = crypto.createHash("sha256").update(code).digest("hex");
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 min from now
  return { code, codeHash, expiresAt };
}

// Checks a person-entered code against the stored hash — same
// timing-safe-comparison reasoning as verifyPassword() above.
export function verifyOtpHash(inputCode: string, codeHash: string): boolean {
  const inputHash = crypto.createHash("sha256").update(inputCode).digest("hex");
  const a = Buffer.from(inputHash);
  const b = Buffer.from(codeHash);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

// Re-exported so callers that already import from this file (auth.server)
// don't also need a separate import from db.server just for randomUUID.
export { randomUUID };
