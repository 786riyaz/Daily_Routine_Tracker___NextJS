// src/app/api/backup/route.js
import pool from '@/lib/db';

export async function GET() {
  try {
    const [actRows] = await pool.query('SELECT type, name, days FROM activities ORDER BY id');
    const [metaRows] = await pool.query('SELECT name, category, time_val FROM activity_meta');
    const [histRows] = await pool.query('SELECT date_key, type, name, done FROM activity_history');

    const daily = actRows.filter(r => r.type === 'daily').map(r => r.name);
    const weekly = actRows.filter(r => r.type === 'weekly').map(r => ({
      name: r.name,
      days: typeof r.days === 'string' ? JSON.parse(r.days) : (r.days || []),
    }));

    const customMeta = {};
    metaRows.forEach(r => { customMeta[r.name] = { category: r.category, time: r.time_val }; });

    const history = {};
    histRows.forEach(r => {
      if (!history[r.date_key]) history[r.date_key] = { daily: {}, weekly: {} };
      history[r.date_key][r.type][r.name] = !!r.done;
    });

    return Response.json({ activities: { daily, weekly }, customMeta, history, exportedAt: new Date().toISOString() });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { activities, customMeta, history } = await req.json();

    // Restore activities
    await pool.query('DELETE FROM activities');
    const vals = [];
    (activities?.daily || []).forEach(n => vals.push(['daily', n, null]));
    (activities?.weekly || []).forEach(w => vals.push(['weekly', w.name, JSON.stringify(w.days || [])]));
    if (vals.length) await pool.query('INSERT INTO activities (type, name, days) VALUES ?', [vals]);

    // Restore meta
    await pool.query('DELETE FROM activity_meta');
    const metaEntries = Object.entries(customMeta || []);
    if (metaEntries.length) {
      const metaVals = metaEntries.map(([name, v]) => [name, v.category || 'Other / Custom', v.time || '']);
      await pool.query('INSERT INTO activity_meta (name, category, time_val) VALUES ?', [metaVals]);
    }

    // Restore history
    await pool.query('DELETE FROM activity_history');
    const histVals = [];
    Object.entries(history || {}).forEach(([date, entry]) => {
      Object.entries(entry.daily || {}).forEach(([name, done]) => histVals.push([date, 'daily', name, done ? 1 : 0]));
      Object.entries(entry.weekly || {}).forEach(([name, done]) => histVals.push([date, 'weekly', name, done ? 1 : 0]));
    });
    if (histVals.length)
      await pool.query('INSERT INTO activity_history (date_key, type, name, done) VALUES ?', [histVals]);

    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
