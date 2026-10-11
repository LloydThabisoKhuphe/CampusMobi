/* =============================================================================
   pages/dashboard-page.js
   -----------------------------------------------------------------------------
   The home screen — first thing a signed-in user sees.
   ============================================================================= */

import { navigate } from "../router.js";
import { Auth } from "../services/auth.js";
import { getCatalog } from "../services/catalog.js";
import { createMiniCalendar } from "../components/mini-calendar.js";

const QUICK_ACTIONS = [
  { to: "/card", label: "Student Card", icon: "🪪" },
  { to: "/wallet", label: "Wallet", icon: "👛" },
  { to: "/map", label: "Maps", icon: "🗺️" },
];

export async function renderDashboardPage(container) {
  const user = Auth.getCurrentUser();
  const isGuest = Auth.isGuest();
  const { announcements, todaySchedule } = await getCatalog();

  let selectedDate = new Date();
  let search = "";

  container.innerHTML = `
    <div class="page-shell">
      <div class="dash-welcome">
        <div>
          <h2>Welcome back, <b>${isGuest ? "Guest" : user?.fullName?.split(" ")[0] || "Student"}</b></h2>
          <p>${isGuest ? "You're browsing as a guest — sign in for wallet & card access." : `Student ID: ${user?.studentId}`}</p>
        </div>
        ${isGuest ? `<button class="btn btn-primary btn-sm" data-action="signin">Sign in for full access</button>` : ""}
      </div>

      <form class="dash-search">
        <input class="field" placeholder="Search services, locations, events ..." name="search" />
        <button type="submit" class="btn btn-primary">Search</button>
      </form>

      <h3 class="section-title">Quick Actions</h3>
      <div class="quick-actions-grid">
        ${QUICK_ACTIONS.map(
          (action) => `
          <button class="quick-action-card" data-go="${action.to}">
            <div class="quick-action-visual" style="font-size:2.2rem;">${action.icon}</div>
            <div class="quick-action-label">${action.label}</div>
          </button>`
        ).join("")}
      </div>

      <div class="dash-lower">
        <div data-slot="calendar"></div>

        <div class="schedule-card">
          <h3 class="section-title">Today's Schedule</h3>
          ${
            todaySchedule.length === 0
              ? `<p class="schedule-empty">Nothing scheduled today.</p>`
              : todaySchedule
                  .map(
                    (item) => `
                  <div class="schedule-item">
                    <span class="schedule-time">${item.time}</span>
                    <span class="schedule-title">${item.title}</span>
                  </div>`
                  )
                  .join("")
          }
        </div>
      </div>

      <div class="announcements-section">
        <h3 class="section-title">Announcements</h3>
        ${announcements
          .map(
            (a) => `
          <div class="announcement-item">
            <div class="announcement-icon">🔔</div>
            <div>
              <div class="announcement-title">${a.title}</div>
              <div class="announcement-date">${a.date}</div>
            </div>
          </div>`
          )
          .join("")}
      </div>
    </div>
  `;

  // Mini calendar is its own interactive widget — mount it into its slot.
  const calendarSlot = container.querySelector('[data-slot="calendar"]');
  calendarSlot.appendChild(
    createMiniCalendar({
      selectedDate,
      onSelectDate: (date) => {
        selectedDate = date;
      },
    })
  );

  container.querySelector('[data-action="signin"]')?.addEventListener("click", () => navigate("/login"));
  container.querySelectorAll("[data-go]").forEach((btn) => btn.addEventListener("click", () => navigate(btn.dataset.go)));

  const searchInput = container.querySelector('input[name="search"]');
  searchInput.addEventListener("input", (e) => (search = e.target.value));
  container.querySelector(".dash-search").addEventListener("submit", (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/services?q=${encodeURIComponent(search.trim())}`);
  });
}
