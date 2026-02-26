import React, { useMemo, useState } from "react";
import { loadState, saveState, monthNow } from "../lib/store.js";
import { coachInsights, computeMonthSummary, progressForCategory } from "../lib/coach.js";

const money = (n) =>
  Number(n || 0).toLocaleString(undefined, { style: "currency", currency: "CAD" });

function Pill({ type }) {
  const map = {
    tip: "✅ Tip",
    warning: "⚠️ Warning",
    alert: "🚨 Alert",
    win: "🏆 Win",
  };
  return <span className="badge">{map[type] || "ℹ️"}</span>;
}

export default function Dashboard() {
  const [state, setState] = useState(() => loadState());
  const ym = monthNow();

  const summary = useMemo(() => computeMonthSummary(state, ym), [state, ym]);
  const insights = useMemo(() => coachInsights(state, ym), [state, ym]);

  function quickAddSavings10() {
    const next = structuredClone(state);
    next.transactions.unshift({
      id: crypto.randomUUID(),
      type: "income",
      categoryId: "savings",
      amount: 10,
      date: new Date().toISOString().slice(0, 10),
      note: "Quick save",
    });
    saveState(next);
    setState(next);
  }

  return (
    <div className="grid grid-2">
      <div className="grid" style={{ gap: 12 }}>
        <div className="card">
          <div className="row">
            <div>
              <div className="h1">This Month</div>
              <div className="small">{ym}</div>
            </div>
            <button className="btn primary" onClick={quickAddSavings10}>
              + Save $10
            </button>
          </div>

          <hr className="sep" />

          <div className="grid grid-3">
            <div className="card">
              <div className="h2">Income</div>
              <div className="h1">{money(summary.income)}</div>
            </div>
            <div className="card">
              <div className="h2">Spent</div>
              <div className="h1">{money(summary.expenses)}</div>
            </div>
            <div className="card">
              <div className="h2">Net</div>
              <div className="h1">{money(summary.net)}</div>
              <div className="small">Income − Expenses</div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="h1">Budgets (progress)</div>
          <div className="small">Coach tip: keep categories under 80% mid-month.</div>
          <hr className="sep" />

          <div className="grid" style={{ gap: 10 }}>
            {state.categories.map((c) => {
              const p = progressForCategory(state, c.id, ym);
              const pct = Math.round(p.ratio * 100);
              const color =
                pct >= 100 ? "rgba(239,68,68,0.85)" : pct >= 80 ? "rgba(245,158,11,0.85)" : "rgba(34,197,94,0.85)";
              return (
                <div key={c.id} className="card">
                  <div className="row">
                    <div>
                      <div className="h1" style={{ fontSize: 16 }}>{c.name}</div>
                      <div className="small">
                        {money(p.spent)} / {money(p.limit)}
                      </div>
                    </div>
                    <div className="badge">{pct}%</div>
                  </div>
                  <div className="progress" style={{ marginTop: 10 }}>
                    <div style={{ width: `${pct}%`, background: color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card">
          <div className="h1">Recent transactions</div>
          <div className="small">Newest first</div>
          <hr className="sep" />
          <div className="grid" style={{ gap: 10 }}>
            {summary.tx.slice(0, 8).map((t) => (
              <div key={t.id} className="row card">
                <div>
                  <div className="h1" style={{ fontSize: 16 }}>
                    {t.type === "expense" ? "−" : "+"}
                    {money(t.amount)}{" "}
                    <span className="small">({t.categoryId})</span>
                  </div>
                  <div className="small">{t.date} • {t.note || "—"}</div>
                </div>
                <span className="badge">{t.type}</span>
              </div>
            ))}
            {summary.tx.length === 0 && <div className="small">No transactions yet. Add one.</div>}
          </div>
        </div>
      </div>

      <div className="grid" style={{ gap: 12 }}>
        <div className="card">
          <div className="row">
            <div className="h1">Coach</div>
            <span className="badge">Money Moves</span>
          </div>
          <div className="small">Short, actionable next steps based on your data.</div>
          <hr className="sep" />
          <div className="grid" style={{ gap: 10 }}>
            {insights.map((i, idx) => (
              <div key={idx} className="card">
                <div className="row">
                  <div className="h1" style={{ fontSize: 16 }}>{i.title}</div>
                  <Pill type={i.type} />
                </div>
                <div className="small" style={{ marginTop: 6, lineHeight: 1.4 }}>{i.message}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="h1">Goals</div>
          <div className="small">Your targets and progress.</div>
          <hr className="sep" />
          <div className="grid" style={{ gap: 10 }}>
            {state.goals.map((g) => {
              const ratio = g.target > 0 ? Math.min(1, g.saved / g.target) : 0;
              return (
                <div key={g.id} className="card">
                  <div className="row">
                    <div>
                      <div className="h1" style={{ fontSize: 16 }}>{g.name}</div>
                      <div className="small">{money(g.saved)} / {money(g.target)} • by {g.targetDate}</div>
                    </div>
                    <div className="badge">{Math.round(ratio * 100)}%</div>
                  </div>
                  <div className="progress" style={{ marginTop: 10 }}>
                    <div style={{ width: `${Math.round(ratio * 100)}%` }} />
                  </div>
                </div>
              );
            })}
            {state.goals.length === 0 && <div className="small">No goals yet. Add one in Goals.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}