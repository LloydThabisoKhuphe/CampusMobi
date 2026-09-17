/**
 * server.js
 * ---------------------------------------------------------------------------
 * Entry point. Two jobs:
 *
 *   1. Serve the frontend (the plain HTML/CSS/JS in ../frontend) as static
 *      files — so opening one URL gets you the whole app.
 *   2. Expose the JSON API the frontend's JavaScript calls with fetch():
 *        /api/auth      - sign in / guest / sign out
 *        /api/wallet    - balance, top up, pay
 *        /api/calendar  - view/add/delete events
 *        /api/catalog   - services, campus locations, notifications, ...
 *
 * Run it with:  npm install   then   npm start
 * Then open:    http://localhost:3000
 */

const path = require("path");
const express = require("express");

const authRoutes = require("./routes/auth");
const walletRoutes = require("./routes/wallet");
const calendarRoutes = require("./routes/calendar");
const catalogRoutes = require("./routes/catalog");

const app = express();
const PORT = process.env.PORT || 3000;
const FRONTEND_DIR = path.join(__dirname, "..", "frontend");

app.use(express.json());

// --- API routes -------------------------------------------------------------
app.use("/api/auth", authRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/calendar", calendarRoutes);
app.use("/api/catalog", catalogRoutes);

// --- Frontend (static files) -------------------------------------------------
app.use(express.static(FRONTEND_DIR));

// Anything that isn't an API call or a real file falls back to index.html,
// so the frontend's own hash-based router (js/router.js) can take over.
app.get(/^(?!\/api).*/, (_req, res) => {
  res.sendFile(path.join(FRONTEND_DIR, "index.html"));
});

app.listen(PORT, () => {
  console.log(`campusMobi server running at http://localhost:${PORT}`);
});
