import './style.css';
import { gameState } from './game/state';
import { generateDailyCustomers } from './game/customers';
import { sound } from './audio/sound';

import { renderTitleView } from './ui/titleView';
import { renderNewsView } from './ui/newsView';
import { renderCounterView } from './ui/counterView';
import { renderPrepView } from './ui/prepView';
import { renderRegisterView } from './ui/registerView';
import { renderShopView } from './ui/shopView';

const container = document.getElementById('game-container')!;

// Development mode: disable old PWA/service-worker caching so every deploy
// reaches the iPad immediately while we are iterating on the game.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map(registration => registration.unregister()));

      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }
    } catch (err) {
      console.log('Service worker cleanup skipped:', err);
    }
  });
}

// iPad/iPhone/Safari (and most browsers) block audible autoplay until the
// visitor interacts with the page. Start the soundtrack on the very first
// interaction instead of waiting for a particular button such as Settings.
const unlockAudio = () => {
  void sound.unlockAndStart();
};

document.addEventListener('pointerdown', unlockAudio, { once: true, capture: true });
document.addEventListener('touchstart', unlockAudio, { once: true, capture: true, passive: true });
document.addEventListener('keydown', unlockAudio, { once: true, capture: true });

// Sound Toggle
const soundBtn = document.getElementById('btn-sound');
soundBtn?.addEventListener('click', () => {
  const isMuted = sound.toggleMute();
  if (soundBtn) soundBtn.innerText = isMuted ? '🔇' : '🔊';
});

// Save & Quit Flow
export function handleSaveAndQuit() {
  sound.playClick();
  gameState.saveGame();
  showTitleView();
}

// Save & Quit Top Button Handler
const saveQuitBtn = document.getElementById('btn-save-quit');
saveQuitBtn?.addEventListener('click', () => {
  handleSaveAndQuit();
});

// Dev Skip Day
document.getElementById('dev-skip-day')?.addEventListener('click', () => {
  showRegisterView();
});

// HUD Updater
function updateHUD() {
  const dayEl = document.getElementById('hud-day');
  const moneyEl = document.getElementById('hud-money');
  if (dayEl) dayEl.innerText = gameState.day.toString();
  if (moneyEl) moneyEl.innerText = gameState.cash.toFixed(2);

  const saveBtn = document.getElementById('btn-save-quit');
  if (saveBtn) {
    if (gameState.currentView === 'title') {
      saveBtn.style.display = 'none';
    } else {
      saveBtn.style.display = 'inline-flex';
    }
  }
}

// 0. Show Title / Start Screen
function showTitleView() {
  gameState.currentView = 'title';
  updateHUD();
  renderTitleView(
    container,
    () => showNewsView(),
    () => loadSavedGameFlow()
  );
}

function loadSavedGameFlow() {
  gameState.loadSave();
  if (gameState.currentCustomer) {
    showCounterView();
  } else if (gameState.customerQueue.length > 0) {
    gameState.currentCustomer = gameState.customerQueue.shift() || null;
    showCounterView();
  } else {
    showNewsView();
  }
}

function showNewsView() {
  gameState.currentView = 'news';
  updateHUD();
  renderNewsView(container, () => {
    startNewDay();
  });
}

function startNewDay() {
  gameState.customerQueue = generateDailyCustomers(4);
  gameState.currentCustomer = gameState.customerQueue.shift() || null;
  gameState.customerPatience = 100;
  gameState.resetPrep();
  showCounterView();
}

function showCounterView() {
  gameState.currentView = 'counter';
  updateHUD();
  renderCounterView(
    container,
    () => showPrepView(),
    () => showRegisterView(),
    () => handleSaveAndQuit()
  );
}

function showPrepView() {
  gameState.currentView = 'prep';
  updateHUD();
  renderPrepView(
    container,
    () => showCounterView(),
    (result) => handleServeDish(result),
    () => handleSaveAndQuit()
  );
}

function handleServeDish(result: any) {
  const stars = '⭐'.repeat(result.rating);
  const popup = document.createElement('div');
  popup.className = 'review-popup';
  popup.innerHTML = `
    <div class="review-stars">${stars}</div>
    <div class="review-text">
      <div>"${result.feedback}"</div>
      <div style="font-size: 0.85rem; color: #52b788; margin-top: 2px;">
        Revenue: +$${result.earnedRevenue.toFixed(2)} | Tip: +$${result.tip.toFixed(2)}
      </div>
    </div>
  `;
  document.body.appendChild(popup);

  if (result.rating >= 4) sound.playCustomerHappy();
  else sound.playCustomerSad();

  setTimeout(() => {
    popup.remove();
    gameState.currentCustomer = gameState.customerQueue.shift() || null;
    gameState.customerPatience = 100;
    gameState.resetPrep();
    showCounterView();
  }, 2800);
}

function showRegisterView() {
  gameState.currentView = 'register';
  const summary = gameState.endDay();
  updateHUD();

  renderRegisterView(
    container,
    summary,
    () => showShopView(),
    () => showNewsView()
  );
}

function showShopView() {
  gameState.currentView = 'shop';
  updateHUD();
  renderShopView(container, () => {
    showRegisterView();
  });
}

showTitleView();
