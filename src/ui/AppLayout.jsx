import React from "react";
import { NavLink, Outlet } from "react-router-dom";

const items = [
  { to: "/", label: "Home" },
  { to: "/add", label: "Add" },
  { to: "/budgets", label: "Budgets" },
  { to: "/goals", label: "Goals" },
  { to: "/challenges", label: "Game" },
  { to: "/settings", label: "Settings" },
];

export default function AppLayout() {
  return (
    <>
      <div className="nav">
        <div className="navbar">
          <div className="brand">💸 Money Moves</div>
          <div className="tabs">
            {items.map((it) => (
              <NavLink
                key={it.to}
                to={it.to}
                end={it.to === "/"}
                className={({ isActive }) => `tab ${isActive ? "active" : ""}`}
              >
                {it.label}
              </NavLink>
            ))}
          </div>
        </div>
      </div>

      <div className="container">
        <Outlet />
      </div>
    </>
  );
}