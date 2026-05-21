import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getSession } from '@/lib/auth';
import { sql } from '@/lib/db';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || session.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { name, username, password, student_ids } = await req.json();

  if (password) {
    const hash = bcrypt.hashSync(password, 10);
    await sql`UPDATE users SET name=${name}, username=${username}, password_hash=${hash} WHERE id=${params.id}`;
  } else {
    await sql`UPDATE users SET name=${name}, username=${username} WHERE id=${params.id}`;
  }

  // Rebuild assignments
  await sql`UPDATE assignments SET active=false WHERE teacher_id=${params.id}`;
  if (student_ids?.length) {
    for (const sid of student_ids) {
      await sql`
        INSERT INTO assignments (teacher_id, student_id, active) VALUES (${params.id}, ${sid}, true)
        ON CONFLICT (teacher_id, student_id) DO UPDATE SET active=true
      `;
    }
  }

  const rows = await sql`SELECT id, name, username, role, created_at FROM users WHERE id=${params.id}`;
  return NextResponse.json({ teacher: rows[0] });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || session.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await sql`DELETE FROM users WHERE id=${params.id} AND role='teacher'`;
  return NextResponse.json({ ok: true });
}
