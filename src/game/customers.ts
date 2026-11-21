import type { CustomerOrder } from './state';
import { CHARACTER_BASES, CHARACTER_DEFAULTS, createAppearance } from './characters';

const ORDERS: Omit<CustomerOrder, 'id' | 'customerName' | 'avatar' | 'appearance'>[] = [
  {
    dialogue: 'Hi! A vanilla cone with hot fudge and rainbow sprinkles, please.',
    hint: 'One vanilla scoop in a cone, with hot fudge and sprinkles.',
    targetVessel: 'cone', targetScoops: ['vanilla'], targetSyrups: ['hot_fudge'],
    targetToppings: [{ type: 'sprinkles', side: 'all' }], basePrice: 4.50,
  },
  {
    dialogue: 'Chocolate, twice! Two chocolate scoops in a bowl, with fudge and chocolate chips.',
    hint: 'Two chocolate scoops in a bowl, with hot fudge and chocolate chips.',
    targetVessel: 'bowl', targetScoops: ['chocolate', 'chocolate'], targetSyrups: ['hot_fudge'],
    targetToppings: [{ type: 'choc_chips', side: 'all' }], basePrice: 5.50,
  },
  {
    dialogue: 'A little of everything! Vanilla, chocolate and strawberry in a sundae glass. Fudge and a cherry, too.',
    hint: 'One scoop each of vanilla, chocolate and strawberry in a sundae glass, with hot fudge and cherries.',
    targetVessel: 'sundae', targetScoops: ['vanilla', 'chocolate', 'strawberry'], targetSyrups: ['hot_fudge'],
    targetToppings: [{ type: 'cherries', side: 'all' }], basePrice: 7,
  },
  {
    dialogue: 'Something fresh: mint in a bowl with hot fudge and chocolate chips, please!',
    hint: 'One mint scoop in a bowl, with hot fudge and chocolate chips.',
    targetVessel: 'bowl', targetScoops: ['mint'], targetSyrups: ['hot_fudge'],
    targetToppings: [{ type: 'choc_chips', side: 'all' }], basePrice: 5.25,
  },
];

export function generateDailyCustomers(count = 4): CustomerOrder[] {
  const bases = [...CHARACTER_BASES];
  for (let i = bases.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [bases[i], bases[j]] = [bases[j], bases[i]];
  }
  return bases.slice(0, Math.max(0, count)).map((base, index) => ({
    ...ORDERS[index],
    id: `cust_${Date.now()}_${index}`,
    customerName: CHARACTER_DEFAULTS[base].name,
    avatar: base,
    appearance: createAppearance(base),
  }));
}
