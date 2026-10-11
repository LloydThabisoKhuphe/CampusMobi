/**
 * routes/auth.js
 * ---------------------------------------------------------------------------
 * There's still no real user database behind this demo — signing in with
 * ANY username/password builds a believable student profile, same as the
 * original project. The difference is that now this happens on the SERVER,
 * and the frontend only ever holds a session token, not the "how do I fake
 * a login" logic.
 *
 *   POST /api/auth/login   { username, password } -> { user, token }
 *   POST /api/auth/guest   {}                      -> { user, token }
 *   POST /api/auth/logout  (Bearer token)           -> 204
 */

const express = require("express");
const { createSession, destroySession } = require("../store/memoryStore");

const router = express.Router();

function toTitleCase(username) {
  return username.replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function randomStudentId() {
  return "246" + String(Math.floor(1000000 + Math.random() * 8999999));
}

router.post("/login", (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required." });
  }

  const user = {
    id: "u-" + username.toLowerCase(),
    username,
    fullName: toTitleCase(username),
    studentId: randomStudentId(),
    role: "STUDENT",
    isGuest: false,
  };

  const token = createSession(user);
  res.json({ user, token });
});

router.post("/guest", (_req, res) => {
  const user = {
    id: "guest-" + Date.now(),
    username: "guest",
    fullName: "Guest",
    studentId: null,
    role: "GUEST",
    isGuest: true,
  };

  const token = createSession(user);
  res.json({ user, token });
});

router.post("/logout", (req, res) => {
  const header = req.headers.authorization || "";
  const [, token] = header.split(" ");
  if (token) destroySession(token);
  res.status(204).end();
});

module.exports = router;
