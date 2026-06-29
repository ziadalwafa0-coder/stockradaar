import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./shared/AppLayout.jsx";
import Alerts from "./pages/Alerts.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Platforms from "./pages/Platforms.jsx";
import Products from "./pages/Products.jsx";
import Settings from "./pages/Settings.jsx";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/platforms" element={<Platforms />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
