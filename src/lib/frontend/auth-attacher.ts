// Client-side middleware: reads the session token out of localStorage and
// attaches it as an `Authorization: Bearer <token>` header on every server
// function call — automatically, without each call site remembering to do
// it. Registered as a global `functionMiddleware` in src/start.ts, which is
// what actually wires this into every request; this file just defines it.
import { createMiddleware } from "@tanstack/react-start";

// The one localStorage key the whole app uses for the session token.
// Centralised here so getStoredToken/setStoredToken are the only two
// places that ever touch localStorage directly for auth purposes.
export const SESSION_STORAGE_KEY = "campusmobi_session_token";

// `typeof window === "undefined"` guards below matter because this module
// can execute during server-side rendering too (where there's no
// localStorage at all) — without the guard, SSR would crash.
export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(SESSION_STORAGE_KEY);
}

// Pass a token to sign in / stay signed in, or `null` to sign out (clears
// the stored value entirely rather than storing an empty string).
export function setStoredToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) window.localStorage.setItem(SESSION_STORAGE_KEY, token);
  else window.localStorage.removeItem(SESSION_STORAGE_KEY);
}

// The actual middleware: runs client-side, right before a server function
// call goes out over the network, and injects the Authorization header if
// (and only if) a token is currently stored — an unauthenticated call
// (e.g. login itself) just gets no extra header, which is fine since
// requireAuth only runs on functions that opt into it.
export const attachAuth = createMiddleware({ type: "function" }).client(async ({ next }) => {
  const token = getStoredToken();
  return next({ headers: token ? { Authorization: `Bearer ${token}` } : {} });
});
