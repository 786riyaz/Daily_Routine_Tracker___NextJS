import pool from '@/lib/db';

export async function GET() {
  try {
    const [rows] = await pool.query('SELECT id, task, category, completed, created_at FROM todos ORDER BY id');
    const todos = rows.map(r => ({ ...r, completed: !!r.completed }));
    return Response.json(todos);
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { id, task, category, completed, createdAt } = await req.json();
    await pool.query(
      'INSERT INTO todos (id, task, category, completed, created_at) VALUES (?, ?, ?, ?, ?)',
      [id, task, category, completed ? 1 : 0, createdAt]
    );
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
