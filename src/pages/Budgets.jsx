import React, { useState } from "react";
import { loadState, saveState } from "../lib/store.js";
import { grantXP } from "../lib/game.js";

export default function Budgets() {
  const [state, setState] = useState(() => loadState());

  function updateLimit(catId, value) {
    const next = structuredClone(state);
    const c = next.categories.find((x) => x.id === catId);
    if (!c) return;

    const n = Number(value);
    c.limit = Number.isFinite(n) && n >= 0 ? n : 0;
    saveState(next);
    setState(next);
  }

  function addCategory() {
    const name = prompt("Category name (e.g. Health, School, Gifts)");
    if (!name) return;

    const next = structuredClone(state);
    next.categories.push({
      id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      name: name.trim(),
      limit: 0,
    });

    grantXP(next, 20, "Added a category");
    saveState(next);
    setState(next);
  }

  return (
    <div className="grid" style={{ gap: 12 }}>
      <div className="card">
        <div className="row">
          <div>
            <div className="h1">Budgets</div>
            <div className="small">Coach tip: budgets are guardrails — not punishments.</div>
          </div>
          <button className="btn" onClick={addCategory}>
            + Category
          </button>
        </div>
      </div>

      <div className="grid" style={{ gap: 10 }}>
        {state.categories.map((c) => (
          <div key={c.id} className="card">
            <div className="row">
              <div>
                <div className="h1" style={{ fontSize: 16 }}>{c.name}</div>
                <div className="small">Monthly limit</div>
              </div>
              <div style={{ width: 160 }}>
                <input
                  className="input"
                  inputMode="decimal"
                  value={c.limit}
                  onChange={(e) => updateLimit(c.id, e.target.value)}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="h1">Game boost</div>
        <div className="small">Setting budgets is a “good move” — it earns XP when you add categories.</div>
        <hr className="sep" />
        <div className="row">
          <span className="badge">XP: {state.game?.xp ?? 0}</span>
          <span className="badge">Badges: {(state.game?.badges ?? []).length}</span>
        </div>
      </div>
    </div>
  );
}