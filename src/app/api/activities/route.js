// src/app/api/activities/route.js
import pool from '@/lib/db';
import { DEFAULT_DAILY_NAMES, DEFAULT_WEEKLY_ITEMS } from '@/lib/activityConfig';

export async function GET() {
  try {
    const [rows] = await pool.query('SELECT type, name, days FROM activities ORDER BY id');
    const daily = rows.filter(r => r.type === 'daily').map(r => r.name);
    const weekly = rows.filter(r => r.type === 'weekly').map(r => ({
      name: r.name,
      days: typeof r.days === 'string' ? JSON.parse(r.days) : (r.days || []),
    }));

    // Seed defaults if empty
    if (daily.length === 0 && weekly.length === 0) {
      const dailyVals = DEFAULT_DAILY_NAMES.map(n => ['daily', n, null]);
      const weeklyVals = DEFAULT_WEEKLY_ITEMS.map(w => ['weekly', w.name, JSON.stringify(w.days)]);
      if (dailyVals.length)
        await pool.query('INSERT IGNORE INTO activities (type, name, days) VALUES ?', [dailyVals]);
      if (weeklyVals.length)
        await pool.query('INSERT IGNORE INTO activities (type, name, days) VALUES ?', [weeklyVals]);
      return Response.json({ daily: DEFAULT_DAILY_NAMES, weekly: DEFAULT_WEEKLY_ITEMS });
    }

    return Response.json({ daily, weekly });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { daily, weekly } = await req.json();

    // Replace all activities
    await pool.query('DELETE FROM activities');
    const vals = [];
    (daily || []).forEach(n => vals.push(['daily', n, null]));
    (weekly || []).forEach(w => vals.push(['weekly', w.name, JSON.stringify(w.days || [])]));
    if (vals.length)
      await pool.query('INSERT INTO activities (type, name, days) VALUES ?', [vals]);

    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
