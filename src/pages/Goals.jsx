import React, { useState } from "react";
import { loadState, saveState } from "../lib/store.js";
import { grantXP } from "../lib/game.js";

const money = (n) =>
  Number(n || 0).toLocaleString(undefined, { style: "currency", currency: "CAD" });

export default function Goals() {
  const [state, setState] = useState(() => loadState());

  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [saved, setSaved] = useState("");
  const [targetDate, setTargetDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 60);
    return d.toISOString().slice(0, 10);
  });

  function addGoal(e) {
    e.preventDefault();
    const t = Number(target);
    const s = Number(saved || 0);
    if (!name.trim() || !Number.isFinite(t) || t <= 0) return;

    const next = structuredClone(state);
    next.goals.push({
      id: crypto.randomUUID(),
      name: name.trim(),
      target: t,
      saved: Number.isFinite(s) && s >= 0 ? s : 0,
      targetDate,
    });

    grantXP(next, 25, "Created a goal");
    saveState(next);
    setState(next);

    setName("");
    setTarget("");
    setSaved("");
  }

  function updateSaved(goalId, delta) {
    const next = structuredClone(state);
    const g = next.goals.find((x) => x.id === goalId);
    if (!g) return;
    g.saved = Math.max(0, Number(g.saved) + delta);
    grantXP(next, 10, "Updated goal progress");
    saveState(next);
    setState(next);
  }

  function removeGoal(goalId) {
    if (!confirm("Delete this goal?")) return;
    const next = structuredClone(state);
    next.goals = next.goals.filter((g) => g.id !== goalId);
    saveState(next);
    setState(next);
  }

  return (
    <div className="grid" style={{ gap: 12 }}>
      <div className="card">
        <div className="h1">Goals</div>
        <div className="small">
          Coach tip: goals work best when they’re specific + time-based.
        </div>
      </div>

      <div className="card">
        <div className="h1">Add a goal</div>
        <hr className="sep" />
        <form onSubmit={addGoal} className="grid" style={{ gap: 10 }}>
          <div className="grid grid-2">
            <div>
              <div className="h2">Goal name</div>
              <input
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. New laptop"
              />
            </div>
            <div>
              <div className="h2">Target date</div>
              <input
                className="input"
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-2">
            <div>
              <div className="h2">Target amount</div>
              <input
                className="input"
                inputMode="decimal"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="e.g. 800"
              />
            </div>
            <div>
              <div className="h2">Already saved</div>
              <input
                className="input"
                inputMode="decimal"
                value={saved}
                onChange={(e) => setSaved(e.target.value)}
                placeholder="e.g. 100"
              />
            </div>
          </div>

          <button className="btn primary" type="submit">
            Add goal
          </button>
        </form>
      </div>

      <div className="grid" style={{ gap: 10 }}>
        {state.goals.map((g) => {
          const ratio = g.target > 0 ? Math.min(1, g.saved / g.target) : 0;
          const pct = Math.round(ratio * 100);
          return (
            <div key={g.id} className="card">
              <div className="row">
                <div>
                  <div className="h1" style={{ fontSize: 16 }}>{g.name}</div>
                  <div className="small">
                    {money(g.saved)} / {money(g.target)} • by {g.targetDate}
                  </div>
                </div>
                <div className="badge">{pct}%</div>
              </div>

              <div className="progress" style={{ marginTop: 10 }}>
                <div style={{ width: `${pct}%` }} />
              </div>

              <div className="row" style={{ marginTop: 10, flexWrap: "wrap" }}>
                <button className="btn" onClick={() => updateSaved(g.id, 10)}>
                  +$10
                </button>
                <button className="btn" onClick={() => updateSaved(g.id, 50)}>
                  +$50
                </button>
                <button className="btn danger" onClick={() => updateSaved(g.id, -10)}>
                  −$10
                </button>
                <button className="btn danger" onClick={() => removeGoal(g.id)}>
                  Delete
                </button>
              </div>
            </div>
          );
        })}
        {state.goals.length === 0 && <div className="small">No goals yet. Add one above.</div>}
      </div>

      <div className="card">
        <div className="h1">Game stats</div>
        <div className="small">Goals earn XP because they create direction.</div>
        <hr className="sep" />
        <div className="row">
          <span className="badge">XP: {state.game?.xp ?? 0}</span>
          <span className="badge">Streak: {state.game?.streak ?? 0} days</span>
        </div>
      </div>
    </div>
  );
}