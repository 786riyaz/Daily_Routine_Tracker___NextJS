// src/Setup.jsx
import React, { useState, useMemo } from "react";
import {
  CATEGORY_ORDER,
  getDailyMeta,
  DEFAULT_DAILY_SET,
  DEFAULT_WEEKLY_SET,
} from "./activityConfig";
import CategoryPill from "./CategoryPill";

export default function Setup({
  activities,
  setActivities,
  customMeta,
  setCustomMeta,
}) {
  const [dailyInput, setDailyInput] = useState("");
  const [weeklyInput, setWeeklyInput] = useState("");
  const [selectedDays, setSelectedDays] = useState([]);

  // Edit state
  const [editDaily, setEditDaily] = useState(null);
  const [editDailyName, setEditDailyName] = useState("");
  const [editDailyCategory, setEditDailyCategory] = useState(
    "Other / Custom"
  );
  const [editDailyTime, setEditDailyTime] = useState("");

  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // -----------------------------------------
  // DAILY: SORT BY TIME ONLY
  // -----------------------------------------
  const sortedDaily = useMemo(() => {
    return [...activities.daily]
      .map((name) => {
        const meta = getDailyMeta(name, customMeta);
        return { name, ...meta };
      })
      .sort((a, b) => a.sortKey.localeCompare(b.sortKey));
  }, [activities.daily, customMeta]);

  // -----------------------------------------
  // DAILY ADD
  // -----------------------------------------
  const addDaily = () => {
    const name = dailyInput.trim();
    if (!name) return;

    if (!activities.daily.includes(name)) {
      setActivities({
        ...activities,
        daily: [...activities.daily, name],
      });
    }
    setDailyInput("");
  };

  // -----------------------------------------
  // DAILY EDIT / DELETE
  // -----------------------------------------
  const startEditDaily = (name) => {
    const meta = getDailyMeta(name, customMeta);
    setEditDaily(name);
    setEditDailyName(name);
    setEditDailyCategory(meta.category || "Other / Custom");
    setEditDailyTime(meta.time || "");
  };

  const saveDailyEdit = () => {
    if (!editDaily) return;
    if (!editDailyName.trim()) return;

    const newName = editDailyName.trim();

    setActivities((prev) => ({
      ...prev,
      daily: prev.daily.map((d) => (d === editDaily ? newName : d)),
    }));

    setCustomMeta((prev) => {
      const next = { ...prev };
      if (editDaily !== newName) delete next[editDaily];
      next[newName] = {
        category: editDailyCategory,
        time: editDailyTime,
      };
      return next;
    });

    setEditDaily(null);
    setEditDailyName("");
    setEditDailyCategory("Other / Custom");
    setEditDailyTime("");
  };

  const cancelDailyEdit = () => {
    setEditDaily(null);
    setEditDailyName("");
    setEditDailyCategory("Other / Custom");
    setEditDailyTime("");
  };

  const deleteDaily = (name) => {

    setActivities((prev) => ({
      ...prev,
      daily: prev.daily.filter((d) => d !== name),
    }));

    setCustomMeta((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  // -----------------------------------------
  // WEEKLY ADD / DELETE
  // -----------------------------------------
  const toggleDay = (day) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const addWeekly = () => {
    const name = weeklyInput.trim();
    if (!name || selectedDays.length === 0) return;

    if (!activities.weekly.some((w) => w.name === name)) {
      setActivities({
        ...activities,
        weekly: [...activities.weekly, { name, days: selectedDays }],
      });
    }

    setWeeklyInput("");
    setSelectedDays([]);
  };

  const deleteWeekly = (name) => {

    setActivities((prev) => ({
      ...prev,
      weekly: prev.weekly.filter((w) => w.name !== name),
    }));
  };

  // -----------------------------------------
  // RENDER
  // -----------------------------------------
  return (
    <div className="card">
      <h2>Setup Activities</h2>

      {/* DAILY SETUP */}
      <h3>Daily Activities</h3>

      <div className="form-row">
        <input
          className="input"
          value={dailyInput}
          placeholder="Add new daily activity..."
          onChange={(e) => setDailyInput(e.target.value)}
        />
        <button className="btn" onClick={addDaily}>
          Add
        </button>
      </div>

      {/* SORTED DAILY LIST */}
      <ul className="list small-list" style={{ marginTop: 10 }}>
        {sortedDaily.map((item) => {
          const name = item.name;
          const isDefault = DEFAULT_DAILY_SET.has(name);
          const isEditing = editDaily === name;

          return (
            <li
              key={name}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "8px",
                padding: "4px 0",
              }}
            >
              {isEditing ? (
                <div
                  style={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                  }}
                >
                  <input
                    className="input"
                    value={editDailyName}
                    onChange={(e) => setEditDailyName(e.target.value)}
                  />

                  <div className="form-row">
                    <select
                      className="input"
                      value={editDailyCategory}
                      onChange={(e) => setEditDailyCategory(e.target.value)}
                    >
                      {CATEGORY_ORDER.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>

                    <input
                      className="input"
                      type="time"
                      value={editDailyTime}
                      onChange={(e) => setEditDailyTime(e.target.value)}
                    />
                  </div>

                  <div style={{ display: "flex", gap: 6 }}>
                    <button className="btn-small" onClick={saveDailyEdit}>
                      Save
                    </button>
                    <button
                      className="btn-small ghost"
                      onClick={cancelDailyEdit}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Unified layout: name (left), category (center), time (right) */}
                  <div className="activity-row">
                    <div className="activity-left">
                      <span>{name}</span>
                    </div>

                    <div className="activity-center">
                      <CategoryPill category={item.category} />
                    </div>

                    <div className="activity-right">
                      {item.timeLabel && (
                        <span className="time-pill tiny">
                          {item.timeLabel}
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      className="icon-btn"
                      onClick={() => startEditDaily(name)}
                    >
                      ✎
                    </button>
                    <button
                      className="icon-btn danger"
                      onClick={() => deleteDaily(name)}
                    >
                      ✖
                    </button>
                  </div>
                </>
              )}
            </li>
          );
        })}
      </ul>

      {/* WEEKLY SETUP */}
      <h3 style={{ marginTop: 16 }}>Weekly Activities</h3>

      <input
        className="input"
        value={weeklyInput}
        placeholder="Weekly activity..."
        onChange={(e) => setWeeklyInput(e.target.value)}
      />

      <div className="days-grid">
        {dayLabels.map((d) => (
          <button
            key={d}
            className={selectedDays.includes(d) ? "day-btn active" : "day-btn"}
            onClick={() => toggleDay(d)}
          >
            {d}
          </button>
        ))}
      </div>

      <button className="btn" onClick={addWeekly}>
        Add Weekly Activity
      </button>

      <ul className="list small-list">
        {activities.weekly.map((w) => {
          const isDefault = DEFAULT_WEEKLY_SET.has(w.name);

          return (
            <li
              key={w.name}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>
                {w.name}{" "}
                <span className="muted">({(w.days || []).join(", ")})</span>
              </span>

              <button
                className="icon-btn danger"
                onClick={() => deleteWeekly(w.name)}
              >
                ✖
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
