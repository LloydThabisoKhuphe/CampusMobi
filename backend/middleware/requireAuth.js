/**
 * requireAuth.js
 * ---------------------------------------------------------------------------
 * Protects an API route. The frontend sends the token it got back from
 * /api/auth/login (or /api/auth/guest) as:
 *
 *   Authorization: Bearer <token>
 *
 * If the token is missing or unknown, the request is rejected with 401.
 * Otherwise the matching user is attached to `req.user` so route handlers
 * can use it (e.g. to look up that user's wallet).
 */

const { getUserByToken } = require("../store/memoryStore");

function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ error: "Sign in required." });
  }

  const user = getUserByToken(token);
  if (!user) {
    return res.status(401).json({ error: "Your session has expired. Please sign in again." });
  }

  req.user = user;
  next();
}

module.exports = requireAuth;
