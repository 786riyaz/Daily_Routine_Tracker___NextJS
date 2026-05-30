'use client';
import { useState, useEffect } from 'react';
import CategoryPill from '@/components/CategoryPill';
import { getDailyMeta, getWeeklyMeta } from '@/lib/activityConfig';

const DAY_NAMES = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

function toLocalDateKey(d) {
  return d.toLocaleDateString('en-CA'); // YYYY-MM-DD in local time
}

export default function TrackerPage() {
  const [currentDate, setCurrentDate] = useState(() => toLocalDateKey(new Date()));
  const [activities, setActivities] = useState({ daily: [], weekly: [] });
  const [history, setHistory] = useState({});
  const [customMeta, setCustomMeta] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/activities').then(r => r.json()),
      fetch('/api/history').then(r => r.json()),
      fetch('/api/activities/meta').then(r => r.json()),
    ]).then(([acts, hist, meta]) => {
      setActivities(acts); setHistory(hist); setCustomMeta(meta); setLoading(false);
    });
  }, []);

  const dayName = new Date(currentDate).toLocaleDateString('en-US', { weekday: 'short' });
  const daily = history[currentDate]?.daily || {};
  const weekly = history[currentDate]?.weekly || {};
  const todaysWeekly = activities.weekly.filter(w => w.days && w.days.includes(dayName));

  const dailyDoneCount = activities.daily.filter(n => daily[n]).length;
  const weeklyDoneCount = todaysWeekly.filter(w => weekly[w.name]).length;

  // Sort daily by time
  const sortedDaily = [...activities.daily].sort((a, b) => {
    const ma = getDailyMeta(a, customMeta);
    const mb = getDailyMeta(b, customMeta);
    return (ma.sortKey || '99:99').localeCompare(mb.sortKey || '99:99');
  });

  async function updateDayStatus(type, name, value) {
    setHistory(h => ({
      ...h,
      [currentDate]: {
        daily: { ...(h[currentDate]?.daily || {}) },
        weekly: { ...(h[currentDate]?.weekly || {}) },
        [type]: { ...(h[currentDate]?.[type] || {}), [name]: value },
      },
    }));
    await fetch('/api/history', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: currentDate, type, name, value }),
    });
  }

  function goPrev() {
    const d = new Date(currentDate); d.setDate(d.getDate() - 1);
    setCurrentDate(d.toISOString().split('T')[0]);
  }
  function goNext() {
    const d = new Date(currentDate); d.setDate(d.getDate() + 1);
    setCurrentDate(d.toISOString().split('T')[0]);
  }
  function goToday() { setCurrentDate(toLocalDateKey(new Date())); }

  if (loading) return <div className="loading-state">Loading...</div>;

  return (
    <div className="layout">
      <div className="card">
        <h2>Tracker</h2>
        {/* DATE CONTROLS */}
        <div className="date-controls">
          <button className="icon-btn" onClick={goPrev}>◀</button>
          <div className="date-center">
            <div className="date-input-row">
              <input type="date" value={currentDate} onChange={e => setCurrentDate(e.target.value)} />
              <button className="today-btn" onClick={goToday}>Today</button>
            </div>
            <div className="tracker-stats">
              <span className="pill tiny">D: {dailyDoneCount}/{activities.daily.length}</span>
              <span className="pill tiny">W: {weeklyDoneCount}/{todaysWeekly.length}</span>
            </div>
          </div>
          <button className="icon-btn" onClick={goNext}>▶</button>
        </div>

        {/* DAILY */}
        <h3>Daily Activities</h3>
        {sortedDaily.map(name => {
          const done = !!daily[name];
          const meta = getDailyMeta(name, customMeta);
          return (
            <label key={name} className={`check-row ${done ? 'checked' : ''}`}>
              <div className="activity-row">
                <div className="activity-left">
                  <input type="checkbox" className="check-hidden" checked={done} onChange={e => updateDayStatus('daily', name, e.target.checked)} />
                  <span className={done ? 'done-text' : 'miss-text'}>{name}</span>
                </div>
                <div className="activity-center"><CategoryPill category={meta.category} /></div>
                <div className="activity-right">{meta.timeLabel && <span className="time-pill">{meta.timeLabel}</span>}</div>
              </div>
            </label>
          );
        })}

        {/* WEEKLY */}
        <h3>Weekly ({dayName})</h3>
        {todaysWeekly.length === 0 && <p className="muted">No weekly activities scheduled for {dayName}.</p>}
        {todaysWeekly.map(w => {
          const done = !!weekly[w.name];
          const meta = getWeeklyMeta(w.name);
          return (
            <label key={w.name} className={`check-row ${done ? 'checked' : ''}`}>
              <div className="activity-row">
                <div className="activity-left">
                  <input type="checkbox" className="check-hidden" checked={done} onChange={e => updateDayStatus('weekly', w.name, e.target.checked)} />
                  <span className={done ? 'done-text' : 'miss-text'}>{w.name}</span>
                </div>
                <div className="activity-center"><CategoryPill category={meta.category} /></div>
                <div className="activity-right">{meta.timeLabel && <span className="time-pill">{meta.timeLabel}</span>}</div>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}
