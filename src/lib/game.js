const todayISO = () => new Date().toISOString().slice(0, 10);

function addBadge(state, badgeId) {
  if (!state.game.badges.includes(badgeId)) state.game.badges.push(badgeId);
}

export function grantXP(state, amount, reason = "") {
  state.game.xp += amount;

  // Badge thresholds
  if (state.game.xp >= 50) addBadge(state, "starter");
  if (state.game.xp >= 150) addBadge(state, "consistent");
  if (state.game.xp >= 300) addBadge(state, "grinder");

  // Streak: counts days with at least 1 action that grants XP
  const today = todayISO();
  const last = state.game.lastActionDate;

  if (!last) {
    state.game.streak = 1;
  } else {
    const lastDate = new Date(last);
    const cur = new Date(today);
    const diffDays = Math.round((cur - lastDate) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      // same day, no streak change
    } else if (diffDays === 1) {
      state.game.streak += 1;
    } else {
      state.game.streak = 1;
    }
  }

  state.game.lastActionDate = today;

  // Streak badges
  if (state.game.streak >= 3) addBadge(state, "3day");
  if (state.game.streak >= 7) addBadge(state, "7day");

  return { amount, reason };
}

export const CHALLENGES = [
  {
    id: "log3",
    title: "Log 3 transactions",
    desc: "Track any 3 transactions this month.",
    xp: 40,
    check: (state, ym) =>
      state.transactions.filter((t) => t.date.startsWith(ym)).length >= 3,
  },
  {
    id: "setBudgets",
    title: "Set 5 budgets",
    desc: "Have 5 categories with a monthly limit > 0.",
    xp: 30,
    check: (state) => state.categories.filter((c) => Number(c.limit) > 0).length >= 5,
  },
  {
    id: "addGoal",
    title: "Create a goal",
    desc: "Add at least 1 savings goal.",
    xp: 30,
    check: (state) => state.goals.length >= 1,
  },
  {
    id: "underFood",
    title: "Keep Food under 80%",
    desc: "Food spending stays under 80% of its budget this month.",
    xp: 60,
    check: (state, ym) => {
      const food = state.categories.find((c) => c.id === "food");
      if (!food || Number(food.limit) <= 0) return false;
      const spent = state.transactions
        .filter((t) => t.type === "expense" && t.categoryId === "food" && t.date.startsWith(ym))
        .reduce((s, t) => s + Number(t.amount), 0);
      return spent / Number(food.limit) < 0.8;
    },
  },
];

export function completeChallenge(state, challengeId) {
  if (!state.game.completedChallengeIds.includes(challengeId)) {
    state.game.completedChallengeIds.push(challengeId);
    addBadge(state, "challenge");
  }
}