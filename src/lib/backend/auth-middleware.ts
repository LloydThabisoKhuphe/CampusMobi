// Server-side middleware: resolves the bearer session token attached by
// auth-attacher.ts (the client-side counterpart) into a userId + a ready-
// to-use db handle, and hands both to the handler via `context`. Every
// protected server function in campus.functions.ts starts with
// `.middleware([requireAuth])` — that's what wires this in.
// db.server.ts (the MySQL connection pool) is only ever dynamically
// imported here, inside the .server() callback — never at module scope —
// so it's safe for this file to be imported top-level by client-shipped
// modules (importing a *.server.ts file at module scope would pull its
// code into the client bundle; the dynamic import avoids that).
import { createMiddleware } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";

// `{ type: "function" }` scopes this middleware to server-function calls
// specifically (as opposed to `requestMiddleware` in src/start.ts, which
// runs on every raw HTTP request including page loads).
export const requireAuth = createMiddleware({ type: "function" }).server(async ({ next }) => {
  // getRequest() reads the underlying HTTP request TanStack Start is
  // currently handling — this is how server-function middleware gets at
  // headers, even though the function signature itself doesn't take one.
  const request = getRequest();
  const authHeader = request?.headers?.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    // No token at all, or not in the expected "Bearer <token>" shape —
    // reject before even touching the database.
    throw new Error("Unauthorized: No session token provided");
  }
  const token = authHeader.slice("Bearer ".length); // strip the "Bearer " prefix, keep just the token
  if (!token) throw new Error("Unauthorized: No session token provided");

  const { resolveSession } = await import("./auth.server");
  const { db } = await import("./db.server");

  const userId = await resolveSession(token); // null if the token is missing/unknown/expired
  if (!userId) throw new Error("Unauthorized: Invalid or expired session");

  // Everything after `next({ context: ... })` in a handler that uses this
  // middleware can destructure `{ db, userId, token }` straight off
  // `context` — see any handler in campus.functions.ts for the pattern.
  return next({ context: { db, userId, token } });
});
