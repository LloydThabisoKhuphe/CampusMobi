/* =============================================================================
   components/navbar.js
   -----------------------------------------------------------------------------
   Appears at the top of every signed-in page. On narrow screens the middle
   links hide and a bottom tab bar (also built here) takes over — see
   navbar.css for the breakpoint.
   ============================================================================= */

import { navigate } from "../router.js";
import { Auth } from "../services/auth.js";
import { icon } from "./icons.js";

const NAV_LINKS = [
  { to: "/wallet", label: "Wallet" },
  { to: "/services", label: "Services" },
  { to: "/card", label: "Student Card" },
  { to: "/map", label: "Maps" },
];

const BOTTOM_TABS = [
  { to: "/", label: "Home", icon: "home" },
  { to: "/card", label: "ID card", icon: "id" },
  { to: "/wallet", label: "Wallet", icon: "wallet" },
  { to: "/map", label: "Map", icon: "map" },
];

function initialsFor(user) {
  return (user?.fullName || "G")
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/**
 * Renders the navbar + bottom tabs into `container` and wires up its
 * buttons. `currentPath` is used to highlight the active link.
 */
export function renderNavbar(container, currentPath) {
  const user = Auth.getCurrentUser();
  const isGuest = Auth.isGuest();

  container.innerHTML = `
    <nav class="navbar">
      <div class="navbar-logo" data-action="go-home"><span>campus</span><span>Mobi</span></div>

      <div class="navbar-links">
        ${NAV_LINKS.map(
          (link) => `
          <button class="navbar-link ${currentPath === link.to ? "active" : ""}" data-go="${link.to}">
            ${link.label}
          </button>`
        ).join("")}
      </div>

      <div class="navbar-right" style="position: relative;">
        <button class="navbar-bell" data-go="/notifications" aria-label="Notifications">
          ${icon("bell")}
          <span class="dot"></span>
        </button>

        <button class="navbar-profile" data-action="toggle-menu">
          <span class="navbar-avatar">${isGuest ? "G" : initialsFor(user)}</span>
          <span class="navbar-name">
            ${isGuest ? "Guest" : user?.fullName || "Student"}
            <small>${isGuest ? "Browsing" : user?.studentId || ""}</small>
          </span>
        </button>

        <div class="navbar-menu" data-menu hidden>
          ${isGuest ? '<button data-action="signin">Sign in for full access</button>' : ""}
          <button data-action="logout">Log out</button>
        </div>
      </div>
    </nav>

    <div class="bottom-nav">
      ${BOTTOM_TABS.map(
        (tab) => `
        <button class="bottom-nav-item ${currentPath === tab.to ? "active" : ""}" data-go="${tab.to}">
          ${icon(tab.icon)}
          ${tab.label}
        </button>`
      ).join("")}
    </div>
  `;


  //hjhjhh
 
  //hjhjh

  container.querySelectorAll("[data-go]").forEach((button) => {
    button.addEventListener("click", () => navigate(button.dataset.go));
  });

  container.querySelector('[data-action="go-home"]').addEventListener("click", () => navigate("/"));

  const menu = container.querySelector("[data-menu]");
  container.querySelector('[data-action="toggle-menu"]').addEventListener("click", () => {
    menu.hidden = !menu.hidden;
  });

  container.querySelector('[data-action="signin"]')?.addEventListener("click", () =>{
    Auth.logout(); //clear guest session
    navigate("/login");
  });

  container.querySelector('[data-action="logout"]')?.addEventListener("click", () => {
    Auth.logout();
    navigate("/login");
  });
}
