/**
 * routes/wallet.js
 * ---------------------------------------------------------------------------
 * The campus wallet: a balance plus a transaction history, stored server
 * side per user (see store/memoryStore.js). Every route here requires a
 * signed-in session.
 *
 *   GET  /api/wallet            -> { balance, currency, transactions }
 *   POST /api/wallet/topup      { amount }          -> updated wallet
 *   POST /api/wallet/pay        { amount, label? }  -> updated wallet
 */

const express = require("express");
const requireAuth = require("../middleware/requireAuth");
const { getOrCreateWallet, addFunds, pay } = require("../store/memoryStore");

const router = express.Router();

router.use(requireAuth);

router.get("/", (req, res) => {
  res.json(getOrCreateWallet(req.user.id));
});

router.post("/topup", (req, res) => {
  const amount = Number(req.body?.amount);
  if (!amount || amount <= 0) {
    return res.status(400).json({ error: "Enter an amount greater than 0." });
  }
  res.json(addFunds(req.user.id, amount));
});

router.post("/pay", (req, res) => {
  const amount = Number(req.body?.amount);
  if (!amount || amount <= 0) {
    return res.status(400).json({ error: "Enter an amount greater than 0." });
  }
  res.json(pay(req.user.id, amount, req.body?.label));
});

module.exports = router;
