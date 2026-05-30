'use client';
import { useState, useEffect } from 'react';
import CategoryPill from '@/components/CategoryPill';
import { getDailyMeta, getWeeklyMeta } from '@/lib/activityConfig';

function toLocalDateKey(d) { return d.toLocaleDateString('en-CA'); }

export default function DashboardPage() {
  const [history, setHistory] = useState({});
  const [activities, setActivities] = useState({ daily: [], weekly: [] });
  const [customMeta, setCustomMeta] = useState({});
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/history').then(r => r.json()),
      fetch('/api/activities').then(r => r.json()),
      fetch('/api/activities/meta').then(r => r.json()),
    ]).then(([hist, acts, meta]) => {
      setHistory(hist); setActivities(acts); setCustomMeta(meta); setLoading(false);
      const today = toLocalDateKey(new Date());
      if (hist[today]) setSelected(today);
      else {
        const keys = Object.keys(hist).sort((a,b) => b.localeCompare(a));
        if (keys.length) setSelected(keys[0]);
      }
    });
  }, []);

  const sortedDates = Object.keys(history).sort((a, b) => b.localeCompare(a));

  function getStats(dk) {
    const entry = history[dk] || { daily: {}, weekly: {} };
    const dayName = new Date(dk).toLocaleDateString('en-US', { weekday: 'short' });
    const todayWeekly = activities.weekly.filter(w => w.days && w.days.includes(dayName));
    const doneD = activities.daily.filter(n => entry.daily?.[n]).length;
    const doneW = todayWeekly.filter(w => entry.weekly?.[w.name]).length;
    const total = activities.daily.length + todayWeekly.length;
    const done = doneD + doneW;
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    return { total, done, doneD, doneW, totalD: activities.daily.length, totalW: todayWeekly.length, pct };
  }

  function renderDetail() {
    if (!selected) return <p className="muted">Select a date to view details.</p>;
    const entry = history[selected] || { daily: {}, weekly: {} };
    const { pct, done, total, doneD, totalD, doneW, totalW } = getStats(selected);
    const dayName = new Date(selected).toLocaleDateString('en-US', { weekday: 'short' });
    const todayWeekly = activities.weekly.filter(w => w.days && w.days.includes(dayName));
    const dateLabel = new Date(selected + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' });

    const sortedDaily = [...activities.daily].sort((a, b) => {
      const ma = getDailyMeta(a, customMeta);
      const mb = getDailyMeta(b, customMeta);
      return (ma.sortKey || '99:99').localeCompare(mb.sortKey || '99:99');
    });

    return (
      <>
        <div className="dashboard-header">
          <div>
            <h3 style={{ margin: 0 }}>{dateLabel}</h3>
            <p className="muted" style={{ margin: '4px 0 0' }}>Daily Tasks</p>
          </div>
          <div className="progress-circle" style={{ '--progress': pct }}>
            <span>{pct}%</span>
          </div>
        </div>

        {/* Daily block */}
        {sortedDaily.length > 0 && (
          <div className="detail-block">
            <p className="detail-block-title">Daily Tasks</p>
            <ul className="detail-block-list">
              {sortedDaily.map(name => {
                const done = !!entry.daily?.[name];
                const meta = getDailyMeta(name, customMeta);
                return (
                  <li key={name}>
                    <div className="detail-row">
                      <div className="detail-title-row">
                        <span className={done ? 'done-text' : 'miss-text'}>{name}</span>
                      </div>
                      <div className="detail-right">
                        <CategoryPill category={meta.category} />
                        {meta.timeLabel && <span className="time-pill tiny">{meta.timeLabel}</span>}
                        <span className={`status-pill ${done ? 'ok' : 'miss'}`}>{done ? 'Done' : 'Missed'}</span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* Weekly block */}
        {todayWeekly.length > 0 && (
          <div className="detail-block">
            <p className="detail-block-title">Weekly Tasks ({dayName})</p>
            <ul className="detail-block-list">
              {todayWeekly.map(w => {
                const done = !!entry.weekly?.[w.name];
                const meta = getWeeklyMeta(w.name);
                return (
                  <li key={w.name}>
                    <div className="detail-row">
                      <div className="detail-title-row">
                        <span className={done ? 'done-text' : 'miss-text'}>{w.name}</span>
                      </div>
                      <div className="detail-right">
                        <CategoryPill category={meta.category} />
                        <span className={`status-pill ${done ? 'ok' : 'miss'}`}>{done ? 'Done' : 'Missed'}</span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </>
    );
  }

  if (loading) return <div className="loading-state">Loading...</div>;

  return (
    <div className="layout">
      <div className="card">
        <h2>Dashboard</h2>
        <div className="dashboard">
          {/* LEFT: date list */}
          <div className="date-list">
            {sortedDates.length === 0 && <p className="muted">No history yet.</p>}
            {sortedDates.map(dk => {
              const { pct, doneD, totalD, doneW, totalW } = getStats(dk);
              const label = new Date(dk + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
              return (
                <button key={dk} className={`date-list-btn ${selected === dk ? 'selected' : ''}`} onClick={() => setSelected(dk)}>
                  <span className="date-main-line">{label}</span>
                  <div className="date-sub-line">
                    <span className="pill tiny">D: {doneD}/{totalD}</span>
                    <span className="pill tiny">W: {doneW}/{totalW}</span>
                  </div>
                </button>
              );
            })}
          </div>
          {/* RIGHT: detail */}
          <div className="details">{renderDetail()}</div>
        </div>
      </div>
    </div>
  );
}
