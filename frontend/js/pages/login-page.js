/* =============================================================================
   pages/login-page.js
   -----------------------------------------------------------------------------
   The only public page in the app — every other route requires a session
   (see the ROUTES table + protection check in app.js).
   ============================================================================= */

import { navigate } from "../router.js";
import { Auth } from "../services/auth.js";
import { getCatalog } from "../services/catalog.js";

const SOCIAL_ICON_SVGS = {
  facebook:
    '<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12.06C22 6.51 17.52 2 12 2S2 6.51 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.51 1.49-3.9 3.77-3.9 1.09 0 2.24.2 2.24.2v2.47h-1.26c-1.24 0-1.63.78-1.63 1.58v1.86h2.78l-.44 2.91h-2.34V22c4.78-.76 8.44-4.92 8.44-9.94Z" /></svg>',
  google:
    '<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M21.35 11.1H12v2.9h5.35c-.24 1.4-1.68 4.1-5.35 4.1-3.22 0-5.85-2.67-5.85-5.95S8.78 6.2 12 6.2c1.83 0 3.06.78 3.76 1.45l2.56-2.47C16.77 3.6 14.6 2.7 12 2.7 6.98 2.7 2.9 6.86 2.9 12.1S6.98 21.5 12 21.5c6.92 0 9.35-4.86 9.35-8.86 0-.6-.06-1.04-.14-1.54Z" /></svg>',
  x: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.24 2.75h3.05l-6.66 7.61L22.5 21.25h-6.14l-4.8-6.28-5.5 6.28H2.99l7.13-8.15L2 2.75h6.29l4.34 5.74 5.61-5.74Zm-1.07 16.66h1.69L7.9 4.49H6.08l11.09 14.92Z" /></svg>',
};

export async function renderLoginPage(container, query) {
  const redirectTo = query.get("redirect") || "/";

  // Already signed in (e.g. hit /login directly)? Bounce straight to the app.
  if (Auth.isAuthenticated()) {
    navigate(redirectTo);
    return;
  }

  const { appInfo, features } = await getCatalog();

  // ---- local state kept in closures, redrawn with draw() on change -------
  let username = "";
  let password = "";
  let error = "";
  let infoMessage = "";
  let submitting = false;
  let guestLoading = false;

  function draw() {
    container.innerHTML = `
      <div class="login-screen">
        <div class="login-blob login-blob--tr" aria-hidden="true"></div>
        <div class="login-blob login-blob--bl" aria-hidden="true"></div>

        <div class="login-topbar">
          <div class="login-logo"><span>campus</span><span>Mobi</span></div>
          <button type="button" class="signup-btn" data-action="signup">Sign Up ...</button>
        </div>

        <div class="login-stage">
          <div class="login-card">
            <h1>Sign In</h1>

            ${error ? `<div class="error-banner">${error}</div>` : ""}
            ${
              infoMessage && !error
                ? `<div class="error-banner" style="color:var(--lime);border-color:rgba(215,242,58,0.4);background:rgba(215,242,58,0.08);">${infoMessage}</div>`
                : ""
            }

            <form class="login-form" novalidate>
              <input class="field" type="text" placeholder="User Name ..." name="username" value="${username}" autocomplete="username" />
              <input class="field" type="password" placeholder="Password ..." name="password" value="${password}" autocomplete="current-password" />

              <button type="button" class="forgot-link" data-action="forgot">forgot password?</button>

              <button type="submit" class="signin-btn" ${submitting ? "disabled" : ""}>
                ${submitting ? "Signing in ..." : "Sign In ..."}
              </button>
            </form>

            ${
              features.enableGuestMode
                ? `
              <div class="divider-row"><div class="line"></div><span>or</span><div class="line"></div></div>
              <button type="button" class="guest-btn" data-action="guest" ${guestLoading ? "disabled" : ""}>
                ${guestLoading ? "Setting up guest session ..." : "Continue as Guest"}
              </button>`
                : ""
            }

            <div class="social-row">
              <button type="button" class="social-item" data-action="social-facebook">
                <span class="social-circle">${SOCIAL_ICON_SVGS.facebook}</span> Facebook
              </button>
              <button type="button" class="social-item" data-action="social-google">
                <span class="social-circle">${SOCIAL_ICON_SVGS.google}</span> Google
              </button>
              <button type="button" class="social-item" data-action="social-x">
                <span class="social-circle">${SOCIAL_ICON_SVGS.x}</span> X
              </button>
            </div>
          </div>
        </div>

        <div style="position:relative;z-index:2;text-align:center;color:var(--text-faint);font-size:0.78rem;padding-bottom:18px;">
          ${appInfo.university} · ${appInfo.domain}
        </div>
      </div>
    `;

    bind();
  }

  function bind() {
    const usernameInput = container.querySelector('input[name="username"]');
    const passwordInput = container.querySelector('input[name="password"]');
    usernameInput.addEventListener("input", (e) => (username = e.target.value));
    passwordInput.addEventListener("input", (e) => (password = e.target.value));

    container.querySelector(".login-form").addEventListener("submit", handleSubmit);
    container.querySelector('[data-action="forgot"]').addEventListener("click", handleForgotPassword);
    container.querySelector('[data-action="signup"]')?.addEventListener("click", () => {
      infoMessage = "Sign-up isn't open yet — try Continue as Guest to explore CampusMobi.";
      error = "";
      draw();
    });
    container.querySelector('[data-action="guest"]')?.addEventListener("click", handleGuest);

    container.querySelector('[data-action="social-facebook"]').addEventListener("click", () => showInfo("Facebook sign-in isn't connected yet."));
    container.querySelector('[data-action="social-google"]').addEventListener("click", () => showInfo("Google sign-in isn't connected yet."));
    container.querySelector('[data-action="social-x"]').addEventListener("click", () => showInfo("X sign-in isn't connected yet."));
  }

  function showInfo(message) {
    infoMessage = message;
    error = "";
    draw();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    error = "";
    if (!username.trim() || !password) {
      error = "Please enter both a username and a password.";
      draw();
      return;
    }
    submitting = true;
    draw();
    try {
      await Auth.login(username.trim(), password);
      navigate(redirectTo);
    } catch (err) {
      submitting = false;
      error = err.message;
      draw();
    }
  }

  async function handleGuest() {
    error = "";
    guestLoading = true;
    draw();
    try {
      await Auth.loginAsGuest();
      navigate("/");
    } catch {
      guestLoading = false;
      error = "Couldn't start a guest session. Please try again.";
      draw();
    }
  }

  function handleForgotPassword() {
    infoMessage = "";
    if (!username.trim()) {
      error = "Enter your username above first, then tap 'forgot password?'.";
      draw();
      return;
    }
    error = "";
    infoMessage = `If an account exists for "${username.trim()}", reset instructions were sent.`;
    draw();
  }

  draw();
}
