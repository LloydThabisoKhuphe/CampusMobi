/* =============================================================================
   services/wallet.js
   -----------------------------------------------------------------------------
   Thin wrapper around the wallet endpoints. Pages import these functions
   instead of calling apiRequest("/wallet", ...) directly everywhere.
   ============================================================================= */

import { apiRequest } from "./api.js";

export function getWallet() {
  return apiRequest("/wallet");
}

export function addFunds(amount) {
  return apiRequest("/wallet/topup", { method: "POST", body: { amount } });
}

export function pay(amount, label) {
  return apiRequest("/wallet/pay", { method: "POST", body: { amount, label } });
}
