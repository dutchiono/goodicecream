import { CustomerOrder, FlavorType, VesselType, SyrupType, ToppingType, ToppingSide } from './state';

interface CustomerPreset {
  name: string;
  avatarSvg: string; // SVG icon generator or character identifier
  dialogue: string;
  hint: string;
  targetVessel: VesselType;
  targetScoops: FlavorType[];
  targetSyrups: SyrupType[];
  targetToppings: { type: ToppingType; side: ToppingSide }[];
  basePrice: number;
}

const CUSTOMER_PRESETS: CustomerPreset[] = [
  {
    name: "Oliver",
    avatarSvg: "boy",
    dialogue: "Hi! Can I get a classic Vanilla Cone with hot fudge and sprinkles?",
    hint: "One Vanilla scoop on a Waffle Cone with Hot Fudge and Rainbow Sprinkles.",
    targetVessel: "cone",
    targetScoops: ["vanilla"],
    targetSyrups: ["hot_fudge"],
    targetToppings: [{ type: "sprinkles", side: "all" }],
    basePrice: 4.50
  },
  {
    name: "Maya",
    avatarSvg: "girl",
    dialogue: "Double Chocolate overload! Two chocolate scoops in a bowl with chocolate chips!",
    hint: "Two Chocolate scoops in a Paper Bowl with Chocolate Chips.",
    targetVessel: "bowl",
    targetScoops: ["chocolate", "chocolate"],
    targetSyrups: ["hot_fudge"],
    targetToppings: [{ type: "choc_chips", side: "all" }],
    basePrice: 5.50
  },
  {
    name: "Professor Paws",
    avatarSvg: "grandpa",
    dialogue: "I'd like a Neapolitan Sundae! Vanilla, Chocolate, and Strawberry all together!",
    hint: "Three scoops (Vanilla, Chocolate, Strawberry) in a Sundae Glass with Hot Fudge & Cherry.",
    targetVessel: "sundae",
    targetScoops: ["vanilla", "chocolate", "strawberry"],
    targetSyrups: ["hot_fudge"],
    targetToppings: [{ type: "cherries", side: "all" }],
    basePrice: 7.00
  },
  {
    name: "Zoe",
    avatarSvg: "hipster",
    dialogue: "Gimme a Berry Breeze! Strawberry scoop with strawberry sauce and fresh sliced strawberries!",
    hint: "One Strawberry scoop in a Bowl with Strawberry Sauce and Sliced Strawberries.",
    targetVessel: "bowl",
    targetScoops: ["strawberry"],
    targetSyrups: ["strawberry_sauce"],
    targetToppings: [{ type: "strawberries", side: "all" }],
    basePrice: 5.00
  },
  {
    name: "Chef Mario",
    avatarSvg: "chef",
    dialogue: "Half and half! One side vanilla, one side chocolate on a sundae dish with caramel drizzle!",
    hint: "Vanilla & Chocolate scoops in a Sundae Dish with Caramel Drizzle.",
    targetVessel: "sundae",
    targetScoops: ["vanilla", "chocolate"],
    targetSyrups: ["caramel"],
    targetToppings: [],
    basePrice: 6.00
  },
  {
    name: "Sammy",
    avatarSvg: "kid",
    dialogue: "I want a snowy mountain with a red hat!",
    hint: "Vanilla scoop in a Waffle Cone with a Maraschino Cherry on top!",
    targetVessel: "cone",
    targetScoops: ["vanilla"],
    targetSyrups: [],
    targetToppings: [{ type: "cherries", side: "all" }],
    basePrice: 4.00
  },
  {
    name: "Captain Frost",
    avatarSvg: "sailor",
    dialogue: "Ahoy! Mint Chip in a bowl with hot fudge and chocolate chips for my voyage!",
    hint: "Mint Chip scoop in a Bowl with Hot Fudge and Chocolate Chips.",
    targetVessel: "bowl",
    targetScoops: ["mint"],
    targetSyrups: ["hot_fudge"],
    targetToppings: [{ type: "choc_chips", side: "all" }],
    basePrice: 5.25
  }
];

export function generateDailyCustomers(count = 4): CustomerOrder[] {
  // Shuffle presets and pick `count` orders
  const shuffled = [...CUSTOMER_PRESETS].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, Math.min(count, shuffled.length));

  return selected.map((preset, index) => ({
    id: `cust_${Date.now()}_${index}`,
    customerName: preset.name,
    avatar: preset.avatarSvg,
    dialogue: preset.dialogue,
    hint: preset.hint,
    targetVessel: preset.targetVessel,
    targetScoops: preset.targetScoops,
    targetSyrups: preset.targetSyrups,
    targetToppings: preset.targetToppings,
    basePrice: preset.basePrice
  }));
}
