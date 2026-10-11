/* =============================================================================
   components/wallet-card.js
   -----------------------------------------------------------------------------
   Shows the current balance plus "Add funds" / "Simulate payment" buttons.
   ============================================================================= */

export function createWalletCard({ balance, currency, onAddFunds, onPay }) {
  const card = document.createElement("div");
  card.className = "wallet-balance-card";
  card.innerHTML = `
    <div class="wallet-balance-label">Available balance</div>
    <div class="wallet-balance-amount">${currency} ${balance.toFixed(2)}</div>
    <div class="wallet-actions">
      <button class="btn btn-lime btn-sm" data-action="add-funds">Add funds</button>
      <button class="btn btn-ghost btn-sm" data-action="pay">Simulate payment</button>
    </div>
  `;
  card.querySelector('[data-action="add-funds"]').addEventListener("click", onAddFunds);
  card.querySelector('[data-action="pay"]').addEventListener("click", onPay);
  return card;
}
