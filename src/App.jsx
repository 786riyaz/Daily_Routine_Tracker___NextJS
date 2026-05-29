// src/App.jsx
import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./Navbar.jsx";
import Tracker from "./Tracker.jsx";
import Dashboard from "./Dashboard.jsx";
import Setup from "./Setup.jsx";
import MonthView from "./MonthView.jsx";
import Todo from "./ToDo.jsx";

import {
  DEFAULT_DAILY_NAMES,
  DEFAULT_WEEKLY_ITEMS,
} from "./activityConfig";

const THEME_CLASSES = ["theme-light", "theme-dark", "theme-purple"];

function applyThemeClass(theme) {
  THEME_CLASSES.forEach((cls) => document.body.classList.remove(cls));
  document.body.classList.add(`theme-${theme}`);
}

export default function App() {
  const [activities, setActivities] = useState({ daily: [], weekly: [] });
  const [history, setHistory] = useState({});
  const [currentDate, setCurrentDate] = useState(
  new Date().toLocaleDateString("en-CA")
);
  const [theme, setTheme] = useState("purple");
  const [initialized, setInitialized] = useState(false);

  // per-activity overrides: { name: { time, category } }
  const [customMeta, setCustomMeta] = useState({});

  // -----------------------------
  // INITIAL LOAD
  // -----------------------------
  useEffect(() => {
    // Theme
    let savedTheme = localStorage.getItem("theme");
    if (!["light", "dark", "purple"].includes(savedTheme)) {
      savedTheme = "purple"; // default = purple
    }
    setTheme(savedTheme);
    applyThemeClass(savedTheme);

    const normalizeDaily = (arr) =>
      (arr || [])
        .map((x) => (typeof x === "string" ? x : x?.name))
        .filter(Boolean);

    const normalizeWeekly = (arr) =>
      (arr || [])
        .map((w) => (w?.name ? { name: w.name, days: w.days || [] } : null))
        .filter(Boolean);

    const saved = localStorage.getItem("activities");
    let loaded;

    if (!saved) {
      loaded = {
        daily: [...DEFAULT_DAILY_NAMES],
        weekly: [...DEFAULT_WEEKLY_ITEMS],
      };
    } else {
      loaded = JSON.parse(saved);
      // Ensure structure integrity if needed, but trust the persistence for content
      if (!loaded.daily) loaded.daily = [];
      if (!loaded.weekly) loaded.weekly = [];
    }

    setActivities(loaded);

    const savedHistory = localStorage.getItem("activity_history");
    setHistory(savedHistory ? JSON.parse(savedHistory) : {});

    const savedMeta = localStorage.getItem("activity_meta");
    setCustomMeta(savedMeta ? JSON.parse(savedMeta) : {});

    setInitialized(true);
  }, []);

  // -----------------------------
  // SAVE ACTIVITIES
  // -----------------------------
  useEffect(() => {
    if (!initialized) return;
    localStorage.setItem("activities", JSON.stringify(activities));
  }, [activities, initialized]);

  // -----------------------------
  // SAVE HISTORY
  // -----------------------------
  useEffect(() => {
    if (!initialized) return;
    localStorage.setItem("activity_history", JSON.stringify(history));
  }, [history, initialized]);

  // -----------------------------
  // SAVE CUSTOM META
  // -----------------------------
  useEffect(() => {
    if (!initialized) return;
    localStorage.setItem("activity_meta", JSON.stringify(customMeta));
  }, [customMeta, initialized]);

  // -----------------------------
  // TOGGLE CHECKBOX
  // -----------------------------
  const updateDayStatus = (type, name, value) => {
    setHistory((prev) => {
      const old = prev[currentDate] || { daily: {}, weekly: {} };
      const updated = {
        daily: { ...old.daily },
        weekly: { ...old.weekly },
      };
      if (type === "daily") updated.daily[name] = value;
      if (type === "weekly") updated.weekly[name] = value;

      return { ...prev, [currentDate]: updated };
    });
  };

  // -----------------------------
  // SWITCH THEME
  // -----------------------------
  const toggleTheme = () => {
    const order = ["light", "dark", "purple"];
    const next = order[(order.indexOf(theme) + 1) % order.length];
    setTheme(next);
    applyThemeClass(next);
    localStorage.setItem("theme", next);
  };

  const themeLabel =
    theme === "light" ? "☀ Light" : theme === "dark" ? "🌙 Dark" : "💜 Purple";

  // -----------------------------
  // EXPORT / IMPORT
  // -----------------------------
  const exportBackup = () => {
    const data = {
      activities,
      history,
      customMeta,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "activity_backup.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const importBackup = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (x) => {
      try {
        const json = JSON.parse(x.target.result);
        setActivities(json.activities || {});
        setHistory(json.history || {});
        setCustomMeta(json.customMeta || {});
        alert("Backup restored!");
      } catch {
        alert("Invalid backup file.");
      }
    };
    reader.readAsText(file);
  };

  // -----------------------------
  // RENDER
  // -----------------------------
  return (
    <div className="app-shell">
      {/* HEADER */}
      <header className="app-header">
        <div className="header-top">
          <div>
            <h1>Activity Tracker</h1>
            <p className="muted">
              Track your daily & weekly activities with a clean minimal UI.
            </p>
          </div>

          <div className="header-right">
            <button className="btn-small ghost" onClick={toggleTheme}>
              {themeLabel}
            </button>
            <button className="btn-small" onClick={exportBackup}>
              ⬇ Export
            </button>
            <label className="btn-small import-btn">
              ⬆ Import
              <input
                hidden
                type="file"
                accept="application/json"
                onChange={importBackup}
              />
            </label>
          </div>
        </div>

        {/* TOP NAV */}
        <Navbar />
      </header>

      {/* PAGES */}
      <main className="layout">
        <Routes>
          <Route
            path="/tracker"
            element={
              <Tracker
                activities={activities}
                history={history}
                currentDate={currentDate}
                setCurrentDate={setCurrentDate}
                updateDayStatus={updateDayStatus}
                customMeta={customMeta}
              />
            }
          />
          <Route path="/todo" element={<Todo />} />
          <Route
            path="/dashboard"
            element={
              <Dashboard
                activities={activities}
                history={history}
                customMeta={customMeta}
              />
            }
          />
          <Route
            path="/setup"
            element={
              <Setup
                activities={activities}
                setActivities={setActivities}
                customMeta={customMeta}
                setCustomMeta={setCustomMeta}
              />
            }
          />
          <Route
            path="/month-view"
            element={
              <MonthView
                activities={activities}
                history={history}
                customMeta={customMeta}
              />
            }
          />
          <Route path="*" element={<Navigate to="/tracker" replace />} />
        </Routes>
      </main>
    </div>
  );
}
