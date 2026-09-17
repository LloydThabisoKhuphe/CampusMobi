/* =============================================================================
   pages/map-page.js
   -----------------------------------------------------------------------------
   Search/filter campus locations, see them on the schematic map, and tap
   either a pin or a list row to view details.

   Note: only the map + list are redrawn on every keystroke — the search
   input is built once, so it never loses focus while you type.
   ============================================================================= */

import { getCatalog } from "../services/catalog.js";
import { createCampusMap } from "../components/campus-map.js";

export async function renderMapPage(container) {
  const { locations } = await getCatalog();
  const categories = ["All", ...new Set(locations.map((l) => l.category))];

  let search = "";
  let category = "All";
  let selectedId = locations[0]?.id;

  container.innerHTML = `
    <div class="page-shell">
      <h3 class="section-title">Campus Map</h3>

      <div class="map-toolbar">
        <input class="field" placeholder="Search lecture halls, library, offices ..." name="search" />
        <select name="category">
          ${categories.map((c) => `<option value="${c}">${c}</option>`).join("")}
        </select>
      </div>

      <div class="map-layout">
        <div>
          <div data-slot="map"></div>
          <div data-slot="detail"></div>
        </div>
        <div class="map-list" data-slot="list"></div>
      </div>
    </div>
  `;

  const mapSlot = container.querySelector('[data-slot="map"]');
  const detailSlot = container.querySelector('[data-slot="detail"]');
  const listSlot = container.querySelector('[data-slot="list"]');

  function filteredLocations() {
    return locations.filter((location) => {
      const matchesSearch = location.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === "All" || location.category === category;
      return matchesSearch && matchesCategory;
    });
  }

  function draw() {
    const filtered = filteredLocations();
    const selected = locations.find((l) => l.id === selectedId);

    mapSlot.innerHTML = "";
    mapSlot.appendChild(
      createCampusMap({
        locations: filtered,
        selectedId,
        onSelect: (id) => {
          selectedId = id;
          draw();
        },
      })
    );

    detailSlot.innerHTML = selected ? `<div class="map-detail"><h4>${selected.name}</h4><p>${selected.info}</p></div>` : "";

    listSlot.innerHTML =
      filtered.length === 0
        ? `<div style="padding:20px;color:var(--text-faint);">No locations match your search.</div>`
        : filtered
            .map(
              (location) => `
          <button class="map-list-item ${location.id === selectedId ? "active" : ""}" data-id="${location.id}">
            <div class="map-list-name">${location.name}</div>
            <div class="map-list-category">${location.category}</div>
          </button>`
            )
            .join("");

    listSlot.querySelectorAll(".map-list-item").forEach((button) => {
      button.addEventListener("click", () => {
        selectedId = button.dataset.id;
        draw();
      });
    });
  }

  container.querySelector('input[name="search"]').addEventListener("input", (e) => {
    search = e.target.value;
    draw();
  });
  container.querySelector('select[name="category"]').addEventListener("change", (e) => {
    category = e.target.value;
    draw();
  });

  draw();
}
