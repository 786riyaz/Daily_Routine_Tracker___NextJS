'use client';
import { useState, useEffect } from 'react';
import CategoryPill from '@/components/CategoryPill';
import { CATEGORY_ORDER, CATEGORY_META, getDailyMeta, getWeeklyMeta } from '@/lib/activityConfig';
const DAYS_OF_WEEK = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
export default function SetupPage() {
  const [activities, setActivities] = useState({ daily: [], weekly: [] });
  const [customMeta, setCustomMeta] = useState({});
  const [loading, setLoading] = useState(true);
  // Daily add form
  const [dailyInput, setDailyInput] = useState('');
  const [dailyCat, setDailyCat] = useState('Other / Custom');
  const [dailyTime, setDailyTime] = useState('');
  // Weekly add form
  const [weeklyInput, setWeeklyInput] = useState('');
  const [weeklyCat, setWeeklyCat] = useState('Other / Custom');
  const [weeklyDays, setWeeklyDays] = useState([]);
  // Edit modal
  const [editItem, setEditItem] = useState(null);
  const [editCat, setEditCat] = useState('');
  const [editTime, setEditTime] = useState('');
  useEffect(() => {
    Promise.all([
      fetch('/api/activities').then(r => r.json()),
      fetch('/api/activities/meta').then(r => r.json()),
    ]).then(([acts, meta]) => { setActivities(acts); setCustomMeta(meta); setLoading(false); });
  }, []);
  async function saveActivities(newActs) {
    setActivities(newActs);
    await fetch('/api/activities', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newActs) });
  }
  async function saveMeta(newMeta) {
    setCustomMeta(newMeta);
    await fetch('/api/activities/meta', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newMeta) });
  }
  function addDaily() {
    const name = dailyInput.trim();
    if (!name || activities.daily.includes(name)) return;
    const newActs = { ...activities, daily: [...activities.daily, name] };
    const newMeta = { ...customMeta, [name]: { category: dailyCat, time: dailyTime } };
    saveActivities(newActs); saveMeta(newMeta);
    setDailyInput(''); setDailyCat('Other / Custom'); setDailyTime('');
  }
  function addWeekly() {
    const name = weeklyInput.trim();
    if (!name || activities.weekly.find(w => w.name === name)) return;
    const newActs = { ...activities, weekly: [...activities.weekly, { name, days: weeklyDays }] };
    const newMeta = { ...customMeta, [name]: { category: weeklyCat, time: '' } };
    saveActivities(newActs); saveMeta(newMeta);
    setWeeklyInput(''); setWeeklyCat('Other / Custom'); setWeeklyDays([]);
  }
  function removeActivity(type, name) {
    if (!confirm(`Remove "${name}"?`)) return;
    const newActs = type === 'daily'
      ? { ...activities, daily: activities.daily.filter(n => n !== name) }
      : { ...activities, weekly: activities.weekly.filter(w => w.name !== name) };
    saveActivities(newActs);
  }
  function openEdit(name, type) {
    const meta = type === 'daily' ? getDailyMeta(name, customMeta) : getWeeklyMeta(name);
    setEditItem({ name, type });
    setEditCat(customMeta[name]?.category || meta.category);
    setEditTime(customMeta[name]?.time || meta.time || '');
  }
  async function saveEdit() {
    const newMeta = { ...customMeta, [editItem.name]: { category: editCat, time: editTime } };
    await saveMeta(newMeta);
    setEditItem(null);
  }
  function toggleDay(day) {
    setWeeklyDays(d => d.includes(day) ? d.filter(x => x !== day) : [...d, day]);
  }
  const sortedDaily = [...activities.daily].sort((a, b) => {
    const ma = getDailyMeta(a, customMeta);
    const mb = getDailyMeta(b, customMeta);
    return (ma.sortKey || '99:99').localeCompare(mb.sortKey || '99:99');
  });
  if (loading) return <div className="loading-state">Loading...</div>;
  return (
    <div className="layout">
      <div className="card">
        <h2>Setup Activities</h2>
        {/* DAILY SECTION */}
        <h3>Daily Activities</h3>
        <div className="form-row">
          <input className="input" placeholder="Add new daily activity..." value={dailyInput}
            onChange={e => setDailyInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addDaily()} />
          <button className="btn-small" style={{ flexShrink: 0 }} onClick={addDaily}>Add</button>
        </div>
        <div className="form-row setup-meta-row" style={{ flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          <select className="input" style={{ width: 'auto', flex: 1 }} value={dailyCat} onChange={e => setDailyCat(e.target.value)}>
            {CATEGORY_ORDER.map(c => <option key={c} value={c}>{CATEGORY_META[c]?.icon} {c}</option>)}
          </select>
          <input type="time" className="input setup-time-input" style={{ width: 140, flex: '0 0 140px' }} value={dailyTime} onChange={e => setDailyTime(e.target.value)} />
        </div>
        <ul className="list">
          {sortedDaily.map(name => {
            const meta = getDailyMeta(name, customMeta);
            return (
              <li key={name} style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                <div className="item-row" style={{ border: 'none', padding: 0 }}>
                  <div className="setup-item-inner" style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                    <span className="setup-item-meta" style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', flex: 1 }}>
                      <span style={{ fontSize: '0.9rem', color: 'var(--text)' }}>{name}</span>
                      <CategoryPill category={meta.category} />
                      {meta.timeLabel && <span className="time-pill tiny">{meta.timeLabel}</span>}
                    </span>
                    <div className="setup-item-actions" style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                      <button className="icon-btn btn-small" style={{ width: 30, height: 30, fontSize: '0.85rem' }} onClick={() => openEdit(name, 'daily')}>✏</button>
                      <button className="icon-btn danger btn-small" style={{ width: 30, height: 30, fontSize: '0.85rem' }} onClick={() => removeActivity('daily', name)}>✕</button>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
        {/* WEEKLY SECTION */}
        <h3 style={{ marginTop: 24 }}>Weekly Activities</h3>
        <div className="form-row">
          <input className="input" placeholder="Add new weekly activity..." value={weeklyInput}
            onChange={e => setWeeklyInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addWeekly()} />
          <button className="btn-small" style={{ flexShrink: 0 }} onClick={addWeekly}>Add</button>
        </div>
        <div className="form-row setup-meta-row" style={{ flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
          <select className="input" style={{ width: 'auto', flex: 1 }} value={weeklyCat} onChange={e => setWeeklyCat(e.target.value)}>
            {CATEGORY_ORDER.map(c => <option key={c} value={c}>{CATEGORY_META[c]?.icon} {c}</option>)}
          </select>
        </div>
        <div className="days-grid" style={{ marginBottom: 16 }}>
          {DAYS_OF_WEEK.map(d => (
            <button key={d} className={`day-btn ${weeklyDays.includes(d) ? 'active' : ''}`} onClick={() => toggleDay(d)}>{d}</button>
          ))}
        </div>
        <ul className="list">
          {activities.weekly.map(w => {
            const meta = getWeeklyMeta(w.name);
            return (
              <li key={w.name} style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                <div className="item-row" style={{ border: 'none', padding: 0 }}>
                  <div className="setup-item-inner" style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                    <span className="setup-item-meta" style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.9rem', color: 'var(--text)' }}>{w.name}</span>
                      <CategoryPill category={meta.category} />
                      {(w.days || []).map(d => <span key={d} className="pill tiny">{d}</span>)}
                    </span>
                    <div className="setup-item-actions" style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                      <button className="icon-btn btn-small" style={{ width: 30, height: 30, fontSize: '0.85rem' }} onClick={() => openEdit(w.name, 'weekly')}>✏</button>
                      <button className="icon-btn danger btn-small" style={{ width: 30, height: 30, fontSize: '0.85rem' }} onClick={() => removeActivity('weekly', w.name)}>✕</button>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
      {/* EDIT MODAL */}
      {editItem && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }} onClick={() => setEditItem(null)}>
          <div className="card" style={{ minWidth: 280, maxWidth: 420, width: '100%' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 14px', color: 'var(--accent-light)' }}>Edit: {editItem.name}</h3>
            <div className="form-row" style={{ flexDirection: 'column', gap: 10 }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>Category
                <select className="input" style={{ marginTop: 4 }} value={editCat} onChange={e => setEditCat(e.target.value)}>
                  {CATEGORY_ORDER.map(c => <option key={c} value={c}>{CATEGORY_META[c]?.icon} {c}</option>)}
                </select>
              </label>
              {editItem.type === 'daily' && (
                <label style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>Time
                  <input type="time" className="input" style={{ marginTop: 4 }} value={editTime} onChange={e => setEditTime(e.target.value)} />
                </label>
              )}
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
              <button className="btn-small" onClick={saveEdit}>Save</button>
              <button className="btn-small" style={{ background: 'rgba(248,113,113,0.18)', color: 'var(--danger)', border: '1px solid var(--danger)' }} onClick={() => setEditItem(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}