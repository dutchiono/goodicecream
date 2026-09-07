import { gameState } from '../game/state';
import { sound } from '../audio/sound';

export function renderCounterView(
  container: HTMLElement,
  onGoToPrep: () => void,
  onEndDay: () => void,
  onSaveAndQuit: () => void
) {
  const customer = gameState.currentCustomer;

  if (!customer) {
    // No more customers today
    container.innerHTML = `
      <div class="counter-layout game-view">
        <div class="parlor-wall"></div>
        <div class="parlor-bunting"></div>
        <div class="parlor-window">
          <div class="sun"></div>
          <div class="cloud"></div>
        </div>
        <div class="counter-top" style="justify-content: center; z-index: 10;">
          <div class="dialogue-bubble">
            <h2 style="color: var(--pink-primary); margin-bottom: 8px;">🎉 Day ${gameState.day} Rush Complete!</h2>
            <p>You served all the customers for today. Time to count the register profits!</p>
          </div>
          <div class="dialogue-actions" style="margin-top: 20px;">
            <button id="btn-close-shop" class="btn-action primary" style="font-size: 1.2rem; padding: 14px 28px;">
              📊 Close Shop & Count Cash
            </button>
          </div>
        </div>
        <div class="counter-desk">
          <div class="desk-register">
            <span>🎰</span>
            <div style="font-size: 0.95rem; font-weight: bold;">REGISTER #1</div>
          </div>
          <button id="btn-counter-save-quit-end" class="btn-action" style="padding: 8px 20px; font-size: 1rem; background: #fffdf9;">
            💾 Save & Quit
          </button>
        </div>
      </div>
    `;

    document.getElementById('btn-close-shop')?.addEventListener('click', () => {
      sound.playClick();
      onEndDay();
    });
    document.getElementById('btn-counter-save-quit-end')?.addEventListener('click', () => {
      onSaveAndQuit();
    });
    return;
  }

  // Active customer layout
  container.innerHTML = `
    <div class="counter-layout game-view">
      <!-- Ice Cream Parlor Background Elements -->
      <div class="parlor-wall"></div>
      <div class="parlor-wainscoting"></div>
      <div class="parlor-bunting"></div>

      <!-- Hanging Pendant Lamps -->
      <div class="parlor-lamps">
        <div class="pendant-lamp"><div class="lamp-cord"></div><div class="lamp-shade"><div class="lamp-glow"></div></div></div>
        <div class="pendant-lamp"><div class="lamp-cord"></div><div class="lamp-shade"><div class="lamp-glow"></div></div></div>
      </div>

      <!-- Glass Entrance Door -->
      <div class="parlor-door">
        <div class="door-glass">
          <div class="door-sign">WELCOME</div>
        </div>
        <div class="door-handle"></div>
      </div>

      <!-- Menu Board -->
      <div class="parlor-menu-board">
        <div class="menu-title">🍦 GOOD MENU 🍨</div>
        <div>• Scoop: $4.00</div>
        <div>• Double: $5.50</div>
        <div>• Sundae: $7.00</div>
        <div style="color: #ffb703; margin-top: 4px;">Top: Fudge / Berry</div>
      </div>

      <!-- Wall Clock & Award Poster -->
      <div class="parlor-clock">🕒</div>
      <div class="parlor-poster">
        <span style="font-size: 1rem;">🏆</span>
        <div>BEST SHOP 1998</div>
      </div>

      <!-- Neon Sign -->
      <div class="parlor-neon">OPEN 🍦</div>

      <!-- Multi-Pane Arch Window with Flower Box -->
      <div class="parlor-window">
        <div class="sun"></div>
        <div class="cloud"></div>
        <div class="window-grill-v"></div>
        <div class="window-grill-h"></div>
        <div class="flower-box">🌸🌼🌺</div>
      </div>

      <!-- Floating Shelf -->
      <div class="parlor-shelf">
        <div class="shelf-items">
          <span title="Cherry Jar">🍒</span>
          <span title="Sprinkles Shaker">🌈</span>
          <span title="Glass Sundae">🍨</span>
          <span title="Plant">🪴</span>
        </div>
      </div>

      <!-- Main Customer Counter Area -->
      <div class="counter-top">
        <div class="customer-area">
          <div class="patience-container" title="Customer Patience">
            <div id="patience-bar" class="patience-bar"></div>
          </div>
          <div id="customer-avatar" class="customer-avatar bounce" style="background-image: url('${getCustomerAvatarData(customer.avatar)}');"></div>
        </div>

        <div class="dialogue-bubble">
          <div style="font-size: 0.85rem; color: #888; margin-bottom: 4px; font-weight: bold;">
            Customer: ${customer.customerName}
          </div>
          <div id="dialogue-text">${customer.dialogue}</div>
        </div>

        <div class="dialogue-actions">
          <button id="btn-what" class="btn-action">❓ What?</button>
          <button id="btn-to-prep" class="btn-action primary">🍦 Make Ice Cream</button>
        </div>
      </div>

      <!-- Counter Desk -->
      <div class="counter-desk">
        <div class="desk-register">
          <span>🎰</span>
          <div style="font-size: 0.95rem; font-weight: bold;">REGISTER #1</div>
        </div>
        <button id="btn-counter-save-quit" class="btn-action" style="padding: 8px 20px; font-size: 1rem; background: #fffdf9;">
          💾 Save & Quit
        </button>
      </div>
    </div>
  `;

  // Patience decay timer
  const patienceBar = document.getElementById('patience-bar');
  const patienceInterval = setInterval(() => {
    if (gameState.currentView !== 'counter' && gameState.currentView !== 'prep') {
      clearInterval(patienceInterval);
      return;
    }
    gameState.customerPatience = Math.max(10, gameState.customerPatience - 0.4);
    if (patienceBar) {
      patienceBar.style.width = `${gameState.customerPatience}%`;
      if (gameState.customerPatience < 35) {
        patienceBar.style.background = 'linear-gradient(90deg, #e63946, #ff758f)';
      } else if (gameState.customerPatience < 65) {
        patienceBar.style.background = 'linear-gradient(90deg, #ffb703, #fdc500)';
      }
    }
  }, 1000);

  // Event Listeners
  document.getElementById('btn-what')?.addEventListener('click', () => {
    sound.playClick();
    gameState.customerPatience = Math.max(15, gameState.customerPatience - 10);
    const dialogueEl = document.getElementById('dialogue-text');
    if (dialogueEl) {
      dialogueEl.innerHTML = `<em>"${customer.hint}"</em>`;
    }
  });

  document.getElementById('btn-to-prep')?.addEventListener('click', () => {
    sound.playClick();
    onGoToPrep();
  });

  document.getElementById('btn-counter-save-quit')?.addEventListener('click', () => {
    onSaveAndQuit();
  });
}

// Returns asset paths for high-quality Good Pizza, Great Pizza styled customer avatar images
function getCustomerAvatarData(type: string): string {
  const avatarMap: Record<string, string> = {
    boy: '/assets/customers/boy.png',
    girl: '/assets/customers/girl.png',
    grandpa: '/assets/customers/grandpa.png',
    hipster: '/assets/customers/hipster.png',
    chef: '/assets/customers/chef.png',
    kid: '/assets/customers/kid.png',
    sailor: '/assets/customers/sailor.png'
  };

  return avatarMap[type] || avatarMap.boy;
}
