import React, { useMemo, useState } from "react";
import { loadState, saveState } from "../lib/store.js";
import { grantXP } from "../lib/game.js";

const todayISO = () => new Date().toISOString().slice(0, 10);

export default function Add() {
  const [state, setState] = useState(() => loadState());

  const categories = useMemo(() => state.categories, [state]);

  const [type, setType] = useState("expense");
  const [categoryId, setCategoryId] = useState(categories[0]?.id || "food");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(todayISO());
  const [note, setNote] = useState("");
  const [needWant, setNeedWant] = useState("need");

  function onSubmit(e) {
    e.preventDefault();
    const n = Number(amount);
    if (!Number.isFinite(n) || n <= 0) return;

    const next = structuredClone(state);
    next.transactions.unshift({
      id: crypto.randomUUID(),
      type,
      categoryId,
      amount: n,
      date,
      note: note ? `${note} (${needWant})` : `(${needWant})`,
    });

    // Game XP: reward tracking
    grantXP(next, 15, "Logged a transaction");
    if (type === "income") grantXP(next, 5, "Logged income");

    saveState(next);
    setState(next);

    // Reset form (keep type/category/date)
    setAmount("");
    setNote("");
  }

  const quick = [
    { label: "$5 Coffee", type: "expense", categoryId: "food", amount: 5, note: "Coffee" },
    { label: "$20 Gas", type: "expense", categoryId: "transport", amount: 20, note: "Gas" },
    { label: "$50 Groceries", type: "expense", categoryId: "food", amount: 50, note: "Groceries" },
    { label: "+$100 Income", type: "income", categoryId: "savings", amount: 100, note: "Income" },
  ];

  function quickAdd(q) {
    const next = structuredClone(state);
    next.transactions.unshift({
      id: crypto.randomUUID(),
      type: q.type,
      categoryId: q.categoryId,
      amount: q.amount,
      date: todayISO(),
      note: q.note,
    });
    grantXP(next, 10, "Quick add");
    saveState(next);
    setState(next);
  }

  return (
    <div className="grid" style={{ gap: 12 }}>
      <div className="card">
        <div className="h1">Add Transaction</div>
        <div className="small">Coach tip: track daily — it’s the fastest way to learn your patterns.</div>
        <hr className="sep" />

        <div className="grid" style={{ gap: 10 }}>
          <div className="row" style={{ flexWrap: "wrap" }}>
            {quick.map((q) => (
              <button key={q.label} className="btn" onClick={() => quickAdd(q)}>
                {q.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <form onSubmit={onSubmit} className="grid" style={{ gap: 10 }}>
          <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
            <button
              type="button"
              className={`btn ${type === "expense" ? "primary" : ""}`}
              onClick={() => setType("expense")}
            >
              Expense
            </button>
            <button
              type="button"
              className={`btn ${type === "income" ? "primary" : ""}`}
              onClick={() => setType("income")}
            >
              Income
            </button>

            <span className="badge">Need/Want helps learning</span>
          </div>

          <div className="grid grid-2">
            <div>
              <div className="h2">Category</div>
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="h2">Amount</div>
              <input
                className="input"
                inputMode="decimal"
                placeholder="e.g. 12.50"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-2">
            <div>
              <div className="h2">Date</div>
              <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>

            <div>
              <div className="h2">Need or Want?</div>
              <select value={needWant} onChange={(e) => setNeedWant(e.target.value)}>
                <option value="need">Need</option>
                <option value="want">Want</option>
              </select>
            </div>
          </div>

          <div>
            <div className="h2">Note</div>
            <input
              className="input"
              placeholder="Optional (e.g. Subway sandwich)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <button className="btn primary" type="submit">
            Add
          </button>
        </form>
      </div>

      <div className="card">
        <div className="h1">Your XP</div>
        <div className="small">Tracking earns XP. Streaks build habits.</div>
        <hr className="sep" />
        <div className="row">
          <span className="badge">XP: {state.game?.xp ?? 0}</span>
          <span className="badge">Streak: {state.game?.streak ?? 0} days</span>
        </div>
        <div className="small" style={{ marginTop: 8 }}>
          Badges: {(state.game?.badges ?? []).length ? state.game.badges.join(", ") : "None yet"}
        </div>
      </div>
    </div>
  );
}