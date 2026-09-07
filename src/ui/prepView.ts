import { gameState, VesselType, FlavorType, SyrupType, ToppingType, ToppingSide } from '../game/state';
import { sound } from '../audio/sound';

export function renderPrepView(
  container: HTMLElement,
  onBackToCounter: () => void,
  onServeFinished: (result: any) => void,
  onSaveAndQuit: () => void
) {
  const customer = gameState.currentCustomer;
  const prep = gameState.activePrep;
  let activeTab: 'vessel' | 'scoop' | 'syrup' | 'topping' = 'vessel';
  let activeSide: ToppingSide = 'all';

  container.innerHTML = `
    <div class="prep-layout game-view">
      <!-- Sidebar with Order Ticket -->
      <aside class="prep-sidebar">
        <div class="receipt-ticket">
          <div class="receipt-title">ORDER #10${gameState.dailyStats.totalCustomers + 1}</div>
          <div style="font-weight: bold; margin-bottom: 6px;">Customer: ${customer ? customer.customerName : 'Walk-in'}</div>
          <div style="color: #666; font-size: 0.85rem; line-height: 1.3;">
            ${customer ? customer.dialogue : 'No order ticket'}
          </div>
        </div>

        <div style="margin-top: auto; display: flex; flex-direction: column; gap: 8px;">
          <button id="btn-prep-save-quit" class="btn-action" style="font-size: 0.95rem;">💾 Save & Quit</button>
          <button id="btn-trash-prep" class="btn-action" style="color: #d62828; border-color: #d62828;">🗑️ Trash ($${prep.cost.toFixed(2)})</button>
          <button id="btn-back-counter" class="btn-action">⬅️ Counter</button>
          <button id="btn-serve" class="btn-action primary" style="font-size: 1.1rem; padding: 12px;">🛎️ SERVE DISH!</button>
        </div>
      </aside>

      <!-- Prep Table Main Area -->
      <main class="prep-main">
        <div class="prep-canvas-container">
          <canvas id="prep-canvas" width="450" height="450"></canvas>
        </div>

        <!-- Controls Tray -->
        <div class="prep-controls">
          <div class="tray-tabs">
            <button class="tray-tab active" data-tab="vessel">🍨 1. Dishes</button>
            <button class="tray-tab" data-tab="scoop">🍦 2. Scoops</button>
            <button class="tray-tab" data-tab="syrup">🍫 3. Drizzle</button>
            <button class="tray-tab" data-tab="topping">🍒 4. Toppings</button>
          </div>

          <div id="tray-content" class="items-grid">
            <!-- Dynamic Tray items rendered here -->
          </div>

          <div id="side-selector-row" class="side-selector hidden">
            <span>Topping Side:</span>
            <button class="side-btn active" data-side="all">Whole Dish</button>
            <button class="side-btn" data-side="left">Left Half</button>
            <button class="side-btn" data-side="right">Right Half</button>
          </div>
        </div>
      </main>
    </div>
  `;

  const canvas = document.getElementById('prep-canvas') as HTMLCanvasElement;
  const ctx = canvas.getContext('2d')!;

  // Initial draw
  drawPrepCanvas(ctx, prep);
  renderTrayItems();

  // Tab switcher
  document.querySelectorAll('.tray-tab').forEach(tab => {
    tab.addEventListener('click', (e) => {
      sound.playClick();
      document.querySelectorAll('.tray-tab').forEach(t => t.classList.remove('active'));
      const target = e.currentTarget as HTMLElement;
      target.classList.add('active');
      activeTab = target.getAttribute('data-tab') as any;

      const sideRow = document.getElementById('side-selector-row');
      if (sideRow) {
        if (activeTab === 'topping') sideRow.classList.remove('hidden');
        else sideRow.classList.add('hidden');
      }

      renderTrayItems();
    });
  });

  // Topping Side selector
  document.querySelectorAll('.side-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      sound.playClick();
      document.querySelectorAll('.side-btn').forEach(b => b.classList.remove('active'));
      const target = e.currentTarget as HTMLElement;
      target.classList.add('active');
      activeSide = target.getAttribute('data-side') as ToppingSide;
    });
  });

  // Trash button
  document.getElementById('btn-trash-prep')?.addEventListener('click', () => {
    sound.playClick();
    gameState.resetPrep();
    drawPrepCanvas(ctx, gameState.activePrep);
    renderTrayItems();
  });

  // Back to Counter
  document.getElementById('btn-back-counter')?.addEventListener('click', () => {
    sound.playClick();
    onBackToCounter();
  });

  // Serve Button
  document.getElementById('btn-serve')?.addEventListener('click', () => {
    if (!prep.vessel) {
      alert("Please select a dish/cone first!");
      return;
    }
    const result = gameState.evaluateOrder(prep);
    sound.playCashRegister();
    onServeFinished(result);
  });

  // Save & Quit button
  document.getElementById('btn-prep-save-quit')?.addEventListener('click', () => {
    onSaveAndQuit();
  });

  function renderTrayItems() {
    const container = document.getElementById('tray-content')!;
    container.innerHTML = '';

    if (activeTab === 'vessel') {
      const vessels: { type: VesselType; name: string; icon: string; price: number }[] = [
        { type: 'cone', name: 'Waffle Cone', icon: '🍦', price: 0.30 },
        { type: 'bowl', name: 'Paper Bowl', icon: '🥣', price: 0.20 },
        { type: 'sundae', name: 'Glass Dish', icon: '🍨', price: 0.50 }
      ];

      vessels.forEach(v => {
        const isSel = prep.vessel === v.type;
        const card = document.createElement('div');
        card.className = `item-card ${isSel ? 'selected' : ''}`;
        card.innerHTML = `<span class="icon">${v.icon}</span><span class="label">${v.name}</span>`;
        card.addEventListener('click', () => {
          sound.playClick();
          prep.vessel = v.type;
          prep.cost += gameState.itemCosts.vessels[v.type];
          drawPrepCanvas(ctx, prep);
          renderTrayItems();
        });
        container.appendChild(card);
      });
    } else if (activeTab === 'scoop') {
      const flavorDefs: { type: FlavorType; name: string; color: string }[] = [
        { type: 'vanilla', name: 'Vanilla', color: '#fffdf0' },
        { type: 'chocolate', name: 'Chocolate', color: '#5c3d2e' },
        { type: 'strawberry', name: 'Strawberry', color: '#ffb3c6' },
        { type: 'mint', name: 'Mint Chip', color: '#b7e4c7' },
        { type: 'cookie_dough', name: 'Cookie Dough', color: '#e9d8a6' },
        { type: 'mango', name: 'Mango', color: '#ffb703' }
      ];

      flavorDefs.filter(f => gameState.unlocked.flavors.includes(f.type)).forEach(f => {
        const card = document.createElement('div');
        card.className = 'item-card';
        card.innerHTML = `<div style="width: 32px; height: 32px; border-radius: 50%; background: ${f.color}; border: 2px solid #ccc;"></div><span class="label">${f.name}</span>`;
        card.addEventListener('click', () => {
          if (prep.scoops.length >= 3) {
            alert("Maximum 3 scoops per dish!");
            return;
          }
          sound.playScoop();
          prep.scoops.push(f.type);
          prep.cost += gameState.itemCosts.scoop;
          drawPrepCanvas(ctx, prep);
        });
        container.appendChild(card);
      });
    } else if (activeTab === 'syrup') {
      const syrups: { type: SyrupType; name: string; color: string }[] = [
        { type: 'hot_fudge', name: 'Hot Fudge', color: '#3d2314' },
        { type: 'caramel', name: 'Caramel', color: '#d48c46' },
        { type: 'strawberry_sauce', name: 'Strawberry', color: '#e63946' }
      ];

      syrups.filter(s => gameState.unlocked.syrups.includes(s.type)).forEach(s => {
        const card = document.createElement('div');
        card.className = 'item-card';
        card.innerHTML = `<div style="width: 14px; height: 28px; background: ${s.color}; border-radius: 4px;"></div><span class="label">${s.name}</span>`;
        card.addEventListener('click', () => {
          sound.playDrizzle();
          if (!prep.syrups.includes(s.type)) prep.syrups.push(s.type);
          prep.cost += gameState.itemCosts.syrup;
          drawPrepCanvas(ctx, prep);
        });
        container.appendChild(card);
      });
    } else if (activeTab === 'topping') {
      const toppings: { type: ToppingType; name: string; icon: string }[] = [
        { type: 'sprinkles', name: 'Sprinkles', icon: '🌈' },
        { type: 'cherries', name: 'Cherry', icon: '🍒' },
        { type: 'choc_chips', name: 'Choc Chips', icon: '🍫' },
        { type: 'strawberries', name: 'Sliced Berry', icon: '🍓' },
        { type: 'bananas', name: 'Bananas', icon: '🍌' },
        { type: 'oreos', name: 'Crushed Cookie', icon: '🍪' },
        { type: 'whipped_cream', name: 'Whip Cream', icon: '🍦' }
      ];

      toppings.filter(t => gameState.unlocked.toppings.includes(t.type)).forEach(t => {
        const card = document.createElement('div');
        card.className = 'item-card';
        card.innerHTML = `<span class="icon">${t.icon}</span><span class="label">${t.name}</span>`;
        card.addEventListener('click', () => {
          sound.playClick();
          prep.toppings.push({ type: t.type, side: activeSide });
          prep.cost += gameState.itemCosts.topping;
          drawPrepCanvas(ctx, prep);
        });
        container.appendChild(card);
      });
    }
  }
}

// Canvas Drawing Engine for Ice Cream
function drawPrepCanvas(ctx: CanvasRenderingContext2D, prep: any) {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  ctx.clearRect(0, 0, w, h);

  // Background pedestal
  ctx.fillStyle = '#f0f0f0';
  ctx.beginPath();
  ctx.ellipse(w / 2, h - 50, 140, 20, 0, 0, Math.PI * 2);
  ctx.fill();

  const centerX = w / 2;
  const baseY = h - 120;

  // 1. Draw Vessel
  if (prep.vessel === 'cone') {
    ctx.fillStyle = '#e09f67';
    ctx.beginPath();
    ctx.moveTo(centerX - 40, baseY);
    ctx.lineTo(centerX + 40, baseY);
    ctx.lineTo(centerX, baseY + 120);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#bc8a5f';
    ctx.lineWidth = 3;
    ctx.stroke();
    // Grid lines for waffle cone
    ctx.beginPath();
    ctx.moveTo(centerX - 25, baseY + 30);
    ctx.lineTo(centerX + 15, baseY + 80);
    ctx.moveTo(centerX + 25, baseY + 30);
    ctx.lineTo(centerX - 15, baseY + 80);
    ctx.stroke();
  } else if (prep.vessel === 'bowl') {
    ctx.fillStyle = '#ffb3c6';
    ctx.beginPath();
    ctx.ellipse(centerX, baseY + 20, 90, 45, 0, 0, Math.PI);
    ctx.fill();
    ctx.strokeStyle = '#ff7597';
    ctx.lineWidth = 4;
    ctx.stroke();
  } else if (prep.vessel === 'sundae') {
    // Glass stem
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.strokeStyle = '#a8dadc';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(centerX - 15, baseY + 50);
    ctx.lineTo(centerX + 15, baseY + 50);
    ctx.lineTo(centerX + 8, baseY + 110);
    ctx.lineTo(centerX - 8, baseY + 110);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Glass base
    ctx.beginPath();
    ctx.ellipse(centerX, baseY + 110, 45, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Bowl cup
    ctx.beginPath();
    ctx.ellipse(centerX, baseY + 30, 80, 50, 0, 0, Math.PI);
    ctx.fill();
    ctx.stroke();
  }

  // 2. Draw Scoops
  const colors: Record<FlavorType, string> = {
    vanilla: '#fffdf0',
    chocolate: '#5c3d2e',
    strawberry: '#ffb3c6',
    mint: '#b7e4c7',
    cookie_dough: '#e9d8a6',
    mango: '#ffb703'
  };

  const scoopPositions = [
    { x: centerX, y: baseY - 10, r: 50 },
    { x: centerX - 30, y: baseY - 60, r: 48 },
    { x: centerX + 30, y: baseY - 60, r: 48 }
  ];

  prep.scoops.forEach((flavor: FlavorType, idx: number) => {
    const pos = scoopPositions[idx] || { x: centerX, y: baseY - 100, r: 45 };
    ctx.fillStyle = colors[flavor] || '#fff';
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, pos.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.1)';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Scoop texture bumps
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.beginPath();
    ctx.arc(pos.x - 15, pos.y - 15, pos.r / 3, 0, Math.PI * 2);
    ctx.fill();
  });

  // 3. Draw Syrups
  if (prep.syrups.length > 0 && prep.scoops.length > 0) {
    prep.syrups.forEach((syrup: SyrupType) => {
      const color = syrup === 'hot_fudge' ? '#3d2314' : syrup === 'caramel' ? '#d48c46' : '#e63946';
      ctx.strokeStyle = color;
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(centerX - 40, baseY - 60);
      ctx.bezierCurveTo(centerX - 20, baseY - 90, centerX + 20, baseY - 30, centerX + 40, baseY - 70);
      ctx.stroke();
    });
  }

  // 4. Draw Toppings
  prep.toppings.forEach((topping: { type: ToppingType; side: ToppingSide }) => {
    const minX = topping.side === 'left' ? centerX - 60 : topping.side === 'right' ? centerX : centerX - 50;
    const maxX = topping.side === 'left' ? centerX : topping.side === 'right' ? centerX + 60 : centerX + 50;

    if (topping.type === 'cherries') {
      ctx.fillStyle = '#d62828';
      ctx.beginPath();
      ctx.arc(centerX, baseY - 105, 14, 0, Math.PI * 2);
      ctx.fill();
      // Stem
      ctx.strokeStyle = '#386641';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(centerX, baseY - 119);
      ctx.quadraticCurveTo(centerX + 10, baseY - 135, centerX + 15, baseY - 125);
      ctx.stroke();
    } else if (topping.type === 'sprinkles') {
      const sColors = ['#ff477e', '#ffb703', '#4cc9f0', '#70e000', '#7209b7'];
      for (let i = 0; i < 15; i++) {
        const rx = minX + Math.random() * (maxX - minX);
        const ry = baseY - 80 + Math.random() * 50;
        ctx.fillStyle = sColors[i % sColors.length];
        ctx.fillRect(rx, ry, 6, 3);
      }
    } else if (topping.type === 'choc_chips') {
      ctx.fillStyle = '#2b1e16';
      for (let i = 0; i < 10; i++) {
        const rx = minX + Math.random() * (maxX - minX);
        const ry = baseY - 75 + Math.random() * 45;
        ctx.beginPath();
        ctx.arc(rx, ry, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  });
}
