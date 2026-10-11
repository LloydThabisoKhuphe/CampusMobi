// A basic application-layer rate limiter — every request, regardless of
// which page or server function it's for, is counted against the IP that
// made it; once that IP crosses the limit within the current window, every
// further request gets rejected with 429 until the window resets. This is
// the app's mitigation for a (naive, single-attacker) denial-of-service
// attempt: one client hammering the server can't consume unbounded
// resources — MySQL connections, scrypt-hashing CPU time (see
// auth.server.ts), Gmail send quota (see email.server.ts) — because it
// gets cut off cheaply, before any of that work happens.
//
// Deliberately simple and dependency-free (a plain in-memory Map, fixed
// windows) rather than a production-grade sliding-window/token-bucket
// algorithm or an external store like Redis — appropriate for this app's
// scale, and easy to explain end-to-end. Known limitations, worth stating
// plainly rather than glossing over:
//   - Per Node process: state resets on every restart, and would NOT be
//     shared across multiple server instances behind a load balancer.
//     A real production deployment would move this to a shared store
//     (Redis, etc.) or handle it at the infrastructure layer (a CDN/WAF)
//     instead of in application code.
//   - IP-based: relies on X-Forwarded-For when present (set by most
//     reverse proxies/PaaS platforms) or the raw connection address
//     otherwise. A distributed attack spreading requests across many IPs,
//     or a client behind a shared NAT/proxy, isn't fully addressed by this
//     alone — real-world DoS defence typically also involves network-level
//     filtering upstream of the application.
// These are the same kind of disclosed, deliberate simplification as the
// items in README.md's "Known simplifications" section.
import { createMiddleware } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";

const WINDOW_MS = 60_000; // 1-minute fixed windows
const MAX_REQUESTS_PER_WINDOW = 120; // generous enough for normal use (page loads pull in several server-function calls at once), tight enough to stop a flood

// key -> { count of requests seen this window, when the window started }.
// A plain object, not a class, since this is the only thing this module
// exports state for.
const hits = new Map<string, { count: number; windowStart: number }>();

// Extracts a best-effort client identifier from the request. X-Forwarded-For
// (set by most reverse proxies / hosting platforms) is preferred since the
// raw socket address is often the proxy's own address, not the real
// client's; falls back to a constant key if neither is available (e.g.
// local dev with no proxy in front) — meaning in that specific case the
// limit applies globally rather than per-client, which is an acceptable
// trade-off for a dev/demo environment.
function getClientKey(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim(); // first entry = original client, when a chain of proxies is present
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;
  return "unknown"; // no proxy headers present — see the module comment above
}

export const rateLimitMiddleware = createMiddleware().server(async ({ next }) => {
  const request = getRequest();
  const key = getClientKey(request);
  const now = Date.now();

  const entry = hits.get(key);
  if (!entry || now - entry.windowStart >= WINDOW_MS) {
    // No record yet, or the previous window has expired — start a fresh one.
    // (Lazy expiry: there's no background timer sweeping old entries; a
    // key is only ever re-evaluated the next time that same client makes
    // a request, which is enough to keep memory bounded in practice for
    // this app's scale.)
    hits.set(key, { count: 1, windowStart: now });
    return next();
  }

  entry.count += 1;
  if (entry.count > MAX_REQUESTS_PER_WINDOW) {
    const retryAfterSeconds = Math.ceil((entry.windowStart + WINDOW_MS - now) / 1000);
    return new Response(
      JSON.stringify({ error: "Too many requests — please slow down and try again shortly." }),
      {
        status: 429,
        headers: {
          "content-type": "application/json",
          "retry-after": String(retryAfterSeconds),
        },
      },
    );
  }

  return next();
});
