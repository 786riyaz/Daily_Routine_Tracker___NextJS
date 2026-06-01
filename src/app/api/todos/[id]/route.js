import pool from '@/lib/db';

export async function PATCH(req, { params }) {
  try {
    const { id } = await params;
    const { completed } = await req.json();
    await pool.query('UPDATE todos SET completed = ? WHERE id = ?', [completed ? 1 : 0, id]);
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = await params;
    await pool.query('DELETE FROM todos WHERE id = ?', [id]);
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
