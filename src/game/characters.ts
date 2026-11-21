export const CHARACTER_BASES = ['milo', 'ellis', 'june', 'nia'] as const;
export type CharacterBase = typeof CHARACTER_BASES[number];
export type HairStyle = 'curls' | 'wave' | 'crop' | 'braids' | 'bob';
export type Outfit = 'tee' | 'shirt' | 'cardigan';
export type Accessory = 'none' | 'glasses' | 'earrings' | 'necklace';

export interface CharacterAppearance {
  base: CharacterBase;
  skin: string;
  hair: string;
  clothing: string;
  accent: string;
  hairStyle: HairStyle;
  outfit: Outfit;
  accessory: Accessory;
}

export const CLOTHING_COLORS = ['#739b89', '#7199b5', '#c37985', '#d0a453', '#8a80a2', '#c07859'];
export const HAIR_COLORS = ['#453039', '#6a4134', '#a66343', '#c8a25f', '#373a42', '#b5ada7'];
export const SKIN_COLORS = ['#f0c8a3', '#dfac82', '#c78e65', '#ad7357', '#8f5948', '#704538'];

export const CHARACTER_DEFAULTS: Record<CharacterBase, CharacterAppearance & { name: string }> = {
  milo: { name: 'Milo', base: 'milo', skin: '#c78e65', hair: '#453039', clothing: '#739b89', accent: '#f4e8cd', hairStyle: 'curls', outfit: 'tee', accessory: 'none' },
  ellis: { name: 'Ellis', base: 'ellis', skin: '#f0c8a3', hair: '#a66343', clothing: '#7199b5', accent: '#c07859', hairStyle: 'wave', outfit: 'shirt', accessory: 'none' },
  june: { name: 'June', base: 'june', skin: '#dfac82', hair: '#373a42', clothing: '#d0a453', accent: '#f4e8cd', hairStyle: 'crop', outfit: 'shirt', accessory: 'none' },
  nia: { name: 'Nia', base: 'nia', skin: '#8f5948', hair: '#453039', clothing: '#c37985', accent: '#a8b798', hairStyle: 'braids', outfit: 'cardigan', accessory: 'none' },
};

export function isCharacterBase(value: string): value is CharacterBase {
  return CHARACTER_BASES.includes(value as CharacterBase);
}

export function seededRandom(seed: string): () => number {
  let state = 2166136261;
  for (const letter of seed) state = Math.imul(state ^ letter.charCodeAt(0), 16777619);
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

export function createAppearance(base: CharacterBase, random = Math.random): CharacterAppearance {
  const pick = <T>(items: readonly T[]): T => items[Math.min(items.length - 1, Math.max(0, Math.floor(random() * items.length)))];
  return {
    ...CHARACTER_DEFAULTS[base],
    clothing: pick(CLOTHING_COLORS),
    accent: pick(CLOTHING_COLORS),
    skin: pick(SKIN_COLORS),
    hair: pick(HAIR_COLORS),
    hairStyle: pick([CHARACTER_DEFAULTS[base].hairStyle, base === 'nia' ? 'bob' : 'crop']),
    outfit: pick(['tee', 'shirt', 'cardigan'] as const),
    accessory: pick(['none', 'none', 'glasses', 'earrings', 'necklace'] as const),
  };
}

const LEGACY_BASES: Record<string, CharacterBase> = {
  boy: 'milo', girl: 'nia', grandpa: 'ellis', hipster: 'june', chef: 'ellis', kid: 'milo', sailor: 'june',
};

// Appearance data lives with the order, so returning from prep or loading a save never rerolls it.
export function ensureCustomerAppearance(customer: {
  id: string; avatar: string; customerName: string; appearance?: CharacterAppearance;
}): CharacterAppearance {
  const base = isCharacterBase(customer.avatar) ? customer.avatar : LEGACY_BASES[customer.avatar] ?? 'milo';
  if (!customer.appearance || !isCharacterBase(customer.appearance.base)) {
    customer.appearance = createAppearance(base, seededRandom(customer.id));
  }
  customer.avatar = customer.appearance.base;
  customer.customerName = CHARACTER_DEFAULTS[customer.appearance.base].name;
  return customer.appearance;
}
