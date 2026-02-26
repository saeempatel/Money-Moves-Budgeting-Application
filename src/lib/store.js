const KEY = "moneyMoves:v1";

const todayISO = () => new Date().toISOString().slice(0, 10);

const defaultState = () => ({
  categories: [
    { id: "food", name: "Food", limit: 300 },
    { id: "fun", name: "Fun", limit: 120 },
    { id: "bills", name: "Bills", limit: 800 },
    { id: "transport", name: "Transport", limit: 150 },
    { id: "savings", name: "Savings", limit: 200 }
  ],
  transactions: [
    { id: crypto.randomUUID(), type: "expense", categoryId: "food", amount: 18.5, date: todayISO(), note: "Lunch" },
    { id: crypto.randomUUID(), type: "expense", categoryId: "fun", amount: 25, date: todayISO(), note: "Movie" }
  ],
  goals: [
    { id: crypto.randomUUID(), name: "Emergency Fund", target: 1000, saved: 200, targetDate: addDays(90) }
  ],
  game: {
    xp: 0,
    streak: 0,
    lastActionDate: null,
    badges: [],
    completedChallengeIds: []
  }
});

function addDays(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

export function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    return parsed;
  } catch {
    return defaultState();
  }
}

export function saveState(state) {
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function resetState() {
  const s = defaultState();
  saveState(s);
  return s;
}

export function getMonthKey(dateISO) {
  return dateISO.slice(0, 7); // YYYY-MM
}

export function monthNow() {
  return new Date().toISOString().slice(0, 7);
}