import pool from '@/lib/db';

export async function GET() {
  try {
    const [rows] = await pool.query('SELECT name, category, time_val FROM activity_meta');
    const meta = {};
    rows.forEach(r => { meta[r.name] = { category: r.category, time: r.time_val }; });
    return Response.json(meta);
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const meta = await req.json(); // { name: { category, time } }
    await pool.query('DELETE FROM activity_meta');
    const entries = Object.entries(meta);
    if (entries.length) {
      const vals = entries.map(([name, v]) => [name, v.category || 'Other / Custom', v.time || '']);
      await pool.query('INSERT INTO activity_meta (name, category, time_val) VALUES ?', [vals]);
    }
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
