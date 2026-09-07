import { gameState, DaySummary } from '../game/state';
import { sound } from '../audio/sound';

export function renderRegisterView(
  container: HTMLElement,
  summary: DaySummary,
  onOpenShop: () => void,
  onNextDay: () => void
) {
  const isProfit = summary.netProfit >= 0;

  container.innerHTML = `
    <div class="modal-overlay">
      <div class="modal-box">
        <h2 class="modal-title">📊 DAY ${summary.day} STATS</h2>
        <p style="color: #666; font-weight: bold;">Served ${summary.happyCustomers} / ${summary.totalCustomers} happy customers</p>

        <table class="summary-table">
          <tr>
            <td>Gross Sales Revenue</td>
            <td class="amount" style="color: var(--mint-primary);">+$${summary.revenue.toFixed(2)}</td>
          </tr>
          <tr>
            <td>Tips Collected</td>
            <td class="amount" style="color: var(--mint-primary);">+$${summary.tips.toFixed(2)}</td>
          </tr>
          <tr>
            <td>Ingredient Supplies</td>
            <td class="amount" style="color: var(--pink-accent);">-$${summary.ingredientCosts.toFixed(2)}</td>
          </tr>
          <tr>
            <td>Shop Rent & Utilities</td>
            <td class="amount" style="color: var(--pink-accent);">-$${summary.rentCost.toFixed(2)}</td>
          </tr>
          <tr class="total-row">
            <td>NET DAY PROFIT</td>
            <td class="amount" style="color: ${isProfit ? '#52b788' : '#e63946'};">
              ${isProfit ? '+' : ''}$${summary.netProfit.toFixed(2)}
            </td>
          </tr>
        </table>

        <div style="display: flex; gap: 12px; margin-top: 24px; justify-content: center;">
          <button id="btn-open-shop" class="btn-action" style="font-size: 1.05rem;">🛒 Shop Upgrades</button>
          <button id="btn-start-next-day" class="btn-action primary" style="font-size: 1.05rem;">🌅 Start Day ${gameState.day}</button>
        </div>
      </div>
    </div>
  `;

  document.getElementById('btn-open-shop')?.addEventListener('click', () => {
    sound.playClick();
    onOpenShop();
  });

  document.getElementById('btn-start-next-day')?.addEventListener('click', () => {
    sound.playClick();
    onNextDay();
  });
}
