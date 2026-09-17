/* =============================================================================
   router.js
   -----------------------------------------------------------------------------
   A tiny router built on the URL hash (the part after "#"), e.g. "#/wallet".
   No dependency, ~25 lines, does three jobs:

     1. Turn the current hash into a { path, query } object pages can read.
     2. Let app.js re-render whenever the hash changes (back/forward work).
     3. Provide navigate(path) so any page can change route in code.
   ============================================================================= */

export function parseHash() {
  const hash = window.location.hash.slice(1) || "/"; // drop the leading "#"
  const [path, queryString] = hash.split("?");
  return {
    path: path || "/",
    query: new URLSearchParams(queryString || ""),
  };
}

export function navigate(path) {
  window.location.hash = path;
}

// Calls `handler` once immediately, then again every time the hash changes.
export function onRouteChange(handler) {
  window.addEventListener("hashchange", handler);
  window.addEventListener("DOMContentLoaded", handler);
}
