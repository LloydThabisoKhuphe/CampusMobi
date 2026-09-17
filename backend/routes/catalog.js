/**
 * routes/catalog.js
 * ---------------------------------------------------------------------------
 * Read-only "content" endpoint. No sign-in required — this is the same kind
 * of data a marketing site would happily show anyone. The frontend fetches
 * it once on startup and reuses it.
 *
 *   GET /api/catalog -> { appInfo, features, services, serviceCategories,
 *                          locations, announcements, todaySchedule, notifications }
 */

const express = require("express");
const catalog = require("../store/catalogData");

const router = express.Router();

router.get("/", (_req, res) => {
  res.json({
    appInfo: catalog.APP_INFO,
    features: catalog.FEATURES,
    services: catalog.SERVICES,
    serviceCategories: catalog.SERVICE_CATEGORIES,
    locations: catalog.CAMPUS_LOCATIONS,
    announcements: catalog.ANNOUNCEMENTS,
    todaySchedule: catalog.TODAY_SCHEDULE,
    notifications: catalog.NOTIFICATIONS,
  });
});

module.exports = router;
