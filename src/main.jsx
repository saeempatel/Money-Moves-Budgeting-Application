import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./styles.css";

import AppLayout from "./ui/AppLayout.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Add from "./pages/Add.jsx";
import Budgets from "./pages/Budgets.jsx";
import Goals from "./pages/Goals.jsx";
import Challenges from "./pages/Challenges.jsx";
import Settings from "./pages/Settings.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "add", element: <Add /> },
      { path: "budgets", element: <Budgets /> },
      { path: "goals", element: <Goals /> },
      { path: "challenges", element: <Challenges /> },
      { path: "settings", element: <Settings /> }
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);