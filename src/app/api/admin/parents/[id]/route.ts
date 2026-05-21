import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { sql } from '@/lib/db';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || session.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { name, email, student_ids } = await req.json();
  await sql`UPDATE users SET name=${name}, email=${email} WHERE id=${params.id}`;

  await sql`DELETE FROM parent_students WHERE parent_id=${params.id}`;
  if (student_ids?.length) {
    for (const sid of student_ids) {
      await sql`INSERT INTO parent_students (parent_id, student_id) VALUES (${params.id}, ${sid}) ON CONFLICT DO NOTHING`;
    }
  }

  const rows = await sql`SELECT id, name, username, email, role, created_at FROM users WHERE id=${params.id}`;
  return NextResponse.json({ parent: rows[0] });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || session.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await sql`DELETE FROM users WHERE id=${params.id} AND role='parent'`;
  return NextResponse.json({ ok: true });
}
