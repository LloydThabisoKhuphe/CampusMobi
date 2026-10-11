/* =============================================================================
   components/mini-calendar.js
   -----------------------------------------------------------------------------
   A small month-grid calendar. Purely presentational — it just tells its
   caller which date got clicked via onSelectDate. Used on both the
   Dashboard (preview) and the Calendar page (full view).

   Usage:
     const calendarEl = createMiniCalendar({
       selectedDate: someDate,
       onSelectDate: (date) => { ... },
     });
     container.appendChild(calendarEl);
   ============================================================================= */

const WEEKDAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

// Builds the 42 grid cells (6 weeks) for a given month, including the
// trailing days of the previous/next month so the grid is always full.
function buildMonthGrid(year, monthIndex) {
  const firstOfMonth = new Date(year, monthIndex, 1);
  const firstWeekday = (firstOfMonth.getDay() + 6) % 7; // convert Sun-first to Mon-first
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, monthIndex, 0).getDate();

  const cells = [];
  for (let i = firstWeekday - 1; i >= 0; i--) {
    cells.push({ day: daysInPrevMonth - i, current: false });
  }
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({ day, current: true });
  }
  while (cells.length < 42) {
    cells.push({ day: cells.length - (firstWeekday + daysInMonth) + 1, current: false });
  }
  return cells;
}

function isSameDay(a, b) {
  return a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();
}

export function createMiniCalendar({ selectedDate, onSelectDate }) {
  let viewDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
  const today = new Date();

  const wrapper = document.createElement("div");
  wrapper.className = "mini-cal";

  function render() {
    const cells = buildMonthGrid(viewDate.getFullYear(), viewDate.getMonth());
    const monthLabel = viewDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });

    wrapper.innerHTML = `
      <div class="mini-cal-header">
        <button data-action="prev" aria-label="Previous month">‹</button>
        <span>${monthLabel}</span>
        <button data-action="next" aria-label="Next month">›</button>
      </div>

      <div class="mini-cal-grid mini-cal-labels">
        ${WEEKDAY_LABELS.map((label) => `<span>${label}</span>`).join("")}
      </div>

      <div class="mini-cal-grid">
        ${cells
          .map((cell, idx) => {
            const cellDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), cell.day);
            const classes = [
              "mini-cal-cell",
              cell.current ? "" : "muted-cell",
              cell.current && isSameDay(cellDate, selectedDate) ? "selected" : "",
              cell.current && isSameDay(cellDate, today) ? "today" : "",
            ]
              .join(" ")
              .trim();
            return `<button class="${classes}" data-idx="${idx}" data-day="${cell.day}" data-current="${cell.current}">${cell.day}</button>`;
          })
          .join("")}
      </div>
    `;

    wrapper.querySelector('[data-action="prev"]').addEventListener("click", () => {
      viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1);
      render();
    });
    wrapper.querySelector('[data-action="next"]').addEventListener("click", () => {
      viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1);
      render();
    });

    wrapper.querySelectorAll(".mini-cal-cell").forEach((button) => {
      if (button.dataset.current !== "true") return;
      button.addEventListener("click", () => {
        const day = Number(button.dataset.day);
        onSelectDate(new Date(viewDate.getFullYear(), viewDate.getMonth(), day));
      });
    });
  }

  render();
  return wrapper;
}
