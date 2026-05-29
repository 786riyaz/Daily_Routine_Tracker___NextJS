// src/MonthView.jsx
import React, { useState, useMemo } from "react";
import { getDailyMeta, getWeeklyMeta } from "./activityConfig";
import CategoryPill from "./CategoryPill";

export default function MonthView({ activities, history, customMeta }) {
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });

  // DAYS GRID
  const daysInMonth = useMemo(() => {
    if (!month) return [];
    const [year, monthNum] = month.split("-").map(Number);
    const totalDays = new Date(year, monthNum, 0).getDate();

    return Array.from({ length: totalDays }, (_, i) => {
      const day = i + 1;
      return {
        key: `${year}-${String(monthNum).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
        label: String(day).padStart(2, "0"),
      };
    });
  }, [month]);

  // CELL VALUE
  const getValue = (date, activity) => {
    const entry = history[date];
    if (!entry) return null;

    if (activity.type === "daily")
      return entry.daily?.[activity.name] ? 1 : 0;

    if (activity.type === "weekly")
      return entry.weekly?.[activity.name] ? 1 : 0;

    return null;
  };

  // SEPARATE DAILY + WEEKLY
  const dailyActivities = activities.daily.map((name) => ({
    type: "daily",
    name,
  }));

  const weeklyActivities = activities.weekly.map((w) => ({
    type: "weekly",
    name: w.name,
  }));

  // Table renderer (reusable for both sections)
  const renderTable = (items, type) => (
    <div className="month-grid-wrapper">
      <table className="month-grid">
        <thead>
          <tr>
            <th className="sticky-col">Activity</th>
            {daysInMonth.map((d) => (
              <th key={d.key}>{d.label}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {items.map((act) => {
            const meta =
              type === "daily"
                ? getDailyMeta(act.name, customMeta)
                : getWeeklyMeta(act.name);

            return (
              <tr key={act.name}>
                <td className="sticky-col">
                  <div className="activity-row">
                    <div className="activity-left">{act.name}</div>

                    <div className="activity-center">
                      <CategoryPill category={meta.category} />
                    </div>

                    <div className="activity-right">
                      {meta.timeLabel && (
                        <span className="time-pill tiny">{meta.timeLabel}</span>
                      )}
                    </div>
                  </div>
                </td>

                {daysInMonth.map((d) => {
                  const v = getValue(d.key, act);

                  return (
                    <td key={d.key}>
                      <div
                        className={
                          v === 1
                            ? "cell-box cell-done"
                            : v === 0
                            ? "cell-box cell-miss"
                            : "cell-box cell-empty"
                        }
                      ></div>
                    </td>
                  );
                })}
              </tr>
            );
          })}

          {items.length === 0 && (
            <tr>
              <td colSpan={daysInMonth.length + 1} className="muted">
                No {type} activities configured.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="card">
      <h2>Month View</h2>

      {/* Month Picker */}
      <div className="month-picker">
        <label>Select Month:</label>
        <input
          type="month"
          className="input"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
        />
      </div>

      {/* DAILY SECTION */}
      <div className="detail-block">
        <h4 className="detail-block-title">Daily Activities</h4>
        {renderTable(dailyActivities, "daily")}
      </div>

      {/* WEEKLY SECTION */}
      <div className="detail-block">
        <h4 className="detail-block-title">Weekly Activities</h4>
        {renderTable(weeklyActivities, "weekly")}
      </div>
    </div>
  );
}
