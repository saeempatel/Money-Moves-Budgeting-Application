import React, { useMemo, useState } from "react";
import { loadState, saveState, monthNow } from "../lib/store.js";
import { CHALLENGES, completeChallenge, grantXP } from "../lib/game.js";
import { computeMonthSummary } from "../lib/coach.js";

function badgeLabel(id) {
  const map = {
    starter: "Starter (50 XP)",
    consistent: "Consistent (150 XP)",
    grinder: "Grinder (300 XP)",
    "3day": "3-Day Streak",
    "7day": "7-Day Streak",
    challenge: "Challenge Completed",
  };
  return map[id] || id;
}

export default function Challenges() {
  const [state, setState] = useState(() => loadState());
  const ym = monthNow();

  const summary = useMemo(() => computeMonthSummary(state, ym), [state, ym]);

  const status = useMemo(() => {
    return CHALLENGES.map((c) => {
      const done = state.game.completedChallengeIds.includes(c.id);
      const passed = c.check(state, ym);
      return { ...c, done, passed };
    });
  }, [state, ym]);

  function claim(challengeId) {
    const next = structuredClone(state);
    const ch = CHALLENGES.find((c) => c.id === challengeId);
    if (!ch) return;

    // Only claim if passed and not already done
    const already = next.game.completedChallengeIds.includes(ch.id);
    const passed = ch.check(next, ym);
    if (already || !passed) return;

    completeChallenge(next, ch.id);
    grantXP(next, ch.xp, `Completed: ${ch.title}`);

    saveState(next);
    setState(next);
  }

  return (
    <div className="grid" style={{ gap: 12 }}>
      <div className="card">
        <div className="h1">Game Mode</div>
        <div className="small">
          Coach-style challenges: you learn budgeting by building habits.
        </div>
        <hr className="sep" />
        <div className="row" style={{ flexWrap: "wrap" }}>
          <span className="badge">XP: {state.game?.xp ?? 0}</span>
          <span className="badge">Streak: {state.game?.streak ?? 0} days</span>
          <span className="badge">Month: {ym}</span>
          <span className="badge">Tx logged: {summary.tx.length}</span>
        </div>
      </div>

      <div className="card">
        <div className="h1">Challenges</div>
        <div className="small">Complete, claim XP, collect badges.</div>
        <hr className="sep" />

        <div className="grid" style={{ gap: 10 }}>
          {status.map((c) => (
            <div key={c.id} className="card">
              <div className="row" style={{ flexWrap: "wrap" }}>
                <div>
                  <div className="h1" style={{ fontSize: 16 }}>{c.title}</div>
                  <div className="small">{c.desc}</div>
                </div>

                <div className="row" style={{ justifyContent: "flex-end" }}>
                  <span className="badge">+{c.xp} XP</span>
                  {c.done ? (
                    <span className="badge">✅ Claimed</span>
                  ) : c.passed ? (
                    <button className="btn primary" onClick={() => claim(c.id)}>
                      Claim
                    </button>
                  ) : (
                    <span className="badge">⏳ In progress</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="h1">Badges</div>
        <div className="small">Earned by XP milestones, streaks, and challenges.</div>
        <hr className="sep" />
        <div className="row" style={{ flexWrap: "wrap" }}>
          {(state.game?.badges ?? []).length ? (
            state.game.badges.map((b) => <span key={b} className="badge">🏅 {badgeLabel(b)}</span>)
          ) : (
            <span className="small">No badges yet. Log transactions and claim challenges.</span>
          )}
        </div>
      </div>
    </div>
  );
}