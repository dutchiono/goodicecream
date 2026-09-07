export type VesselType = 'cone' | 'bowl' | 'sundae';
export type FlavorType = 'vanilla' | 'chocolate' | 'strawberry' | 'mint' | 'cookie_dough' | 'mango';
export type SyrupType = 'hot_fudge' | 'caramel' | 'strawberry_sauce';
export type ToppingType = 'sprinkles' | 'cherries' | 'choc_chips' | 'strawberries' | 'bananas' | 'oreos' | 'whipped_cream';
export type ToppingSide = 'all' | 'left' | 'right';

export interface PreparedSundae {
  vessel: VesselType | null;
  scoops: FlavorType[];
  syrups: SyrupType[];
  toppings: { type: ToppingType; side: ToppingSide }[];
  cost: number;
}

export interface CustomerOrder {
  id: string;
  customerName: string;
  avatar: string;
  dialogue: string;
  hint: string;
  targetVessel: VesselType;
  targetScoops: FlavorType[];
  targetSyrups: SyrupType[];
  targetToppings: { type: ToppingType; side: ToppingSide }[];
  basePrice: number;
}

export interface DaySummary {
  day: number;
  totalCustomers: number;
  happyCustomers: number;
  revenue: number;
  ingredientCosts: number;
  rentCost: number;
  tips: number;
  netProfit: number;
}

class GameState {
  public day: number = 1;
  public cash: number = 50.00;
  public currentView: 'title' | 'news' | 'counter' | 'prep' | 'register' | 'shop' = 'title';

  // Customer queue for current day
  public customerQueue: CustomerOrder[] = [];
  public currentCustomer: CustomerOrder | null = null;
  public customerPatience: number = 100; // 0-100
  public activePrep: PreparedSundae = {
    vessel: null,
    scoops: [],
    syrups: [],
    toppings: [],
    cost: 0
  };

  // Daily financial tracker
  public dailyStats = {
    totalCustomers: 0,
    happyCustomers: 0,
    revenue: 0,
    ingredientCosts: 0,
    rentCost: 10.00,
    tips: 0
  };

  // Unlocked items (Can be upgraded in shop)
  public unlocked = {
    vessels: ['cone', 'bowl', 'sundae'] as VesselType[],
    flavors: ['vanilla', 'chocolate', 'strawberry', 'mint'] as FlavorType[],
    syrups: ['hot_fudge', 'caramel'] as SyrupType[],
    toppings: ['sprinkles', 'cherries', 'choc_chips', 'strawberries'] as ToppingType[]
  };

  // Item prices / costs
  public itemCosts = {
    vessels: { cone: 0.30, bowl: 0.20, sundae: 0.50 },
    scoop: 0.40,
    syrup: 0.20,
    topping: 0.15
  };

  public activeSlot: number = 1;

  constructor() {
    this.migrateLegacySave();
    this.loadSave(1);
  }

  public migrateLegacySave() {
    try {
      const legacy = localStorage.getItem('good_ice_cream_save');
      if (legacy && !localStorage.getItem('good_ice_cream_save_slot_1')) {
        localStorage.setItem('good_ice_cream_save_slot_1', legacy);
      }
    } catch (e) {
      console.warn(e);
    }
  }

  public hasSaveData(): boolean {
    this.migrateLegacySave();
    for (let i = 1; i <= 3; i++) {
      if (localStorage.getItem(`good_ice_cream_save_slot_${i}`) !== null) return true;
    }
    return false;
  }

  public getSaveSlotsInfo(): { slotId: number; exists: boolean; day?: number; cash?: number; dateStr?: string }[] {
    this.migrateLegacySave();
    const slots = [];
    for (let i = 1; i <= 3; i++) {
      const raw = localStorage.getItem(`good_ice_cream_save_slot_${i}`);
      if (raw) {
        try {
          const data = JSON.parse(raw);
          const dateObj = data.savedAt ? new Date(data.savedAt) : null;
          const timeStr = dateObj ? dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' + dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Saved';
          slots.push({
            slotId: i,
            exists: true,
            day: data.day || 1,
            cash: data.cash !== undefined ? data.cash : 50.00,
            dateStr: timeStr
          });
        } catch {
          slots.push({ slotId: i, exists: false });
        }
      } else {
        slots.push({ slotId: i, exists: false });
      }
    }
    return slots;
  }

  public resetNewGame(slotId?: number) {
    if (slotId !== undefined) this.activeSlot = slotId;
    this.day = 1;
    this.cash = 50.00;
    this.customerQueue = [];
    this.currentCustomer = null;
    this.unlocked = {
      vessels: ['cone', 'bowl', 'sundae'],
      flavors: ['vanilla', 'chocolate', 'strawberry', 'mint'],
      syrups: ['hot_fudge', 'caramel'],
      toppings: ['sprinkles', 'cherries', 'choc_chips', 'strawberries']
    };
    this.dailyStats = {
      totalCustomers: 0,
      happyCustomers: 0,
      revenue: 0,
      ingredientCosts: 0,
      rentCost: 10.00,
      tips: 0
    };
    this.saveGame();
  }

  public resetPrep() {
    this.activePrep = {
      vessel: null,
      scoops: [],
      syrups: [],
      toppings: [],
      cost: 0
    };
  }

  public evaluateOrder(prep: PreparedSundae): {
    score: number;
    rating: number; // 1-5 stars
    tip: number;
    earnedRevenue: number;
    feedback: string;
  } {
    if (!this.currentCustomer) {
      return { score: 0, rating: 1, tip: 0, earnedRevenue: 0, feedback: 'No customer present!' };
    }

    const target = this.currentCustomer;
    let score = 100;
    const errors: string[] = [];

    // 1. Vessel check
    if (prep.vessel !== target.targetVessel) {
      score -= 35;
      errors.push(`Wrong dish! (Wanted ${target.targetVessel})`);
    }

    // 2. Scoops check (Count & Flavors)
    if (prep.scoops.length !== target.targetScoops.length) {
      score -= 20;
      errors.push(`Wrong number of scoops!`);
    } else {
      // Check individual flavor matches
      const targetFlavors = [...target.targetScoops].sort();
      const prepFlavors = [...prep.scoops].sort();
      for (let i = 0; i < targetFlavors.length; i++) {
        if (targetFlavors[i] !== prepFlavors[i]) {
          score -= 15;
          errors.push(`Missing ${targetFlavors[i]} scoop`);
          break;
        }
      }
    }

    // 3. Syrups check
    target.targetSyrups.forEach(s => {
      if (!prep.syrups.includes(s)) {
        score -= 15;
        errors.push(`Missing ${s.replace('_', ' ')} drizzle`);
      }
    });

    // 4. Toppings check
    target.targetToppings.forEach(t => {
      const match = prep.toppings.find(pt => pt.type === t.type && (pt.side === t.side || t.side === 'all'));
      if (!match) {
        score -= 10;
        errors.push(`Missing ${t.type.replace('_', ' ')}`);
      }
    });

    // Patience multiplier
    const patienceFactor = Math.max(0.5, this.customerPatience / 100);
    score = Math.max(0, Math.round(score * patienceFactor));

    // Calculate rating & tips
    let rating = 1;
    if (score >= 90) rating = 5;
    else if (score >= 75) rating = 4;
    else if (score >= 55) rating = 3;
    else if (score >= 35) rating = 2;

    const basePrice = target.basePrice;
    let tip = 0;
    let feedback = '';

    if (rating >= 4) {
      tip = parseFloat((basePrice * 0.25 * (score / 100)).toFixed(2));
      feedback = rating === 5 ? "PERFECT! This is the best ice cream ever!" : "Super delicious! Thank you so much!";
      this.dailyStats.happyCustomers++;
    } else if (rating === 3) {
      tip = parseFloat((basePrice * 0.10).toFixed(2));
      feedback = `It's pretty good, though ${errors[0] || 'could be a bit better'}.`;
    } else {
      feedback = `Oh dear... ${errors.join(', ')}. Not what I ordered!`;
    }

    const earnedRevenue = rating >= 2 ? basePrice : 0; // Refund if rating is 1

    // Record stats
    this.dailyStats.totalCustomers++;
    this.dailyStats.revenue += earnedRevenue;
    this.dailyStats.ingredientCosts += prep.cost;
    this.dailyStats.tips += tip;
    this.cash += (earnedRevenue + tip - prep.cost);

    return { score, rating, tip, earnedRevenue, feedback };
  }

  public endDay(): DaySummary {
    const summary: DaySummary = {
      day: this.day,
      totalCustomers: this.dailyStats.totalCustomers,
      happyCustomers: this.dailyStats.happyCustomers,
      revenue: parseFloat(this.dailyStats.revenue.toFixed(2)),
      ingredientCosts: parseFloat(this.dailyStats.ingredientCosts.toFixed(2)),
      rentCost: this.dailyStats.rentCost,
      tips: parseFloat(this.dailyStats.tips.toFixed(2)),
      netProfit: parseFloat((this.dailyStats.revenue + this.dailyStats.tips - this.dailyStats.ingredientCosts - this.dailyStats.rentCost).toFixed(2))
    };

    // Prepare next day
    this.day++;
    this.dailyStats = {
      totalCustomers: 0,
      happyCustomers: 0,
      revenue: 0,
      ingredientCosts: 0,
      rentCost: 10.00 + (this.day * 1.5), // Rent scales slightly per day
      tips: 0
    };

    this.saveGame();
    return summary;
  }

  public saveGame(slotId?: number) {
    try {
      const targetSlot = slotId !== undefined ? slotId : this.activeSlot;
      const data = {
        savedAt: Date.now(),
        day: this.day,
        cash: this.cash,
        unlocked: this.unlocked,
        currentView: this.currentView === 'prep' ? 'counter' : this.currentView,
        customerQueue: this.customerQueue,
        currentCustomer: this.currentCustomer,
        customerPatience: this.customerPatience,
        dailyStats: this.dailyStats
      };
      localStorage.setItem(`good_ice_cream_save_slot_${targetSlot}`, JSON.stringify(data));
      localStorage.setItem('good_ice_cream_save', JSON.stringify(data));
    } catch (e) {
      console.warn('LocalStorage save error', e);
    }
  }

  public loadSave(slotId?: number): boolean {
    this.migrateLegacySave();
    const targetSlot = slotId !== undefined ? slotId : this.activeSlot;
    try {
      let raw = localStorage.getItem(`good_ice_cream_save_slot_${targetSlot}`);
      if (!raw && targetSlot === 1) {
        raw = localStorage.getItem('good_ice_cream_save');
      }
      if (raw) {
        const data = JSON.parse(raw);
        this.activeSlot = targetSlot;
        if (data.day !== undefined) this.day = data.day;
        if (data.cash !== undefined) this.cash = data.cash;
        if (data.unlocked) this.unlocked = { ...this.unlocked, ...data.unlocked };
        if (data.customerQueue) this.customerQueue = data.customerQueue;
        if (data.currentCustomer) this.currentCustomer = data.currentCustomer;
        if (data.customerPatience !== undefined) this.customerPatience = data.customerPatience;
        if (data.dailyStats) this.dailyStats = { ...this.dailyStats, ...data.dailyStats };
        return true;
      }
    } catch (e) {
      console.warn('Save load error', e);
    }
    return false;
  }

  public deleteSaveSlot(slotId: number) {
    try {
      localStorage.removeItem(`good_ice_cream_save_slot_${slotId}`);
      if (slotId === 1) {
        localStorage.removeItem('good_ice_cream_save');
      }
    } catch (e) {
      console.warn('Delete save error', e);
    }
  }
}

export const gameState = new GameState();
