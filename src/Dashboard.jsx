// src/Dashboard.jsx
import React, { useState, useMemo } from "react";
import { getDailyMeta, getWeeklyMeta } from "./activityConfig";
import CategoryPill from "./CategoryPill";

export default function Dashboard({ activities, history, customMeta }) {
  const [selected, setSelected] = useState(null);

  const dates = Object.keys(history).sort((a, b) => b.localeCompare(a));

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    if (Number.isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString("en-GB", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatsForDate = (date) => {
    const entry = history[date] || { daily: {}, weekly: {} };

    const dailyDone = activities.daily.filter((n) => entry.daily?.[n]).length;
    const weeklyDone = activities.weekly.filter(
      (w) => entry.weekly?.[w.name]
    ).length;

    return { dailyDone, weeklyDone };
  };

  const progressPercent = useMemo(() => {
    if (!selected) return 0;

    const { dailyDone, weeklyDone } = getStatsForDate(selected);
    const total = activities.daily.length + activities.weekly.length;
    const completed = dailyDone + weeklyDone;

    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  }, [selected, activities, history]);

  const selectedEntry = selected ? history[selected] || {} : {};
  const selectedDaily = selectedEntry.daily || {};
  const selectedWeekly = selectedEntry.weekly || {};

  return (
    <div className="card">
      {/* HEADER WITH PROGRESS CIRCLE */}
      <div className="dashboard-header">
        <h2>Dashboard</h2>

        <div
          className="progress-circle"
          style={{ "--progress": progressPercent }}
        >
          <span>{progressPercent}%</span>
        </div>
      </div>

      {dates.length === 0 && (
        <p className="muted">No history yet. Start tracking activities.</p>
      )}

      {dates.length > 0 && (
        <div className="dashboard">
          {/* DATE LIST COLUMN */}
          <div className="date-list">
            {dates.map((date) => {
              const { dailyDone, weeklyDone } = getStatsForDate(date);
              const active = selected === date;

              return (
                <button
                  key={date}
                  className={`date-list-btn ${active ? "selected" : ""}`}
                  onClick={() => setSelected(date)}
                >
                  <div className="date-main-line">{formatDate(date)}</div>
                  <div className="date-sub-line">
                    <span className="pill tiny">
                      D: {dailyDone}/{activities.daily.length}
                    </span>
                    <span className="pill tiny">
                      W: {weeklyDone}/{activities.weekly.length}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* DETAILS COLUMN */}
          <div className="details">
            {!selected && (
              <p className="muted">Select any date to see activity details.</p>
            )}

            {selected && (
              <>
                <h3 className="detail-date">{formatDate(selected)}</h3>

                {/* DAILY DETAILS */}
                <div className="detail-block">
                  <h4 className="detail-block-title">Daily Tasks</h4>

                  <ul className="detail-block-list">
                    {activities.daily.map((name) => {
                      const done = !!selectedDaily[name];
                      const meta = getDailyMeta(name, customMeta);

                      return (
                        <li key={name} className="detail-row">
                          <div className="activity-row">
                            <div className="activity-left">
                              <span
                                className={done ? "done-text" : "miss-text"}
                              >
                                {name}
                              </span>
                            </div>

                            <div className="activity-center">
                              <CategoryPill category={meta.category} />
                            </div>

                            <div className="activity-right">
                              {meta.timeLabel && (
                                <span className="time-pill">
                                  {meta.timeLabel}
                                </span>
                              )}
                            </div>
                          </div>

                          <span
                            className={`status-pill ${done ? "ok" : "miss"}`}
                          >
                            {done ? "Done" : "Missed"}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                {/* WEEKLY DETAILS */}
                <div className="detail-block">
                  <h4 className="detail-block-title">Weekly Tasks</h4>

                  <ul className="detail-block-list">
                    {activities.weekly.map((w) => {
                      const done = !!selectedWeekly[w.name];
                      const meta = getWeeklyMeta(w.name);

                      return (
                        <li key={w.name} className="detail-row">
                          <div className="activity-row">
                            <div className="activity-left">
                              <span
                                className={done ? "done-text" : "miss-text"}
                              >
                                {w.name}
                              </span>
                            </div>

                            <div className="activity-center">
                              <CategoryPill category={meta.category} />
                            </div>

                            <div className="activity-right">
                              {meta.timeLabel && (
                                <span className="time-pill">
                                  {meta.timeLabel}
                                </span>
                              )}
                            </div>
                          </div>

                          <span
                            className={`status-pill ${done ? "ok" : "miss"}`}
                          >
                            {done ? "Done" : "Missed"}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
