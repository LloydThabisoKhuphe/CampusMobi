/* =============================================================================
   pages/calendar-page.js
   -----------------------------------------------------------------------------
   Pick a day on the mini calendar, see/add/remove events for that day.
   Events live on the server (per signed-in user) — see services/calendar.js.
   Guests can view today's events but can't add or remove them.
   ============================================================================= */

import { Auth } from "../services/auth.js";
import { getEvents, addEvent as apiAddEvent, deleteEvent as apiDeleteEvent } from "../services/calendar.js";
import { createMiniCalendar } from "../components/mini-calendar.js";

function toDateKey(date) {
  return date.toISOString().slice(0, 10);
}

export async function renderCalendarPage(container) {
  const isGuest = Auth.isGuest();

  container.innerHTML = `<div class="page-shell"><h3 class="section-title">Calendar</h3><p class="muted">Loading ...</p></div>`;

  let eventsByDay;
  try {
    eventsByDay = await getEvents();
  } catch {
    container.querySelector(".page-shell").innerHTML += `<div class="error-banner">Couldn't load your calendar. Please try again.</div>`;
    return;
  }

  let selectedDate = new Date();
  let time = "";
  let title = "";

  const pageShell = container.querySelector(".page-shell");
  pageShell.innerHTML = `
    <h3 class="section-title">Calendar</h3>
    <div class="cal-layout">
      <div data-slot="calendar"></div>

      <div class="cal-events-card">
        <div class="cal-events-header"><h3 data-slot="day-label"></h3></div>

        ${
          isGuest
            ? `<p class="cal-empty">Sign in to add or edit calendar events. You can still view today's schedule on the dashboard.</p>`
            : `
          <form class="event-form">
            <input class="field" type="time" name="time" required />
            <input class="field" type="text" placeholder="Event title ..." name="title" required />
            <button type="submit" class="btn btn-primary btn-sm">Add</button>
          </form>`
        }

        <div data-slot="events-list"></div>
      </div>
    </div>
  `;

  // --- Mini calendar: mounted once, tells us when the selected day changes ---
  const calendarSlot = pageShell.querySelector('[data-slot="calendar"]');
  calendarSlot.appendChild(
    createMiniCalendar({
      selectedDate,
      onSelectDate: (date) => {
        selectedDate = date;
        drawDayArea();
      },
    })
  );

  // --- Event form: bound once so the inputs never lose focus while typing ---
  if (!isGuest) {
    const form = pageShell.querySelector(".event-form");
    form.querySelector('input[name="time"]').addEventListener("input", (e) => (time = e.target.value));
    form.querySelector('input[name="title"]').addEventListener("input", (e) => (title = e.target.value));
    form.addEventListener("submit", handleAddEvent);
  }

  async function handleAddEvent(e) {
    e.preventDefault();
    if (!title.trim() || !time) return;
    eventsByDay = await apiAddEvent(toDateKey(selectedDate), time, title.trim());
    time = "";
    title = "";
    const form = pageShell.querySelector(".event-form");
    form.querySelector('input[name="time"]').value = "";
    form.querySelector('input[name="title"]').value = "";
    drawDayArea();
  }

  async function handleDeleteEvent(id) {
    eventsByDay = await apiDeleteEvent(toDateKey(selectedDate), id);
    drawDayArea();
  }

  // --- Day-dependent parts: header label + events list -----------------------
  function drawDayArea() {
    const dayKey = toDateKey(selectedDate);
    const dayEvents = (eventsByDay[dayKey] || []).slice().sort((a, b) => a.time.localeCompare(b.time));

    pageShell.querySelector('[data-slot="day-label"]').textContent = selectedDate.toLocaleDateString("en-US", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });

    const listSlot = pageShell.querySelector('[data-slot="events-list"]');
    listSlot.innerHTML =
      dayEvents.length === 0
        ? `<p class="cal-empty">No events for this day.</p>`
        : dayEvents
            .map(
              (ev) => `
          <div class="event-item">
            <span class="event-time">${ev.time}</span>
            <span class="event-title">${ev.title}</span>
            ${!isGuest ? `<button class="event-delete" data-id="${ev.id}">Remove</button>` : ""}
          </div>`
            )
            .join("");

    listSlot.querySelectorAll(".event-delete").forEach((button) => {
      button.addEventListener("click", () => handleDeleteEvent(button.dataset.id));
    });
  }

  drawDayArea();
}
