import { gameState } from '../game/state';
import { sound } from '../audio/sound';

export function renderTitleView(
  container: HTMLElement,
  onStartNewGame: () => void,
  onLoadGame: () => void
) {
  const hasSave = gameState.hasSaveData();

  container.innerHTML = `
    <div class="counter-layout game-view" style="justify-content: center; align-items: center; background: #fbf5eb;">
      <!-- Parlor Background Wallpaper & Bunting -->
      <div class="parlor-wall"></div>
      <div class="parlor-wainscoting"></div>
      <div class="parlor-bunting"></div>

      <!-- Main Title Card -->
      <div style="z-index: 10; display: flex; flex-direction: column; align-items: center; gap: 20px; max-width: 500px; width: 90%;">
        
        <!-- Logo Header -->
        <div style="background: #fffdf9; border: 3.5px solid var(--brown-ink); border-radius: 28px; padding: 24px 32px; text-align: center; box-shadow: var(--shadow-lg);">
          <div style="font-size: 3.2rem; margin-bottom: 8px; filter: drop-shadow(0 4px 8px rgba(74,55,40,0.15));">🍦🍨</div>
          <h1 style="font-size: 2.2rem; color: var(--pink-accent); line-height: 1.1; margin-bottom: 8px; font-weight: 800;">
            GOOD ICE CREAM,<br/><span style="color: #ca9b72;">GREAT ICE CREAM</span>
          </h1>
          <p style="color: var(--text-dark); font-size: 0.95rem; opacity: 0.85; font-weight: 600;">
            Serve cozy scoops & sundae orders to friendly neighbors!
          </p>
        </div>

        <!-- Action Buttons Container -->
        <div style="display: flex; flex-direction: column; gap: 12px; width: 100%; align-items: center;">
          
          <!-- New Game Button -->
          <button id="btn-title-new" class="btn-action primary" style="width: 80%; font-size: 1.2rem; padding: 14px; text-align: center;">
            ✨ New Game
          </button>

          <!-- Load Game Button -->
          <button id="btn-title-load" class="btn-action" style="width: 80%; font-size: 1.2rem; padding: 14px; text-align: center; ${!hasSave ? 'opacity: 0.55; cursor: not-allowed;' : ''}">
            📂 Load Game
          </button>

          <!-- Settings Button -->
          <button id="btn-title-settings" class="btn-action" style="width: 80%; font-size: 1.1rem; padding: 12px; text-align: center;">
            ⚙️ Settings & Info
          </button>

        </div>
      </div>

      <!-- Load Game Modal Overlay -->
      <div id="load-save-modal" class="modal-overlay hidden">
        <div class="modal-box" style="max-width: 520px;">
          <h2 class="modal-title">📂 Choose Saved Game</h2>
          <p style="color: #666; font-size: 0.9rem; font-weight: 600;">Select a save slot to continue your shop journey!</p>

          <div id="load-slots-container" class="save-slots-list">
            <!-- Dynamic Save Slots Rendered Here -->
          </div>

          <button id="btn-close-load-modal" class="btn-action primary" style="width: 100%; padding: 12px; margin-top: 8px;">
            Close
          </button>
        </div>
      </div>

      <!-- Settings Modal Overlay -->
      <div id="settings-modal" class="modal-overlay hidden">
        <div class="modal-box">
          <h2 class="modal-title">⚙️ Game Settings</h2>
          
          <div style="display: flex; flex-direction: column; gap: 16px; margin: 20px 0; text-align: left;">
            <div style="display: flex; justify-content: space-between; align-items: center; background: #fcf6eb; padding: 12px 16px; border-radius: 14px; border: 2px solid var(--brown-ink);">
              <span style="font-weight: bold;">🔊 Sound Effects & BGM</span>
              <button id="btn-toggle-audio-modal" class="btn-action" style="padding: 6px 16px;">
                ${sound.isMuted() ? '🔇 Muted' : '🔊 Playing'}
              </button>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; background: #fcf6eb; padding: 12px 16px; border-radius: 14px; border: 2px solid var(--brown-ink);">
              <span style="font-weight: bold; color: #c1121f;">🗑️ Clear Save Data</span>
              <button id="btn-clear-save" class="btn-action" style="border-color: #c1121f; color: #c1121f; padding: 6px 16px;">
                Clear Save
              </button>
            </div>

            <div style="background: #fcf6eb; padding: 14px; border-radius: 14px; border: 2px solid var(--brown-ink); font-size: 0.88rem; line-height: 1.4;">
              <div style="font-weight: bold; margin-bottom: 4px; color: var(--pink-accent);">🍦 How to Play:</div>
              • Listen to customer orders at the counter.<br/>
              • Go to the Kitchen prep table to select vessels, scoops, drizzles & toppings.<br/>
              • Serve accurate orders before customer patience runs out!<br/>
              • Count net profits and buy upgrades at the end of each day.
            </div>
          </div>

          <button id="btn-close-settings" class="btn-action primary" style="width: 100%; padding: 12px;">
            Close Settings
          </button>
        </div>
      </div>
    </div>
  `;

  // Helper to render save slots dynamically
  function renderSaveSlots() {
    const slotsContainer = document.getElementById('load-slots-container');
    if (!slotsContainer) return;
    const slots = gameState.getSaveSlotsInfo();
    slotsContainer.innerHTML = '';

    slots.forEach(slot => {
      const slotCard = document.createElement('div');
      slotCard.className = 'save-slot-card';
      if (slot.exists) {
        slotCard.innerHTML = `
          <div class="slot-info">
            <div class="slot-name">📁 Save Slot ${slot.slotId}</div>
            <div class="slot-details">Day ${slot.day} • Cash: $${slot.cash?.toFixed(2)} (${slot.dateStr})</div>
          </div>
          <div class="slot-actions">
            <button class="btn-action primary btn-load-slot" data-slot="${slot.slotId}" style="padding: 6px 14px; font-size: 0.9rem;">
              ▶️ Play
            </button>
            <button class="btn-action btn-delete-slot" data-slot="${slot.slotId}" style="padding: 6px 10px; font-size: 0.9rem; color: #c1121f; border-color: #c1121f;">
              🗑️
            </button>
          </div>
        `;
      } else {
        slotCard.innerHTML = `
          <div class="slot-info">
            <div class="slot-name" style="opacity: 0.7;">📁 Save Slot ${slot.slotId}</div>
            <div class="slot-details" style="opacity: 0.6;">Empty Save Slot</div>
          </div>
          <div class="slot-actions">
            <button class="btn-action btn-new-slot" data-slot="${slot.slotId}" style="padding: 6px 14px; font-size: 0.9rem;">
              ✨ New
            </button>
          </div>
        `;
      }
      slotsContainer.appendChild(slotCard);
    });

    document.querySelectorAll('.btn-load-slot').forEach(btn => {
      btn.addEventListener('click', (e) => {
        sound.playClick();
        const slotId = parseInt((e.currentTarget as HTMLElement).getAttribute('data-slot') || '1');
        gameState.loadSave(slotId);
        onLoadGame();
      });
    });

    document.querySelectorAll('.btn-new-slot').forEach(btn => {
      btn.addEventListener('click', (e) => {
        sound.playClick();
        const slotId = parseInt((e.currentTarget as HTMLElement).getAttribute('data-slot') || '1');
        gameState.resetNewGame(slotId);
        onStartNewGame();
      });
    });

    document.querySelectorAll('.btn-delete-slot').forEach(btn => {
      btn.addEventListener('click', (e) => {
        sound.playClick();
        const slotId = parseInt((e.currentTarget as HTMLElement).getAttribute('data-slot') || '1');
        gameState.deleteSaveSlot(slotId);
        renderSaveSlots();
      });
    });
  }

  // Event Listeners
  document.getElementById('btn-title-new')?.addEventListener('click', () => {
    sound.playClick();
    gameState.resetNewGame(1);
    onStartNewGame();
  });

  const loadModal = document.getElementById('load-save-modal');
  document.getElementById('btn-title-load')?.addEventListener('click', () => {
    sound.playClick();
    renderSaveSlots();
    loadModal?.classList.remove('hidden');
  });

  document.getElementById('btn-close-load-modal')?.addEventListener('click', () => {
    sound.playClick();
    loadModal?.classList.add('hidden');
  });

  // Settings Modal controls
  const settingsModal = document.getElementById('settings-modal');
  document.getElementById('btn-title-settings')?.addEventListener('click', () => {
    sound.playClick();
    settingsModal?.classList.remove('hidden');
  });

  document.getElementById('btn-close-settings')?.addEventListener('click', () => {
    sound.playClick();
    settingsModal?.classList.add('hidden');
  });

  document.getElementById('btn-toggle-audio-modal')?.addEventListener('click', () => {
    const isMuted = sound.toggleMute();
    const btn = document.getElementById('btn-toggle-audio-modal');
    if (btn) btn.innerText = isMuted ? '🔇 Muted' : '🔊 Playing';
    const topHudBtn = document.getElementById('btn-sound');
    if (topHudBtn) topHudBtn.innerText = isMuted ? '🔇' : '🔊';
  });

  document.getElementById('btn-clear-save')?.addEventListener('click', () => {
    sound.playClick();
    localStorage.removeItem('good_ice_cream_save');
    localStorage.removeItem('good_ice_cream_save_slot_1');
    localStorage.removeItem('good_ice_cream_save_slot_2');
    localStorage.removeItem('good_ice_cream_save_slot_3');
    location.reload();
  });
}
