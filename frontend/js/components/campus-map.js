/* =============================================================================
   components/campus-map.js
   -----------------------------------------------------------------------------
   A simplified schematic campus layout — each pin sits at a percentage
   position within the canvas. No external mapping API is used, on purpose:
   it keeps the demo self-contained and fast.

   To reposition a building, tweak its {x, y} percentages below.
   ============================================================================= */

const MAP_PIN_POSITIONS = {
  lib: { x: 22, y: 30 },
  "hall-a": { x: 45, y: 20 },
  "hall-b": { x: 58, y: 22 },
  admin: { x: 72, y: 34 },
  cafeteria: { x: 35, y: 55 },
  residence: { x: 78, y: 60 },
  gym: { x: 55, y: 68 },
  "study-centre": { x: 20, y: 62 },
};

/**
 * Builds the map canvas element for the given locations. `onSelect(id)` is
 * called when a pin is clicked.
 */
export function createCampusMap({ locations, selectedId, onSelect }) {
  const canvas = document.createElement("div");
  canvas.className = "map-canvas";

  canvas.innerHTML = locations
    .map((location) => {
      const position = MAP_PIN_POSITIONS[location.id] || { x: 50, y: 50 };
      const isActive = location.id === selectedId;
      return `
        <button
          class="map-pin ${isActive ? "active" : ""}"
          style="left:${position.x}%; top:${position.y}%;"
          data-id="${location.id}"
          title="${location.name}"
        >
          <span class="map-pin-dot"><span>📍</span></span>
          <span class="map-pin-label">${location.name}</span>
        </button>`;
    })
    .join("");

  canvas.querySelectorAll(".map-pin").forEach((button) => {
    button.addEventListener("click", () => onSelect(button.dataset.id));
  });

  return canvas;
}
