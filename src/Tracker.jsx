// src/Tracker.jsx
import React from "react";
import { getDailyMeta, getWeeklyMeta } from "./activityConfig";
import CategoryPill from "./CategoryPill";

export default function Tracker({
  activities,
  history,
  currentDate,
  setCurrentDate,
  updateDayStatus,
  customMeta,
}) {
  const dayName = new Date(currentDate).toLocaleDateString("en-US", {
    weekday: "short",
  });

  const daily = history[currentDate]?.daily || {};
  const weekly = history[currentDate]?.weekly || {};

  const goToday = () => {
    // setCurrentDate(new Date().toISOString().split("T")[0]);
    setCurrentDate(new Date().toLocaleDateString("en-CA"));
    console.log("goToday clicked", currentDate);
  };

  const goPrev = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 1);
    setCurrentDate(d.toISOString().split("T")[0]);
  };

  const goNext = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 1);
    setCurrentDate(d.toISOString().split("T")[0]);
  };

  const todaysWeekly = activities.weekly.filter((w) =>
    w.days.includes(dayName)
  );

  const dailyTotal = activities.daily.length;
  const weeklyTotal = todaysWeekly.length;
  const dailyDoneCount = activities.daily.filter((n) => daily[n]).length;
  const weeklyDoneCount = todaysWeekly.filter((w) => weekly[w.name]).length;

  return (
    <div className="card">
      <h2>Tracker</h2>

      {/* DATE CONTROLS */}
      <div className="date-controls">
        <button className="icon-btn" onClick={goPrev}>
          ◀
        </button>

        <div className="date-center">
          <div className="date-input-row">
            <input
              type="date"
              value={currentDate}
              onChange={(e) => setCurrentDate(e.target.value)}
            />
            <button className="today-btn" onClick={goToday}>
              Today
            </button>
          </div>

          <div className="tracker-stats">
            <span className="pill tiny">
              D: {dailyDoneCount}/{dailyTotal}
            </span>
            <span className="pill tiny">
              W: {weeklyDoneCount}/{weeklyTotal}
            </span>
          </div>
        </div>

        <button className="icon-btn" onClick={goNext}>
          ▶
        </button>
      </div>

      {/* DAILY ACTIVITIES */}
      <h3>Daily Activities</h3>

      {activities.daily.map((name) => {
        const done = !!daily[name];
        const meta = getDailyMeta(name, customMeta);

        return (
          <label
            key={name}
            className={`check-row ${done ? "checked" : ""}`}
          >
            <div className="activity-row">
              {/* LEFT: checkbox + name */}
              <div className="activity-left">
                <input
                  type="checkbox"
                  className="check-hidden"
                  checked={done}
                  onChange={(e) =>
                    updateDayStatus("daily", name, e.target.checked)
                  }
                />
                <span className={done ? "done-text" : "miss-text"}>
                  {name}
                </span>
              </div>

              {/* CENTER: category pill */}
              <div className="activity-center">
                <CategoryPill category={meta.category} />
              </div>

              {/* RIGHT: time */}
              <div className="activity-right">
                {meta.timeLabel && (
                  <span className="time-pill">{meta.timeLabel}</span>
                )}
              </div>
            </div>
          </label>
        );
      })}

      {/* WEEKLY ACTIVITIES */}
      <h3>Weekly ({dayName})</h3>

      {todaysWeekly.length === 0 && (
        <p className="muted">No weekly activities scheduled for {dayName}.</p>
      )}

      {todaysWeekly.map((w) => {
        const done = !!weekly[w.name];
        const meta = getWeeklyMeta(w.name);

        return (
          <label
            key={w.name}
            className={`check-row ${done ? "checked" : ""}`}
          >
            <div className="activity-row">
              {/* LEFT: checkbox + name */}
              <div className="activity-left">
                <input
                  type="checkbox"
                  className="check-hidden"
                  checked={done}
                  onChange={(e) =>
                    updateDayStatus("weekly", w.name, e.target.checked)
                  }
                />
                <span className={done ? "done-text" : "miss-text"}>
                  {w.name}
                </span>
              </div>

              {/* CENTER: category pill */}
              <div className="activity-center">
                <CategoryPill category={meta.category} />
              </div>

              {/* RIGHT: (weekly usually has no time, but kept for consistency) */}
              <div className="activity-right">
                {meta.timeLabel && (
                  <span className="time-pill">{meta.timeLabel}</span>
                )}
              </div>
            </div>
          </label>
        );
      })}
    </div>
  );
}
