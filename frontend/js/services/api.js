/* =============================================================================
   services/api.js
   -----------------------------------------------------------------------------
   The one place that knows how to talk to the Express backend. Every other
   file calls `apiRequest(...)` instead of using fetch() directly, so if the
   API's base URL or auth scheme ever changes, this is the only file to edit.
   ============================================================================= */

const BASE_URL = "/api";
const TOKEN_KEY = "campusmobi_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * Calls the backend and returns the parsed JSON body.
 * Throws an Error (with a user-friendly message) on any non-2xx response.
 */
export async function apiRequest(path, { method = "GET", body } = {}) {
  const headers = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(BASE_URL + path, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  // 204 No Content has no body to parse.
  if (response.status === 204) return null;

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "Something went wrong. Please try again.");
  }
  return data;
}
