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

// PWA Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(err => {
      console.log('PWA ServiceWorker registration skipped/dev:', err);
    });
  });
}

// Handle PWA Install Prompt
let deferredPrompt: any = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  const installBtn = document.getElementById('btn-pwa-install');
  if (installBtn) {
    installBtn.classList.remove('hidden');
    installBtn.addEventListener('click', () => {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(() => {
        installBtn.classList.add('hidden');
      });
    });
  }
});

// iPad/iPhone/Safari (and most browsers) block audible autoplay until the
// visitor interacts with the page. Start the soundtrack on the very first
// interaction instead of waiting for a particular button such as Settings.
const unlockAudio = () => {
  sound.unlockAndStart();
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
    () => showNewsView(), // New Game -> Morning News
    () => loadSavedGameFlow() // Load Game -> Resume Saved Day/Counter
  );
}

// Resume from loaded save
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

// 1. Show Morning News
function showNewsView() {
  gameState.currentView = 'news';
  updateHUD();
  renderNewsView(container, () => {
    startNewDay();
  });
}

// 2. Start New Day Queue
function startNewDay() {
  gameState.customerQueue = generateDailyCustomers(4);
  gameState.currentCustomer = gameState.customerQueue.shift() || null;
  gameState.customerPatience = 100;
  gameState.resetPrep();
  showCounterView();
}

// 3. Show Counter View
function showCounterView() {
  gameState.currentView = 'counter';
  updateHUD();
  renderCounterView(
    container,
    () => showPrepView(), // Go to Prep
    () => showRegisterView(), // Close Shop
    () => handleSaveAndQuit() // Save & Quit
  );
}

// 4. Show Kitchen Prep View
function showPrepView() {
  gameState.currentView = 'prep';
  updateHUD();
  renderPrepView(
    container,
    () => showCounterView(), // Back to Counter
    (result) => handleServeDish(result), // Serve finished
    () => handleSaveAndQuit() // Save & Quit
  );
}

// 5. Handle Serving Dish & Show Feedback
function handleServeDish(result: any) {
  // Show Floating Review Popup
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
    // Advance customer queue
    gameState.currentCustomer = gameState.customerQueue.shift() || null;
    gameState.customerPatience = 100;
    gameState.resetPrep();
    showCounterView();
  }, 2800);
}

// 6. Show Register / End-of-Day View
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

// 7. Show Shop Upgrades View
function showShopView() {
  gameState.currentView = 'shop';
  updateHUD();
  renderShopView(container, () => {
    // Back to Register View
    showRegisterView();
  });
}

// Initialize Application on Title Screen
showTitleView();
