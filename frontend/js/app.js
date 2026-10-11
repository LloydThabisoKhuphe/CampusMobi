/* =============================================================================
   app.js
   -----------------------------------------------------------------------------
   The root of the app. Two jobs:

     1. Define ROUTES — which path shows which page, whether sign-in is
        required, and whether the navbar should be shown.
     2. Re-render whenever the URL hash changes: check the auth guard, then
        hand off to the matching page's render function.

   Adding a new page is 3 steps: create js/pages/my-page.js, import it below,
   add one line to ROUTES.
   ============================================================================= */

import { navigate, parseHash, onRouteChange } from "./router.js";
import { Auth } from "./services/auth.js";
import { renderNavbar } from "./components/navbar.js";

import { renderLoginPage } from "./pages/login-page.js";
import { renderDashboardPage } from "./pages/dashboard-page.js";
import { renderServicesPage } from "./pages/services-page.js";
import { renderCardPage } from "./pages/card-page.js";
import { renderWalletPage } from "./pages/wallet-page.js";
import { renderCalendarPage } from "./pages/calendar-page.js";
import { renderMapPage } from "./pages/map-page.js";
import { renderNotificationsPage } from "./pages/notifications-page.js";

const ROUTES = {
  "/login": { render: renderLoginPage, protected: false, showNavbar: false },
  "/": { render: renderDashboardPage, protected: true, showNavbar: true },
  "/services": { render: renderServicesPage, protected: true, showNavbar: true },
  "/card": { render: renderCardPage, protected: true, showNavbar: true },
  "/wallet": { render: renderWalletPage, protected: true, showNavbar: true },
  "/calendar": { render: renderCalendarPage, protected: true, showNavbar: true },
  "/map": { render: renderMapPage, protected: true, showNavbar: true },
  "/notifications": { render: renderNotificationsPage, protected: true, showNavbar: true },
};

const appRoot = document.getElementById("app");

function renderRoute() {
  const { path, query } = parseHash();
  // Unknown path (e.g. a stale bookmark) falls back to the dashboard route,
  // which will itself redirect to /login if nobody is signed in.
  const route = ROUTES[path] || ROUTES["/"];

  if (route.protected && !Auth.isAuthenticated()) {
    navigate("/login?redirect=" + encodeURIComponent(path));
    return;
  }

  appRoot.innerHTML = "";

  if (route.showNavbar) {
    const navContainer = document.createElement("div");
    appRoot.appendChild(navContainer);
    renderNavbar(navContainer, path);
  }

  const pageContainer = document.createElement("div");
  appRoot.appendChild(pageContainer);
  route.render(pageContainer, query);
}

onRouteChange(renderRoute);
