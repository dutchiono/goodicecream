export interface NewsArticle {
  headline: string;
  reporter: string;
  story: string;
  tip: string;
}

const NEWS_DATABASE: NewsArticle[] = [
  {
    headline: "HEATWAVE SWEEPS THE TOWN!",
    reporter: "Scoop News (ICNN)",
    story: "Local meteorologists report record high temperatures today! Citizens are flocking to ice cream shops for cold refreshing treats.",
    tip: "Expect high customer traffic today! Keep your scooping hand ready."
  },
  {
    headline: "HOT FUDGE FESTIVAL ANNOUNCED!",
    reporter: "Sundae Times",
    story: "The annual Hot Fudge Drizzle Parade is underway! Customers are extra excited for hot fudge drizzles on their scoops today.",
    tip: "Make sure you drizzle generously when hot fudge is requested!"
  },
  {
    headline: "CHOCOLATE VS VANILLA: THE ETERNAL DEBATE",
    reporter: "ICNN Morning Show",
    story: "In a nationwide poll, 50% preferred chocolate while 50% preferred vanilla. Double scoops are booming in popularity!",
    tip: "Double check your scoop counts when customers order multiple flavors."
  },
  {
    headline: "CHERRY ON TOP BREAKS WORLD RECORD",
    reporter: "Daily Scoop",
    story: "A giant maraschino cherry was unveiled in town square today. Cherry toppings have never been more popular!",
    tip: "Remember to place cherries right on top of the scoops."
  }
];

export function getDailyNews(day: number): NewsArticle {
  const index = (day - 1) % NEWS_DATABASE.length;
  return NEWS_DATABASE[index];
}
