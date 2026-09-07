import { getDailyNews } from '../game/news';
import { gameState } from '../game/state';
import { sound } from '../audio/sound';

export function renderNewsView(
  container: HTMLElement,
  onOpenShop: () => void
) {
  const news = getDailyNews(gameState.day);

  container.innerHTML = `
    <div class="modal-overlay">
      <div class="modal-box" style="max-width: 540px;">
        <div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 12px;">
          <span style="font-size: 2rem;">📺</span>
          <h2 style="font-size: 1.6rem; color: #2b2d42; margin: 0;">ICNN MORNING NEWS</h2>
        </div>
        <div style="font-size: 0.85rem; color: #777; margin-bottom: 16px; font-weight: bold;">
          ICE CREAM NEWS NETWORK • DAY ${gameState.day}
        </div>

        <div class="news-card">
          <div class="news-header">📰 ${news.headline}</div>
          <div style="font-size: 0.95rem; color: #333; margin-bottom: 10px; line-height: 1.4;">
            "${news.story}"
          </div>
          <div style="font-size: 0.85rem; color: #588157; font-weight: bold; font-style: italic;">
            💡 Pro Tip: ${news.tip}
          </div>
        </div>

        <button id="btn-unlock-shop" class="btn-action primary" style="font-size: 1.2rem; width: 100%; padding: 14px;">
          🔓 Open Shop for Day ${gameState.day}!
        </button>
      </div>
    </div>
  `;

  document.getElementById('btn-unlock-shop')?.addEventListener('click', () => {
    sound.playClick();
    onOpenShop();
  });
}
