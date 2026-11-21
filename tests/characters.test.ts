import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  CHARACTER_BASES, CHARACTER_DEFAULTS, CLOTHING_COLORS,
  createAppearance, ensureCustomerAppearance, seededRandom,
} from '../src/game/characters.ts';

test('each base has a reproducible appearance without sharing mutable defaults', () => {
  for (const base of CHARACTER_BASES) {
    const original = JSON.stringify(CHARACTER_DEFAULTS[base]);
    const first = createAppearance(base, seededRandom('customer-42'));
    assert.deepEqual(first, createAppearance(base, seededRandom('customer-42')));
    assert.equal(first.base, base);
    assert.ok(CLOTHING_COLORS.includes(first.clothing));
    first.clothing = '#112233';
    assert.equal(JSON.stringify(CHARACTER_DEFAULTS[base]), original);
  }
});

test('old saved characters migrate to the new cast without changing their order identity', () => {
  for (const avatar of ['boy', 'girl', 'grandpa', 'hipster', 'chef', 'kid', 'sailor', 'unknown']) {
    const first = { id: 'saved-order-7', avatar, customerName: 'Old name' };
    const second = { ...first };
    const appearance = ensureCustomerAppearance(first);
    assert.deepEqual(appearance, ensureCustomerAppearance(second));
    assert.equal(first.id, 'saved-order-7');
    assert.equal(first.customerName, CHARACTER_DEFAULTS[appearance.base].name);
    assert.equal(first.avatar, appearance.base);
  }
});

test('custom appearances survive order serialization and normalization without rerolling', () => {
  const appearance = { ...createAppearance('nia', seededRandom('custom')), clothing: '#123456', hair: '#456789' };
  const restored = JSON.parse(JSON.stringify({ id: 'order-123', avatar: 'nia', customerName: 'Nia', appearance }));
  assert.deepEqual(ensureCustomerAppearance(restored), appearance);
  assert.equal(ensureCustomerAppearance(restored), restored.appearance);
});

test('seeded random values stay in range and produce a variety of clothing palettes', () => {
  const random = seededRandom('variants');
  const colors = new Set<string>();
  for (let i = 0; i < 100; i++) {
    const value = random();
    assert.ok(value >= 0 && value < 1);
    colors.add(createAppearance('milo', random).clothing);
  }
  assert.equal(colors.size, CLOTHING_COLORS.length);
});
