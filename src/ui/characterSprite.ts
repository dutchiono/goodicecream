import type { CharacterAppearance, CharacterBase } from '../game/characters';

export type SpriteMood = 'neutral' | 'happy' | 'unhappy' | 'talking';
export interface SpriteState { appearance: CharacterAppearance; mood?: SpriteMood; animated?: boolean }
const INK = '#624a49';
const WIDTH = 320;
const HEIGHT = 440;

interface Shape { face: string; halfWidth: number; headScale: number; headY: number; shoulder: number; eyes: number; nose: string }
const SHAPES: Record<CharacterBase, Shape> = {
  milo: { face: 'M90 117 Q84 72 119 56 Q155 37 192 57 Q230 72 231 119 C232 151 230 175 208 192 Q187 210 163 210 C132 210 106 194 97 171 Q89 148 90 117 Z', halfWidth: 69, headScale: 1, headY: 14, shoulder: 118, eyes: 31, nose: 'M149 132 C135 136 138 152 160 153 C182 152 181 135 169 132 Q159 127 149 132 Z' },
  ellis: { face: 'M103 100 Q101 56 151 49 Q208 44 217 94 C221 128 216 164 204 185 C193 205 177 216 161 216 C140 215 121 199 112 177 Q102 144 103 100 Z', halfWidth: 56, headScale: 1, headY: -12, shoulder: 101, eyes: 25, nose: 'M158 121 Q153 136 152 151 Q152 158 160 158 Q170 158 168 150 L165 124 Q162 116 158 121 Z' },
  june: { face: 'M96 110 Q88 69 130 53 Q173 35 208 67 Q230 84 224 125 C222 148 226 171 208 188 Q193 205 172 205 L151 205 Q119 204 106 181 C97 165 95 135 96 110 Z', halfWidth: 62, headScale: 1, headY: 7, shoulder: 116, eyes: 28, nose: 'M149 133 Q136 141 149 150 Q165 155 176 145 Q178 131 164 132 Z' },
  nia: { face: 'M99 103 Q98 62 147 50 Q192 43 217 76 Q230 98 222 132 C220 157 214 182 194 198 Q177 212 163 212 Q140 210 121 190 C106 174 100 137 99 103 Z', halfWidth: 60, headScale: 1, headY: 4, shoulder: 106, eyes: 25, nose: 'M159 130 Q150 140 151 149 Q161 156 171 148 Q173 143 165 132 Q162 127 159 130 Z' },
};

function path(ctx: CanvasRenderingContext2D, data: string, fill?: string, width = 2.2, ink = INK) {
  const shape = new Path2D(data);
  if (fill) { ctx.fillStyle = fill; ctx.fill(shape); }
  ctx.strokeStyle = ink;
  ctx.lineWidth = width;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.stroke(shape);
}

function ellipse(ctx: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number, fill: string, stroke = true, ink = INK) {
  ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fillStyle = fill; ctx.fill();
  if (stroke) { ctx.strokeStyle = ink; ctx.lineWidth = 2; ctx.stroke(); }
}

function shade(color: string, amount: number): string {
  return '#' + [1, 3, 5].map(index => Math.max(0, Math.min(255, parseInt(color.slice(index, index + 2), 16) + amount)).toString(16).padStart(2, '0')).join('');
}

function luminance(color: string): number {
  const channels = [1, 3, 5].map(index => {
    const channel = parseInt(color.slice(index, index + 2), 16) / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}

function drawBody(ctx: CanvasRenderingContext2D, a: CharacterAppearance, s: Shape, seconds: number) {
  const left = 160 - s.shoulder;
  const right = 160 + s.shoulder;
  const breath = Math.sin(seconds * 1.9) * 0.004;
  ctx.save(); ctx.translate(160, 430); ctx.scale(1 + breath, 1 - breath); ctx.translate(-160, -430);
  // Arms, torso and neck have independent silhouettes, with overlap at the joints.
  const armSway = Math.sin(seconds * 1.1) * 0.012;
  for (const side of [-1, 1]) {
    ctx.save(); ctx.translate(160 + side * (s.shoulder - 13), 276); ctx.rotate(side * armSway);
    const arm = a.outfit === 'tee'
      ? 'M-29 51 Q-29 119 -24 164 L16 164 Q20 119 19 51 Z'
      : 'M-19 -7 C-30 14 -31 44 -29 75 Q-28 120 -24 164 L16 164 Q20 120 19 70 Q23 20 10 -8 Q-4 -16 -19 -7 Z';
    path(ctx, arm, a.outfit === 'tee' ? a.skin : a.clothing);
    if (a.outfit === 'tee') {
      const sleeve = 'M-19 -7 C-29 9 -31 32 -30 59 Q-7 68 20 59 L20 27 Q20 4 10 -8 Q-4 -16 -19 -7 Z';
      path(ctx, sleeve, a.clothing);
      ctx.save(); ctx.clip(new Path2D(sleeve));
      ctx.fillStyle = a.accent;
      for (let y = 280; y < 350; y += 43) ctx.fillRect(-40, y - 276, 80, 18);
      ctx.restore();
      path(ctx, sleeve);
    } else {
      path(ctx, 'M-26 148 Q-6 154 17 148', undefined, 1.4);
    }
    ctx.restore();
  }
  const torso = `M${left} 274 C${left + 3} 250 ${left + 35} 239 132 230 Q160 224 188 230 C${right - 35} 239 ${right - 3} 250 ${right} 274 C${right + 3} 325 ${right - 5} 350 ${right + 1} 389 Q${right + 5} 415 ${right + 1} 440 L${left - 1} 440 Q${left - 5} 415 ${left - 1} 389 C${left + 5} 350 ${left - 3} 325 ${left} 274 Z`;
  path(ctx, torso, a.clothing);
  ctx.save(); ctx.clip(new Path2D(torso));
  if (a.outfit === 'tee') {
    ctx.fillStyle = a.accent;
    for (let y = 280; y < 440; y += 43) ctx.fillRect(0, y, WIDTH, 18);
  } else {
    path(ctx, 'M133 232 Q160 227 187 232 Q197 333 198 440 L122 440 Q123 333 133 232 Z', a.accent);
    if (a.outfit === 'shirt') {
      path(ctx, 'M129 232 Q118 237 115 249 Q124 268 140 281 Q151 265 159 253 Q142 244 129 232 Z', a.clothing);
      path(ctx, 'M190 232 Q201 237 205 249 Q197 268 183 281 Q173 265 161 253 Q179 244 190 232 Z', a.clothing);
      path(ctx, `M${right - 50} 304 Q${right - 55} 304 ${right - 55} 310 L${right - 54} 339 Q${right - 36} 351 ${right - 18} 339 L${right - 17} 310 Q${right - 17} 304 ${right - 23} 304 Z`, a.clothing, 1.7);
    } else {
      path(ctx, 'M128 232 Q116 325 116 440 M190 232 Q202 325 202 440', undefined, 2.6);
    }
    for (let y = 304; y < 440; y += 36) ellipse(ctx, 119, y, 2.5, 2.5, a.accent);
  }
  ctx.restore();
  const seamBottom = a.outfit === 'tee' ? 329 : 430;
  const seamMiddle = a.outfit === 'tee' ? 308 : 340;
  path(ctx, `M${left + 24} 284 Q${left + 34} ${seamMiddle} ${left + 25} ${seamBottom} M${right - 24} 284 Q${right - 34} ${seamMiddle} ${right - 25} ${seamBottom}`, undefined, 1.4);
  path(ctx, 'M133 191 Q136 213 132 230 Q141 249 161 252 Q181 248 190 230 Q186 212 188 191 Z', a.skin);
  path(ctx, 'M127 232 Q139 259 161 260 Q185 256 195 232', undefined, 2);
  if (a.accessory === 'necklace') {
    ctx.strokeStyle = '#d6b060'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(133, 233); ctx.quadraticCurveTo(160, 288, 190, 233); ctx.stroke();
    ellipse(ctx, 161, 263, 5, 7, '#e7c66a');
  }
  ctx.restore();
}

function drawHairBack(ctx: CanvasRenderingContext2D, a: CharacterAppearance) {
  if (a.hairStyle === 'bob' || a.hairStyle === 'braids') {
    path(ctx, 'M94 142 Q78 71 118 44 Q161 18 205 47 Q242 70 231 151 Q231 188 237 211 Q241 226 225 230 Q209 234 195 211 Q158 205 118 210 Q99 233 86 224 Q78 220 83 207 Q92 174 94 142 Z', a.hair);
  }
}

function drawHairFront(ctx: CanvasRenderingContext2D, a: CharacterAppearance, s: Shape) {
  const left = 160 - s.halfWidth;
  const right = 160 + s.halfWidth;
  if (a.hairStyle === 'curls') {
    path(ctx, `M${left - 4} 126 Q${left - 18} 68 122 45 Q164 25 203 53 Q${right + 15} 76 ${right + 1} 123 L${right - 10} 94 Q190 86 165 70 Q133 92 ${left + 10} 103 Z`, a.hair);
    for (let i = 0; i < 9; i++) {
      const angle = Math.PI + i * Math.PI / 8;
      ellipse(ctx, 160 + Math.cos(angle) * s.halfWidth, 97 + Math.sin(angle) * 48, 14, 14, a.hair, false);
    }
    path(ctx, 'M123 67 Q128 59 138 65 M157 53 Q167 48 174 56 M191 66 Q202 65 204 75', undefined, 1.5);
  } else if (a.hairStyle === 'wave') {
    path(ctx, `M${left - 1} 123 Q${left - 16} 94 ${left - 6} 73 Q87 52 119 45 Q132 16 156 28 Q189 4 207 37 Q242 42 225 79 Q235 99 ${right + 1} 125 Q${right - 3} 126 ${right - 7} 104 Q${right - 9} 83 170 60 Q150 90 124 83 Q${left + 6} 99 ${left + 4} 119 Q${left + 3} 127 ${left - 1} 123 Z`, a.hair);
    path(ctx, 'M125 63 Q156 73 174 42 M183 35 Q210 30 213 54 M111 71 Q101 84 113 95', undefined, 1.6);
  } else if (a.hairStyle === 'crop') {
    path(ctx, `M${left - 2} 126 Q${left - 9} 118 ${left - 10} 99 Q${left - 22} 91 ${left - 12} 78 Q${left - 17} 57 119 49 Q122 32 143 42 Q159 27 177 39 Q197 25 207 46 Q229 42 ${right + 10} 68 Q${right + 23} 81 ${right + 9} 101 Q${right + 10} 119 ${right + 3} 129 Q${right - 5} 128 ${right - 8} 105 Q210 90 201 79 Q194 91 184 91 Q178 90 182 78 Q171 93 162 90 Q155 88 158 77 Q145 92 138 87 Q132 83 134 77 Q${left + 10} 91 ${left + 6} 111 Q${left + 4} 129 ${left - 2} 126 Z`, a.hair);
  } else {
    path(ctx, `M${left} 133 Q${left - 17} 67 128 43 Q165 24 198 47 Q${right + 18} 70 ${right} 133 Q${right - 3} 140 ${right - 7} 122 Q${right - 9} 105 ${right - 14} 100 Q181 79 162 57 Q140 87 ${left + 12} 104 Q${left + 8} 116 ${left + 5} 130 Q${left + 3} 139 ${left} 133 Z`, a.hair);
    path(ctx, 'M162 57 Q166 39 160 36', undefined, 1.8);
    if (a.hairStyle === 'braids') {
      for (const side of [-1, 1]) {
        for (let i = 0; i < 5; i++) {
          ellipse(ctx, 160 + side * (s.halfWidth - 3) + Math.sin(i * 2) * 3, 169 + i * 18, 12 - i * 0.7, 14, a.hair);
        }
        path(ctx, `M${160 + side * (s.halfWidth - 3) - 7} 246 l13 0`, undefined, 4);
      }
    }
  }
}

// Paths remain separate at runtime: palette swaps do not tint skin, ink or accessories.
export function drawCharacter(canvas: HTMLCanvasElement, a: CharacterAppearance, seconds = 0, mood: SpriteMood = 'neutral', animated = true) {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Character sprites require a 2D canvas.');
  const s = SHAPES[a.base];
  const skinLuminance = luminance(a.skin);
  const darkSkin = skinLuminance < 0.2;
  const faceInk = skinLuminance < 0.045 ? '#ead6c6' : '#291d26';
  ctx.setTransform(canvas.width / WIDTH, 0, 0, canvas.height / HEIGHT, 0, 0);
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  const t = animated ? seconds : 0;
  ctx.save();
  ctx.translate(Math.sin(t * 0.85) * 1.8, 0);
  drawBody(ctx, a, s, t);
  ctx.save();
  ctx.translate(160, 231 + s.headY);
  ctx.rotate(Math.sin(t * 0.8) * 0.014);
  ctx.translate(-160, -231);
  ctx.translate(0, Math.sin(t * 1.9) * 1.8);
  drawHairBack(ctx, a);
  ellipse(ctx, 160 - s.halfWidth - 3, 133, 18, 24, a.skin);
  ellipse(ctx, 160 + s.halfWidth + 3, 133, 18, 24, a.skin);
  path(ctx, `M${160 - s.halfWidth - 9} 133 q9 -10 15 3 M${160 + s.halfWidth + 9} 133 q-9 -10 -15 3`, undefined, 1.6);
  path(ctx, s.face, a.skin, 2.2, darkSkin ? faceInk : INK);
  drawHairFront(ctx, a, s);
  const blink = animated && t % 4.7 > 4.52;
  for (const side of [-1, 1]) {
    const x = 160 + side * s.eyes;
    if (blink || mood === 'happy') path(ctx, `M${x - 5} 116 q5 ${mood === 'happy' ? -6 : 2} 10 0`, undefined, 2.8, faceInk);
    else {
      ellipse(ctx, x, 117, 4.3, mood === 'unhappy' ? 4.3 : 5.8, faceInk, false);
      if (darkSkin && skinLuminance >= 0.045) ellipse(ctx, x - 1, 115, 1.1, 1.3, '#f4dfcb', false);
    }
    path(ctx, `M${x - 8} ${mood === 'unhappy' && side === 1 ? 102 : 99} q8 -3 15 0`, undefined, 3.4, faceInk);
  }
  path(ctx, s.nose, shade(a.skin, darkSkin ? 15 : -15), 2.1, faceInk);
  if (mood === 'talking') ellipse(ctx, 162, 176, 7, 3 + (Math.sin(t * 19) + 1) * 3.5, faceInk, false);
  else path(ctx, mood === 'unhappy' ? 'M151 180 Q161 172 172 179' : mood === 'happy' ? 'M148 173 Q161 197 176 172 Z' : 'M153 176 Q162 184 173 174', mood === 'happy' ? '#f7e5d1' : undefined, 2.7, faceInk);
  for (const side of [-1, 1]) ellipse(ctx, 160 + side * (s.eyes + 7), 145, 10, 5, shade(a.skin, -6), false);
  if (a.accessory === 'glasses') {
    ellipse(ctx, 160 - s.eyes, 119, 18, 18, 'rgba(247,244,231,0.10)', true, faceInk);
    ellipse(ctx, 160 + s.eyes, 119, 18, 18, 'rgba(247,244,231,0.10)', true, faceInk);
    path(ctx, `M${178 - s.eyes} 117 Q160 111 ${142 + s.eyes} 117 M${142 - s.eyes} 117 l-12 -4 M${178 + s.eyes} 117 l12 -4`, undefined, 2.2, faceInk);
  } else if (a.accessory === 'earrings') {
    for (const side of [-1, 1]) ellipse(ctx, 160 + side * (s.halfWidth + 5), 157, 5, 9, '#e6bf64');
  }
  ctx.restore();
  ctx.restore();
}

export function mountCharacterSprite(canvas: HTMLCanvasElement, getState: () => SpriteState): () => void {
  const scale = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = WIDTH * scale; canvas.height = HEIGHT * scale;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const startedAt = performance.now();
  let frameId = 0;
  let stopped = false;
  let lastFrame = -Infinity;
  function frame(now: number) {
    if (stopped || !canvas.isConnected) return;
    if (!document.hidden && now - lastFrame >= 1000 / 30) {
      const state = getState();
      drawCharacter(canvas, state.appearance, (now - startedAt) / 1000, state.mood, state.animated !== false && !reducedMotion.matches);
      lastFrame = now;
    }
    frameId = requestAnimationFrame(frame);
  }
  frame(performance.now());
  return () => { stopped = true; cancelAnimationFrame(frameId); };
}

export function downloadCharacterSprite(appearance: CharacterAppearance) {
  const canvas = document.createElement('canvas');
  canvas.width = WIDTH * 2; canvas.height = HEIGHT * 2;
  drawCharacter(canvas, appearance, 0, 'neutral', false);
  const link = document.createElement('a');
  link.download = `${appearance.base}-${appearance.clothing.slice(1)}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}
