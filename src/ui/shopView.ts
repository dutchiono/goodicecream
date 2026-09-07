import { gameState } from '../game/state';
import { SHOP_CATALOG, purchaseItem } from '../game/shop';
import { sound } from '../audio/sound';

export function renderShopView(
  container: HTMLElement,
  onClose: () => void
) {
  container.innerHTML = `
    <div class="modal-overlay">
      <div class="modal-box" style="max-width: 600px; width: 95%; max-height: 90vh; display: flex; flex-direction: column;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <h2 class="modal-title" style="margin: 0;">🛒 SHOP UPGRADES</h2>
          <div style="font-size: 1.2rem; font-weight: bold; color: var(--mint-primary);">
            Cash: $<span id="shop-cash-val">${gameState.cash.toFixed(2)}</span>
          </div>
        </div>

        <div id="shop-items-container" style="flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 12px; padding-right: 6px;">
          <!-- Shop items rendered here -->
        </div>

        <button id="btn-close-shop-view" class="btn-action primary" style="margin-top: 16px; font-size: 1.1rem;">
          ⬅️ Back to Night Summary
        </button>
      </div>
    </div>
  `;

  renderCatalog();

  document.getElementById('btn-close-shop-view')?.addEventListener('click', () => {
    sound.playClick();
    onClose();
  });

  function renderCatalog() {
    const list = document.getElementById('shop-items-container')!;
    list.innerHTML = '';

    SHOP_CATALOG.forEach(item => {
      const card = document.createElement('div');
      card.style.cssText = `
        background: #fdf8f5;
        border: 2px solid #ffccd5;
        border-radius: 16px;
        padding: 12px 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        text-align: left;
      `;

      const canAfford = gameState.cash >= item.price;
      const buyBtnText = item.unlocked ? 'UNLOCKED ✅' : `BUY ($${item.price.toFixed(2)})`;

      card.innerHTML = `
        <div>
          <div style="font-weight: bold; font-size: 1.1rem; color: var(--pink-accent);">${item.name}</div>
          <div style="font-size: 0.85rem; color: #666; margin-top: 2px;">${item.description}</div>
        </div>
        <button class="btn-action ${item.unlocked ? '' : 'primary'}" 
                style="padding: 8px 14px; font-size: 0.9rem; flex-shrink: 0;"
                ${item.unlocked || !canAfford ? 'disabled' : ''}>
          ${buyBtnText}
        </button>
      `;

      const btn = card.querySelector('button');
      btn?.addEventListener('click', () => {
        if (purchaseItem(item)) {
          const cashVal = document.getElementById('shop-cash-val');
          if (cashVal) cashVal.innerText = gameState.cash.toFixed(2);
          const hudMoney = document.getElementById('hud-money');
          if (hudMoney) hudMoney.innerText = gameState.cash.toFixed(2);
          renderCatalog();
        }
      });

      list.appendChild(card);
    });
  }
}
