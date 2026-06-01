'use client';
import { useState, useEffect } from 'react';
import CategoryPill from '@/components/CategoryPill';
import { getDailyMeta, getWeeklyMeta } from '@/lib/activityConfig';
function toDateKey(y, m, d) {
  return `${y}-${String(m + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
}
export default function MonthViewPage() {
  const today = new Date();
  const [yearMonth, setYearMonth] = useState(() => `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2,'0')}`);
  const [history, setHistory] = useState({});
  const [activities, setActivities] = useState({ daily: [], weekly: [] });
  const [customMeta, setCustomMeta] = useState({});
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    Promise.all([
      fetch('/api/history').then(r => r.json()),
      fetch('/api/activities').then(r => r.json()),
      fetch('/api/activities/meta').then(r => r.json()),
    ]).then(([hist, acts, meta]) => {
      setHistory(hist); setActivities(acts); setCustomMeta(meta); setLoading(false);
    });
  }, []);
  const [year, month0] = yearMonth.split('-').map(Number);
  const month = month0 - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const dayNums = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const sortedDaily = [...activities.daily].sort((a, b) => {
    const ma = getDailyMeta(a, customMeta);
    const mb = getDailyMeta(b, customMeta);
    return (ma.sortKey || '99:99').localeCompare(mb.sortKey || '99:99');
  });
  function cellStatus(name, type, day) {
    const dk = toDateKey(year, month, day);
    const entry = history[dk];
    if (!entry) return 'empty';
    const done = type === 'daily' ? !!entry.daily?.[name] : !!entry.weekly?.[name];
    return done ? 'done' : 'miss';
  }
  function isScheduledWeekly(w, day) {
    const dk = toDateKey(year, month, day);
    const dayName = new Date(dk).toLocaleDateString('en-US', { weekday: 'short' });
    return w.days && w.days.includes(dayName);
  }
  if (loading) return <div className="loading-state">Loading...</div>;
  return (
    <div className="layout">
      <div className="card">
        <h2>Month View</h2>
        <div className="month-picker">
          <label>Select Month:</label>
          <input
            type="month" value={yearMonth}
            onChange={e => setYearMonth(e.target.value)}
            style={{ padding: '6px 10px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--card-bg)', color: 'var(--text)', fontSize: '0.9rem', outline: 'none' }}
          />
        </div>
        {sortedDaily.length > 0 && (
          <>
            <h3>Daily Activities</h3>
            <div className="month-grid-wrapper">
              <table className="month-grid">
                <thead>
                  <tr>
                    <th className="sticky-col mv-name-col">Activity</th>
                    {dayNums.map(d => <th key={d} className="mv-day-col"><span className="mv-day-header">{String(d).padStart(2,'0')}</span></th>)}
                  </tr>
                </thead>
                <tbody>
                  {sortedDaily.map(name => {
                    const meta = getDailyMeta(name, customMeta);
                    return (
                      <tr key={name}>
                        <td className="sticky-col mv-name-col">
                          <div className="mv-cell-name">{name}</div>
                          <div className="mv-cell-meta">
                            <CategoryPill category={meta.category} />
                            {meta.timeLabel && <span className="time-pill tiny">{meta.timeLabel}</span>}
                          </div>
                        </td>
                        {dayNums.map(d => {
                          const status = cellStatus(name, 'daily', d);
                          return <td key={d} className="mv-day-col"><div className={`cell-box cell-${status}`} /></td>;
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
        {activities.weekly.length > 0 && (
          <>
            <h3 style={{ marginTop: 20 }}>Weekly Activities</h3>
            <div className="month-grid-wrapper">
              <table className="month-grid">
                <thead>
                  <tr>
                    <th className="sticky-col mv-name-col">Activity</th>
                    {dayNums.map(d => <th key={d} className="mv-day-col"><span className="mv-day-header">{String(d).padStart(2,'0')}</span></th>)}
                  </tr>
                </thead>
                <tbody>
                  {activities.weekly.map(w => {
                    const meta = getWeeklyMeta(w.name);
                    return (
                      <tr key={w.name}>
                        <td className="sticky-col mv-name-col">
                          <div className="mv-cell-name">{w.name}</div>
                          <div className="mv-cell-meta"><CategoryPill category={meta.category} /></div>
                        </td>
                        {dayNums.map(d => {
                          const scheduled = isScheduledWeekly(w, d);
                          if (!scheduled) return <td key={d} className="mv-day-col"><div className="cell-box" style={{ background: 'transparent' }} /></td>;
                          const status = cellStatus(w.name, 'weekly', d);
                          return <td key={d} className="mv-day-col"><div className={`cell-box cell-${status}`} /></td>;
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}