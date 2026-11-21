import {
  CHARACTER_BASES, CHARACTER_DEFAULTS, CLOTHING_COLORS, HAIR_COLORS, SKIN_COLORS,
  createAppearance, type CharacterAppearance, type CharacterBase,
} from '../game/characters';
import { mountCharacterSprite, downloadCharacterSprite, type SpriteMood } from './characterSprite';

const drafts = new Map<CharacterBase, CharacterAppearance>();

export function renderCharacterStudio(container: HTMLElement, onClose: () => void, onUse: (appearance: CharacterAppearance) => void) {
  let selected: CharacterBase = 'milo';
  let animated = true;
  let mood: SpriteMood = 'neutral';
  let stopSprite: (() => void) | undefined;

  function appearance() {
    if (!drafts.has(selected)) drafts.set(selected, { ...CHARACTER_DEFAULTS[selected] });
    return drafts.get(selected)!;
  }

  function swatches(label: string, key: 'clothing' | 'accent' | 'hair' | 'skin', colors: string[]) {
    return `<fieldset class="studio-colors"><legend>${label}</legend><div class="studio-swatches">
      ${colors.map(color => `<button type="button" class="studio-swatch" style="--swatch:${color}" data-color-key="${key}" data-color="${color}" aria-label="${label} ${color}" aria-pressed="${appearance()[key] === color}" title="${label} ${color}"></button>`).join('')}
      <input type="color" aria-label="Custom ${label.toLowerCase()} color" data-custom-color="${key}" value="${appearance()[key]}" title="Custom ${label.toLowerCase()} color">
    </div></fieldset>`;
  }

  function render() {
    stopSprite?.();
    const a = appearance();
    container.innerHTML = `<section class="character-studio game-view">
      <header class="studio-header">
        <h1>Characters</h1>
        <div class="studio-commands">
          <button id="studio-shuffle" class="icon-btn" title="Randomize appearance" aria-label="Randomize appearance">&#x1F3B2;</button>
          <button id="studio-export" class="icon-btn" title="Download transparent sprite" aria-label="Download transparent sprite">&#x2913;</button>
          <button id="studio-close" class="icon-btn" title="Back to game" aria-label="Back to game">&#x2190;</button>
        </div>
      </header>
      <div class="studio-stage">
        <div class="parlor-wall"></div><div class="parlor-wainscoting"></div>
        <div class="studio-name">${CHARACTER_DEFAULTS[selected].name}</div>
        <canvas id="studio-sprite" role="img" aria-label="${CHARACTER_DEFAULTS[selected].name} character preview"></canvas>
        <div class="studio-counter"></div>
      </div>
      <form class="studio-controls" onsubmit="return false">
        <div class="studio-bases" role="tablist" aria-label="Base character">
          ${CHARACTER_BASES.map(base => `<button type="button" role="tab" data-base="${base}" aria-selected="${selected === base}">${CHARACTER_DEFAULTS[base].name}</button>`).join('')}
        </div>
        <label>Hair<select id="studio-hair">${options(['curls', 'wave', 'crop', 'braids', 'bob'], a.hairStyle)}</select></label>
        <label>Outfit<select id="studio-outfit">${options(['tee', 'shirt', 'cardigan'], a.outfit)}</select></label>
        <label>Accessory<select id="studio-accessory">${options(['none', 'glasses', 'earrings', 'necklace'], a.accessory)}</select></label>
        ${swatches('Clothing', 'clothing', CLOTHING_COLORS)}
        ${swatches('Accent', 'accent', ['#f4e8cd', ...CLOTHING_COLORS.slice(0, 5)])}
        ${swatches('Hair color', 'hair', HAIR_COLORS)}
        ${swatches('Skin tone', 'skin', SKIN_COLORS)}
        <label>Expression<select id="studio-mood">${options(['neutral', 'happy', 'unhappy', 'talking'], mood)}</select></label>
        <label class="studio-toggle"><input id="studio-animated" type="checkbox" ${animated ? 'checked' : ''}> Animate</label>
        <button type="button" id="studio-use" class="btn-action primary">Use in shop</button>
      </form>
    </section>`;

    const canvas = container.querySelector<HTMLCanvasElement>('#studio-sprite')!;
    stopSprite = mountCharacterSprite(canvas, () => ({ appearance: appearance(), mood, animated }));
    container.querySelectorAll<HTMLButtonElement>('[data-base]').forEach(button => {
      button.onclick = () => { selected = button.dataset.base as CharacterBase; render(); };
      button.onkeydown = event => {
        if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
        event.preventDefault();
        selected = CHARACTER_BASES[(CHARACTER_BASES.indexOf(selected) + (event.key === 'ArrowRight' ? 1 : 3)) % 4];
        render();
        container.querySelector<HTMLButtonElement>(`[data-base="${selected}"]`)?.focus();
      };
    });
    container.querySelectorAll<HTMLButtonElement>('[data-color]').forEach(button => {
      button.onclick = () => {
        const key = button.dataset.colorKey as 'clothing' | 'accent' | 'hair' | 'skin';
        appearance()[key] = button.dataset.color!;
        syncColors(key);
      };
    });
    container.querySelectorAll<HTMLInputElement>('[data-custom-color]').forEach(input => {
      input.oninput = () => {
        const key = input.dataset.customColor as 'clothing' | 'accent' | 'hair' | 'skin';
        appearance()[key] = input.value;
        syncColors(key);
      };
    });
    for (const key of ['hairStyle', 'outfit', 'accessory'] as const) {
      const id = key === 'hairStyle' ? 'hair' : key;
      const select = container.querySelector<HTMLSelectElement>(`#studio-${id}`)!;
      select.onchange = () => { Object.assign(appearance(), { [key]: select.value }); };
    }
    container.querySelector<HTMLSelectElement>('#studio-mood')!.onchange = event => { mood = (event.target as HTMLSelectElement).value as SpriteMood; };
    container.querySelector<HTMLInputElement>('#studio-animated')!.onchange = event => { animated = (event.target as HTMLInputElement).checked; };
    container.querySelector<HTMLButtonElement>('#studio-shuffle')!.onclick = () => { drafts.set(selected, createAppearance(selected)); render(); };
    container.querySelector<HTMLButtonElement>('#studio-export')!.onclick = () => downloadCharacterSprite(appearance());
    container.querySelector<HTMLButtonElement>('#studio-close')!.onclick = () => { stopSprite?.(); onClose(); };
    container.querySelector<HTMLButtonElement>('#studio-use')!.onclick = () => { stopSprite?.(); onUse({ ...appearance() }); };
  }

  function syncColors(key: 'clothing' | 'accent' | 'hair' | 'skin') {
    container.querySelectorAll<HTMLButtonElement>(`[data-color-key="${key}"]`).forEach(button => button.setAttribute('aria-pressed', String(button.dataset.color === appearance()[key])));
    container.querySelector<HTMLInputElement>(`[data-custom-color="${key}"]`)!.value = appearance()[key];
  }

  render();
}

function options(values: string[], selected: string) {
  return values.map(value => `<option value="${value}" ${value === selected ? 'selected' : ''}>${value[0].toUpperCase() + value.slice(1)}</option>`).join('');
}
