/* =============================================================================
   services/auth.js
   -----------------------------------------------------------------------------
   Tracks "who is signed in?" on the frontend. The real decisions (is this
   username/password OK, what does a guest look like) are made by the
   backend — this file just calls it and remembers the result.

   The pattern every page uses:
     Auth.isAuthenticated()   -> true/false, read synchronously
     Auth.getCurrentUser()    -> the cached user object, or null
     await Auth.login(...)    -> signs in, throws on failure
     await Auth.loginAsGuest()
     Auth.logout()
   ============================================================================= */

import { apiRequest, setToken, clearToken, getToken } from "./api.js";

const USER_KEY = "campusmobi_user";

function readCachedUser() {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null; // corrupted storage — treat as "logged out"
  }
}

function cacheUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  return user;
}

export const Auth = {
  getCurrentUser() {
    return getToken() ? readCachedUser() : null;
  },

  isAuthenticated() {
    return !!this.getCurrentUser();
  },

  isGuest() {
    return !!this.getCurrentUser()?.isGuest;
  },

  async login(username, password) {
    const { user, token } = await apiRequest("/auth/login", {
      method: "POST",
      body: { username, password },
    });
    setToken(token);
    return cacheUser(user);
  },

  async loginAsGuest() {
    const { user, token } = await apiRequest("/auth/guest", { method: "POST" });
    setToken(token);
    return cacheUser(user);
  },

  logout() {
    // Tell the server too, so the token can't be reused — but don't block
    // the UI on it, and don't worry if it fails (token may already be gone).
    apiRequest("/auth/logout", { method: "POST" }).catch(() => {});
    clearToken();
    localStorage.removeItem(USER_KEY);
  },
};
