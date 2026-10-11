/**
 * routes/calendar.js
 * ---------------------------------------------------------------------------
 * Per-user calendar events, keyed by date ("YYYY-MM-DD"). Requires a
 * signed-in session (guests are blocked from adding/removing on the
 * frontend, matching the original app's behaviour).
 *
 *   GET    /api/calendar                       -> { "2026-08-08": [ {id,time,title} ] , ... }
 *   POST   /api/calendar        { date, time, title } -> updated calendar map
 *   DELETE /api/calendar/:date/:eventId               -> updated calendar map
 */

const express = require("express");
const requireAuth = require("../middleware/requireAuth");
const { getOrCreateCalendar, addEvent, deleteEvent } = require("../store/memoryStore");

const router = express.Router();

router.use(requireAuth);

router.get("/", (req, res) => {
  res.json(getOrCreateCalendar(req.user.id));
});

router.post("/", (req, res) => {
  const { date, time, title } = req.body || {};
  if (!date || !time || !title || !title.trim()) {
    return res.status(400).json({ error: "A date, time and title are all required." });
  }
  res.json(addEvent(req.user.id, date, time, title.trim()));
});

router.delete("/:date/:eventId", (req, res) => {
  const { date, eventId } = req.params;
  res.json(deleteEvent(req.user.id, date, eventId));
});

module.exports = router;
