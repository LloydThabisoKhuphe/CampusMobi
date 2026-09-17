/* =============================================================================
   services/catalog.js
   -----------------------------------------------------------------------------
   The app's static content (services, campus locations, notifications, ...)
   comes from the backend now instead of being bundled into the frontend.
   It doesn't change while the app is open, so we fetch it once and cache it.
   ============================================================================= */

import { apiRequest } from "./api.js";

let cachedCatalog = null;

export async function getCatalog() {
  if (!cachedCatalog) {
    cachedCatalog = await apiRequest("/catalog");
  }
  return cachedCatalog;
}
