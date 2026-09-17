/* =============================================================================
   pages/wallet-page.js
   -----------------------------------------------------------------------------
   Balance + a modal shared by "Add funds" and "Simulate payment", plus a
   simple transaction list. Data comes from services/wallet.js -> /api/wallet.
   ============================================================================= */

import { navigate } from "../router.js";
import { Auth } from "../services/auth.js";
import { getWallet, addFunds, pay } from "../services/wallet.js";
import { createWalletCard } from "../components/wallet-card.js";

export async function renderWalletPage(container) {
  const isGuest = Auth.isGuest();

  if (isGuest) {
    container.innerHTML = `
      <div class="page-shell">
        <h3 class="section-title">Wallet</h3>
        <div class="card-lock">
          The campus wallet is only available to signed-in students.
          <div style="margin-top:14px;">
            <button class="btn btn-primary btn-sm" data-action="signin">Sign in</button>
          </div>
        </div>
      </div>
    `;
    container.querySelector('[data-action="signin"]').addEventListener("click", () => navigate("/login"));
    return;
  }

  container.innerHTML = `<div class="page-shell"><h3 class="section-title">Wallet</h3><p class="muted">Loading wallet ...</p></div>`;

  let wallet;
  try {
    wallet = await getWallet();
  } catch {
    container.querySelector(".page-shell").innerHTML += `<div class="error-banner">Couldn't load your wallet. Please try again.</div>`;
    return;
  }

  // modal state: null | "topup" | "pay"
  let modal = null;
  let amount = "";
  let label = "";
  let busy = false;
  let error = "";

  const pageShell = container.querySelector(".page-shell");

  function draw() {
    pageShell.innerHTML = `
      <h3 class="section-title">Wallet</h3>
      <div data-slot="balance"></div>

      <h3 class="section-title">Recent activity</h3>
      <div class="tx-list">
        ${wallet.transactions
          .map(
            (t) => `
          <div class="tx-item">
            <div>
              <div class="tx-label">${t.label}</div>
              <div class="tx-date">${t.date}</div>
            </div>
            <div class="tx-amount ${t.amount >= 0 ? "positive" : "negative"}">${t.amount >= 0 ? "+" : ""}${t.amount.toFixed(2)}</div>
          </div>`
          )
          .join("")}
      </div>

      ${
        modal
          ? `
        <div class="wallet-modal-backdrop">
          <div class="wallet-modal">
            <h4>${modal === "topup" ? "Add funds" : "Simulate a payment"}</h4>
            ${error ? `<div class="error-banner">${error}</div>` : ""}
            <input class="field" type="number" min="0" step="0.01" placeholder="Amount (ZAR)" name="amount" value="${amount}" />
            ${modal === "pay" ? `<input class="field" placeholder="What's this for? (optional)" name="label" value="${label}" />` : ""}
            <div class="wallet-modal-actions">
              <button class="btn btn-ghost btn-sm" data-action="cancel">Cancel</button>
              <button class="btn btn-primary btn-sm" data-action="confirm" ${busy ? "disabled" : ""}>${busy ? "Working ..." : "Confirm"}</button>
            </div>
          </div>
        </div>`
          : ""
      }
    `;

    const balanceSlot = pageShell.querySelector('[data-slot="balance"]');
    balanceSlot.appendChild(
      createWalletCard({
        balance: wallet.balance,
        currency: wallet.currency,
        onAddFunds: () => openModal("topup"),
        onPay: () => openModal("pay"),
      })
    );

    if (modal) {
      const backdrop = pageShell.querySelector(".wallet-modal-backdrop");
      backdrop.addEventListener("click", (e) => {
        if (e.target === backdrop) closeModal();
      });
      pageShell.querySelector('[data-action="cancel"]').addEventListener("click", closeModal);
      pageShell.querySelector('[data-action="confirm"]').addEventListener("click", confirmModal);
      pageShell.querySelector('input[name="amount"]').addEventListener("input", (e) => (amount = e.target.value));
      pageShell.querySelector('input[name="label"]')?.addEventListener("input", (e) => (label = e.target.value));
    }
  }

  function openModal(kind) {
    modal = kind;
    amount = "";
    label = "";
    error = "";
    draw();
  }

  function closeModal() {
    modal = null;
    draw();
  }

  async function confirmModal() {
    const value = parseFloat(amount);
    if (!value || value <= 0) {
      error = "Enter an amount greater than 0.";
      draw();
      return;
    }
    busy = true;
    error = "";
    draw();
    try {
      wallet = modal === "topup" ? await addFunds(value) : await pay(value, label || "Simulated payment");
      modal = null;
      busy = false;
      draw();
    } catch (err) {
      busy = false;
      error = err.message;
      draw();
    }
  }

  draw();
}
