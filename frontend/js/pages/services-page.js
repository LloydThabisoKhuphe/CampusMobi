/* =============================================================================
   pages/services-page.js
   -----------------------------------------------------------------------------
   Grid of campus services. Reached either from the nav bar or from the
   Dashboard's search box (which passes ?q=... in the URL).

   Note: only the results grid is redrawn on every keystroke — the search
   input itself is built once, so it never loses focus while you type.
   ============================================================================= */

import { navigate } from "../router.js";
import { getCatalog } from "../services/catalog.js";

export async function renderServicesPage(container, query) {
  const { services, serviceCategories } = await getCatalog();

  let search = query.get("q") || "";
  let category = "All";

  container.innerHTML = `
    <div class="page-shell">
      <div class="services-search">
        <input class="field" placeholder="Search ..." name="search" value="${search}" />
        <button class="btn btn-primary" type="button">Search</button>
      </div>

      <div class="services-toolbar">
        <h3>Our services:</h3>
        <select name="category">
          ${serviceCategories.map((c) => `<option value="${c}">${c === "All" ? "filter by" : c}</option>`).join("")}
        </select>
      </div>

      <div data-slot="results"></div>
    </div>
  `;

  const resultsSlot = container.querySelector('[data-slot="results"]');

  function renderResults() {
    const filtered = services.filter((service) => {
      const matchesSearch = service.title.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === "All" || service.category === category;
      return matchesSearch && matchesCategory;
    });

    resultsSlot.innerHTML =
      filtered.length === 0
        ? `<div class="services-empty">No services match "${search}".</div>`
        : `<div class="services-grid">
            ${filtered
              .map(
                (service) => `
              <button class="service-card" data-route="${service.route || ""}">
                <div class="service-visual">${service.icon}</div>
                <div class="service-body">
                  <div class="service-title">${service.title}</div>
                  <div class="service-desc">${service.description}</div>
                </div>
              </button>`
              )
              .join("")}
          </div>`;

    resultsSlot.querySelectorAll(".service-card").forEach((card) => {
      card.addEventListener("click", () => {
        if (card.dataset.route) navigate(card.dataset.route);
      });
    });
  }

  container.querySelector('input[name="search"]').addEventListener("input", (e) => {
    search = e.target.value;
    renderResults();
  });
  container.querySelector('select[name="category"]').addEventListener("change", (e) => {
    category = e.target.value;
    renderResults();
  });

  renderResults();
}
