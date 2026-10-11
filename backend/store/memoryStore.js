/**
 * memoryStore.js
 * ---------------------------------------------------------------------------
 * A tiny in-memory "database" for the demo.
 *
 * A real project would swap this out for MongoDB/Postgres/etc, but the rest
 * of the backend (routes, middleware) only ever talks to the functions
 * exported here — so that swap would happen in ONE file, not scattered
 * around the app.
 *
 * Everything resets when the server restarts. That's fine for a demo/
 * presentation; it's exactly the same lifespan the original localStorage
 * version had (per-browser instead of per-server-run).
 */

// token -> user object
const sessions = new Map();

// userId -> wallet object
const wallets = new Map();

// userId -> { "YYYY-MM-DD": [ { id, time, title }, ... ] }
const calendars = new Map();

let nextId = 1;
function generateId(prefix) {
  return `${prefix}-${Date.now()}-${nextId++}`;
}

function generateToken() {
  return generateId("tok");
}

/* --------------------------------- Sessions -------------------------------- */

function createSession(user) {
  const token = generateToken();
  sessions.set(token, user);
  return token;
}

function getUserByToken(token) {
  return sessions.get(token) || null;
}

function destroySession(token) {
  sessions.delete(token);
}

/* ---------------------------------- Wallet --------------------------------- */

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function getOrCreateWallet(userId) {
  if (!wallets.has(userId)) {
    wallets.set(userId, {
      balance: 245.5,
      currency: "ZAR",
      transactions: [
        { id: "t1", label: "Cafeteria — lunch", amount: -45.0, date: "2026-08-08" },
        { id: "t2", label: "Wallet top-up", amount: 200.0, date: "2026-08-05" },
        { id: "t3", label: "Printing — 12 pages", amount: -9.6, date: "2026-08-03" },
      ],
    });
  }
  return wallets.get(userId);
}

function addFunds(userId, amount) {
  const wallet = getOrCreateWallet(userId);
  wallet.balance = Number((wallet.balance + amount).toFixed(2));
  wallet.transactions.unshift({
    id: generateId("t"),
    label: "Wallet top-up",
    amount: Number(amount.toFixed(2)),
    date: todayISO(),
  });
  return wallet;
}

function pay(userId, amount, label) {
  const wallet = getOrCreateWallet(userId);
  wallet.balance = Number((wallet.balance - amount).toFixed(2));
  wallet.transactions.unshift({
    id: generateId("t"),
    label: label || "Payment",
    amount: -Number(amount.toFixed(2)),
    date: todayISO(),
  });
  return wallet;
}

/* --------------------------------- Calendar -------------------------------- */

function getOrCreateCalendar(userId) {
  if (!calendars.has(userId)) {
    calendars.set(userId, {
      [todayISO()]: [
        { id: "e1", time: "09:00", title: "Computer Science — Lecture Hall A" },
        { id: "e2", time: "11:00", title: "Mathematics — Lecture Hall B" },
      ],
    });
  }
  return calendars.get(userId);
}

function addEvent(userId, date, time, title) {
  const calendar = getOrCreateCalendar(userId);
  const event = { id: generateId("e"), time, title };
  calendar[date] = [...(calendar[date] || []), event];
  return calendar;
}

function deleteEvent(userId, date, eventId) {
  const calendar = getOrCreateCalendar(userId);
  calendar[date] = (calendar[date] || []).filter((ev) => ev.id !== eventId);
  return calendar;
}

module.exports = {
  generateId,
  createSession,
  getUserByToken,
  destroySession,
  getOrCreateWallet,
  addFunds,
  pay,
  getOrCreateCalendar,
  addEvent,
  deleteEvent,
};
