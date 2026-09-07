import { gameState, FlavorType, SyrupType, ToppingType } from './state';
import { sound } from '../audio/sound';

export interface ShopItem {
  id: string;
  name: string;
  category: 'flavor' | 'syrup' | 'topping' | 'upgrade';
  description: string;
  price: number;
  unlocked: boolean;
  typeValue: string;
}

export const SHOP_CATALOG: ShopItem[] = [
  {
    id: 'flavor_mint',
    name: 'Mint Chip Ice Cream',
    category: 'flavor',
    description: 'Unlock cool, refreshing Mint Chocolate Chip scoops!',
    price: 25.00,
    unlocked: true,
    typeValue: 'mint'
  },
  {
    id: 'flavor_cookie_dough',
    name: 'Cookie Dough Flavor',
    category: 'flavor',
    description: 'Unlock delicious Cookie Dough ice cream scoops!',
    price: 35.00,
    unlocked: false,
    typeValue: 'cookie_dough'
  },
  {
    id: 'flavor_mango',
    name: 'Mango Sorbet',
    category: 'flavor',
    description: 'Unlock sweet & tangy tropical Mango Sorbet!',
    price: 45.00,
    unlocked: false,
    typeValue: 'mango'
  },
  {
    id: 'syrup_strawberry',
    name: 'Strawberry Drizzle',
    category: 'syrup',
    description: 'Unlock lush Strawberry Drizzle sauce!',
    price: 20.00,
    unlocked: true,
    typeValue: 'strawberry_sauce'
  },
  {
    id: 'topping_strawberries',
    name: 'Fresh Strawberries',
    category: 'topping',
    description: 'Unlock juicy sliced strawberries topping!',
    price: 18.00,
    unlocked: true,
    typeValue: 'strawberries'
  },
  {
    id: 'topping_bananas',
    name: 'Banana Slices',
    category: 'topping',
    description: 'Unlock fresh banana slices for classic banana splits!',
    price: 22.00,
    unlocked: false,
    typeValue: 'bananas'
  },
  {
    id: 'topping_oreos',
    name: 'Crushed Cookies',
    category: 'topping',
    description: 'Unlock crunchy crushed chocolate cookie crumbs!',
    price: 28.00,
    unlocked: false,
    typeValue: 'oreos'
  },
  {
    id: 'topping_whipped_cream',
    name: 'Whipped Cream',
    category: 'topping',
    description: 'Unlock fluffy whipped cream topping!',
    price: 30.00,
    unlocked: false,
    typeValue: 'whipped_cream'
  }
];

export function purchaseItem(item: ShopItem): boolean {
  if (gameState.cash >= item.price && !item.unlocked) {
    gameState.cash -= item.price;
    item.unlocked = true;

    // Add to unlocked state
    if (item.category === 'flavor') {
      gameState.unlocked.flavors.push(item.typeValue as FlavorType);
    } else if (item.category === 'syrup') {
      gameState.unlocked.syrups.push(item.typeValue as SyrupType);
    } else if (item.category === 'topping') {
      gameState.unlocked.toppings.push(item.typeValue as ToppingType);
    }

    sound.playCashRegister();
    gameState.saveGame();
    return true;
  }
  return false;
}
