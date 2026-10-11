// TanStack Start reads this file (if present) to configure two things that
// apply to EVERY server function call in the app: middleware that runs on
// every request, and middleware that runs on every function call. Deleting
// this file wouldn't break the build — Start just falls back to its own
// defaults — but we specifically need the CSRF middleware re-added (see
// below) and attachAuth wired in, so the file has to exist.
import { createStart, createCsrfMiddleware, createMiddleware } from "@tanstack/react-start";

import { renderErrorPage } from "./lib/platform/error-page";
// Application-layer DoS mitigation — rejects a single client's requests
// once they cross a per-minute cap, before any real work happens. See
// that file for the full explanation and its disclosed limitations.
import { rateLimitMiddleware } from "./lib/platform/rate-limit";
// Client-side middleware that reads the session token out of localStorage
// and attaches it as an Authorization header — see that file for detail.
// Registering it as global functionMiddleware below means every single
// server function call automatically carries the token, without each call
// site having to remember to attach it.
import { attachAuth } from "@/lib/frontend/auth-attacher";

// Runs on every request (requestMiddleware, below) server-side. Catches
// anything a server function throws that ISN'T already an intentional HTTP
// error (things like createServerFn's own validation errors carry a
// `statusCode` and are rethrown untouched, e.g. so a 401 still reaches the
// client as a 401) — an unexpected crash instead gets turned into the same
// friendly error page server.ts falls back to, rather than a raw stack
// trace or blank response reaching the browser.
const errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error; // an intentional HTTP error (e.g. 401 Unauthorized) — let it through as-is
    }
    console.error(error);
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

// Start installs a CSRF check automatically when src/start.ts is absent;
// defining this file opts out of that default, so it has to be re-added
// explicitly here — otherwise server functions (login, payments, etc.)
// would be callable cross-site with no protection at all.
const csrfMiddleware = createCsrfMiddleware({
  filter: (ctx) => ctx.handlerType === "serverFn",
});

// The actual export TanStack Start looks for. functionMiddleware wraps
// every createServerFn() call (client + server sides); requestMiddleware
// wraps every incoming HTTP request server-side.
export const startInstance = createStart(() => ({
  functionMiddleware: [attachAuth],
  // Order matters: rate limiting runs first so an over-limit request is
  // rejected as cheaply as possible, before the error middleware wraps it
  // or CSRF even looks at it.
  requestMiddleware: [rateLimitMiddleware, errorMiddleware, csrfMiddleware],
}));
