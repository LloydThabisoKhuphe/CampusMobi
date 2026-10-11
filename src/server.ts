// The actual HTTP entry point in production (nitro's "node-server" preset,
// pinned in vite.config.ts, calls this file's default export for every
// request). Its only job beyond handing off to TanStack Start's real
// handler is making sure a crash never reaches the browser as a raw JSON
// error or a blank page — see ./lib/platform/error-page.ts for what the
// person actually sees instead.
import "./lib/platform/error-capture"; // side-effect import: wraps console.error globally, see that file

import { consumeLastCapturedError } from "./lib/platform/error-capture";
import { renderErrorPage } from "./lib/platform/error-page";

// The shape of TanStack Start's built server handler — we don't control
// this type, we're just describing what we import below.
type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

// Imported lazily (not at module top-level) and cached in this module-scope
// variable, so the (fairly expensive) server-entry module is only loaded
// once per server process, on the first request, not at boot.
let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 (the HTTP library TanStack Start builds on) swallows in-handler throws
// into a normal-looking 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — so a plain try/catch around
// handler.fetch() below never fires for those; we have to inspect the
// *response* itself to notice this happened.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response; // not an error response — nothing to do
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response; // a real error page, not h3's swallowed one

  const body = await response.clone().text(); // .clone() — response.text() can only be read once
  if (!isH3SwallowedErrorBody(body)) return response;

  // error-capture.ts's console.error wrapper recorded the real error object
  // (with a stack trace) a moment ago, just before h3 swallowed it — recover
  // it here so the log has something useful instead of just "HTTPError".
  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

// Checks whether a JSON response body matches h3's specific "I swallowed an
// unhandled error" shape, as opposed to some other legitimate JSON 500.
function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false; // not JSON at all — definitely not h3's shape
  }
}

// The actual request handler nitro calls. Three layers of safety net, from
// innermost to outermost: (1) normal responses pass straight through,
// (2) normalizeCatastrophicSsrResponse catches h3's swallowed-error shape,
// (3) the try/catch here catches anything that throws instead of returning
// a Response at all (e.g. the server-entry module itself failing to load).
export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
