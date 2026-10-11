/* =============================================================================
   pages/card-page.js
   -----------------------------------------------------------------------------
   The virtual student ID card. Guests see a "sign in to unlock" message
   instead — the pattern used on every guest-restricted page in this app.
   ============================================================================= */

import { navigate } from "../router.js";
import { Auth } from "../services/auth.js";
import { getCatalog } from "../services/catalog.js";

export async function renderCardPage(container) {
  const user = Auth.getCurrentUser();
  const isGuest = Auth.isGuest();
  const { appInfo } = await getCatalog();

  container.innerHTML = `
    <div class="page-shell">
      <h3 class="section-title">Student Card</h3>

      ${
        isGuest
          ? `
        <div class="card-lock">
          Sign in with your student account to view your Virtual Student Card and QR access code.
          <div style="margin-top:14px;">
            <button class="btn btn-primary btn-sm" data-action="signin">Sign in</button>
          </div>
        </div>`
          : `
        <div class="card-wrap">
          <div class="student-card">
            <div class="card-top">
              <div class="card-logo"><span>campus</span><span>Mobi</span></div>
              <span class="card-role">${user?.role || "Student"}</span>
            </div>
            <div class="card-body">
              <div class="card-name">${user?.fullName}</div>
              <div class="card-id">${appInfo.university}</div>
              <div class="card-bottom">
                <div class="card-qr" aria-label="QR access code"></div>
                <div class="card-meta">
                  <strong>${user?.studentId}</strong>
                  Valid — session active
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="card-actions">
          <button class="btn btn-ghost">Download</button>
          <button class="btn btn-primary">Show at scanner</button>
        </div>`
      }
    </div>
  `;

  container.querySelector('[data-action="signin"]')?.addEventListener("click", () => navigate("/login"));
}
