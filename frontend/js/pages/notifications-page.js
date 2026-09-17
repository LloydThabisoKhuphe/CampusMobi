/* =============================================================================
   pages/notifications-page.js
   -----------------------------------------------------------------------------
   A list fetched from /api/catalog. Wire this up to a live notifications
   feed later by having the backend push/store real ones instead of the
   fixed list in backend/store/catalogData.js.
   ============================================================================= */

import { getCatalog } from "../services/catalog.js";

export async function renderNotificationsPage(container) {
  const { notifications } = await getCatalog();

  container.innerHTML = `
    <div class="page-shell">
      <h3 class="section-title">Notifications</h3>
      <div class="notif-list">
        ${notifications
          .map(
            (n) => `
          <div class="notif-item ${n.unread ? "unread" : ""}">
            <div class="notif-icon">🔔</div>
            <div>
              <div class="notif-title">${n.title}</div>
              <div class="notif-body">${n.body}</div>
              <div class="notif-time">${n.time}</div>
            </div>
          </div>`
          )
          .join("")}
      </div>
    </div>
  `;
}
