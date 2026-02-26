import { monthNow, getMonthKey } from "./store.js";

const money = (n) =>
  Number(n || 0).toLocaleString(undefined, { style: "currency", currency: "CAD" });

const clamp01 = (x) => Math.max(0, Math.min(1, x));

export function computeMonthSummary(state, ym = monthNow()) {
  const tx = state.transactions.filter((t) => getMonthKey(t.date) === ym);

  const income = tx
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + Number(t.amount), 0);

  const expenses = tx
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + Number(t.amount), 0);

  const spentByCat = {};
  for (const t of tx) {
    if (t.type !== "expense") continue;
    spentByCat[t.categoryId] = (spentByCat[t.categoryId] || 0) + Number(t.amount);
  }

  return { ym, income, expenses, net: income - expenses, tx, spentByCat };
}

export function coachInsights(state, ym = monthNow()) {
  const { income, expenses, net, spentByCat } = computeMonthSummary(state, ym);

  const insights = [];

  // Overspend / watchlist rules
  for (const c of state.categories) {
    const spent = Number(spentByCat[c.id] || 0);
    const limit = Number(c.limit || 0);
    if (limit <= 0) continue;

    const p = spent / limit;

    if (p >= 1) {
      insights.push({
        type: "alert",
        title: `Budget exceeded: ${c.name}`,
        message: `You spent ${money(spent)} vs a ${money(limit)} limit. Next move: pause ${c.name} spending and plan 1 swap (cheaper option or move to next month).`,
      });
    } else if (p >= 0.8) {
      insights.push({
        type: "warning",
        title: `Watchlist: ${c.name}`,
        message: `You used ${Math.round(p * 100)}% of your ${c.name} budget (${money(spent)} of ${money(
          limit
        )}). Next move: set a weekly cap for the rest of the month.`,
      });
    }
  }

  // Net cashflow hint
  if (income > 0 && net < 0) {
    insights.push({
      type: "warning",
      title: "You’re spending more than you earn",
      message: `This month you’re at ${money(net)} net. Next move: pick 1 category to cut by 10% and re-check in 7 days.`,
    });
  }

  // Goal pacing
  for (const g of state.goals) {
    const remaining = Math.max(0, Number(g.target) - Number(g.saved));
    const end = new Date(g.targetDate);
    const today = new Date();
    const days = Math.ceil((end - today) / (1000 * 60 * 60 * 24));

    if (remaining <= 0) {
      insights.push({
        type: "win",
        title: `Goal achieved: ${g.name}`,
        message: `You hit ${money(g.target)}. Next move: lock the habit by setting a new goal or raising this one.`,
      });
      continue;
    }

    if (days > 0) {
      const perWeek = remaining / (days / 7);
      insights.push({
        type: "tip",
        title: `Goal pacing: ${g.name}`,
        message: `You have ${money(remaining)} left with ${days} days to go. Next move: aim for ~${money(
          perWeek
        )}/week.`,
      });
    }
  }

  // Default nudge
  if (insights.length === 0) {
    insights.push({
      type: "tip",
      title: "Today’s Money Move",
      message: "Log one expense today. Consistency beats perfection — the data is what teaches you.",
    });
  }

  return insights.slice(0, 6);
}

export function progressForCategory(state, catId, ym = monthNow()) {
  const { spentByCat } = computeMonthSummary(state, ym);
  const cat = state.categories.find((c) => c.id === catId);
  const spent = Number(spentByCat[catId] || 0);
  const limit = Number(cat?.limit || 0);
  const ratio = limit > 0 ? clamp01(spent / limit) : 0;
  return { spent, limit, ratio };
}