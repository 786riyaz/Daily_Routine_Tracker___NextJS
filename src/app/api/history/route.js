// src/app/api/history/route.js
import pool from '@/lib/db';

export async function GET() {
  try {
    const [rows] = await pool.query(
      'SELECT date_key, type, name, done FROM activity_history'
    );
    // Build { "2025-01-01": { daily: { "Fajr Salah": true }, weekly: {} } }
    const history = {};
    rows.forEach(r => {
      if (!history[r.date_key]) history[r.date_key] = { daily: {}, weekly: {} };
      history[r.date_key][r.type][r.name] = !!r.done;
    });
    return Response.json(history);
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { date, type, name, value } = await req.json();
    await pool.query(
      `INSERT INTO activity_history (date_key, type, name, done)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE done = VALUES(done)`,
      [date, type, name, value ? 1 : 0]
    );
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
