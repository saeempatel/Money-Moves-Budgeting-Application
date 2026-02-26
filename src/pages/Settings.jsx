import React, { useState } from "react";
import { loadState, resetState, saveState } from "../lib/store.js";

export default function Settings() {
  const [state, setState] = useState(() => loadState());

  function resetAll() {
    const ok = confirm("Reset ALL Money Moves data? This cannot be undone.");
    if (!ok) return;
    const next = resetState();
    setState(next);
  }

  function exportData() {
    const dataStr = JSON.stringify(state, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "money-moves-export.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function importData(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        // Minimal sanity check
        if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.categories)) {
          alert("Invalid file.");
          return;
        }
        saveState(parsed);
        setState(parsed);
        alert("Import successful.");
      } catch {
        alert("Invalid JSON.");
      }
    };
    reader.readAsText(file);
  }

  return (
    <div className="grid" style={{ gap: 12 }}>
      <div className="card">
        <div className="h1">Settings</div>
        <div className="small">
          Money Moves stores your data on this device (localStorage). No deployment needed.
        </div>
      </div>

      <div className="card">
        <div className="h1">Install as an “app” (iPhone)</div>
        <div className="small" style={{ lineHeight: 1.5 }}>
          1) Open the app in <b>Safari</b><br />
          2) Tap <b>Share</b><br />
          3) Tap <b>Add to Home Screen</b><br />
          4) Launch from the icon — it opens full screen like an app
        </div>
      </div>

      <div className="card">
        <div className="h1">Backup</div>
        <div className="small">Export your data or import it on another computer.</div>
        <hr className="sep" />
        <div className="row" style={{ flexWrap: "wrap" }}>
          <button className="btn" onClick={exportData}>
            Export JSON
          </button>

          <label className="btn" style={{ cursor: "pointer" }}>
            Import JSON
            <input
              type="file"
              accept="application/json"
              onChange={importData}
              style={{ display: "none" }}
            />
          </label>
        </div>
      </div>

      <div className="card">
        <div className="h1">Danger zone</div>
        <div className="small">Reset wipes categories, transactions, goals, XP, streaks, everything.</div>
        <hr className="sep" />
        <button className="btn danger" onClick={resetAll}>
          Reset all data
        </button>
      </div>

      <div className="card">
        <div className="h1">Debug</div>
        <div className="small">Quick view of game stats.</div>
        <hr className="sep" />
        <div className="row" style={{ flexWrap: "wrap" }}>
          <span className="badge">XP: {state.game?.xp ?? 0}</span>
          <span className="badge">Streak: {state.game?.streak ?? 0} days</span>
          <span className="badge">Badges: {(state.game?.badges ?? []).length}</span>
          <span className="badge">Challenges: {(state.game?.completedChallengeIds ?? []).length}</span>
        </div>
      </div>
    </div>
  );
}