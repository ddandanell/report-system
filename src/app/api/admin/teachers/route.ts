import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getSession } from '@/lib/auth';
import { sql } from '@/lib/db';

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const teacherRows = await sql`SELECT id, name, username, email, role, created_at FROM users WHERE role = 'teacher' ORDER BY name`;

  // Fetch students for each teacher (plain SQL for SQLite compatibility)
  const teachers = await Promise.all(teacherRows.map(async (t: any) => {
    const studentRows = await sql`
      SELECT s.id, s.name, a.subject, a.sessions_per_week
      FROM assignments a
      JOIN students s ON s.id = a.student_id
      WHERE a.teacher_id = ${t.id} AND a.active = 1
      ORDER BY s.name
    `;
    return { ...t, students: studentRows };
  }));

  return NextResponse.json({ teachers });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { name, username, password, student_ids } = await req.json();
  if (!name || !username || !password) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

  const existing = await sql`SELECT id FROM users WHERE username = ${username}`;
  if (existing.length) return NextResponse.json({ error: 'Username already taken' }, { status: 409 });

  const hash = bcrypt.hashSync(password, 10);
  const rows = await sql`
    INSERT INTO users (name, username, password_hash, role)
    VALUES (${name}, ${username}, ${hash}, 'teacher')
    RETURNING id, name, username, role, created_at
  `;
  const teacher = rows[0];

  if (student_ids?.length) {
    for (const sid of student_ids) {
      await sql`
        INSERT INTO assignments (teacher_id, student_id) VALUES (${teacher.id}, ${sid})
        ON CONFLICT (teacher_id, student_id) DO NOTHING
      `;
    }
  }

  return NextResponse.json({ teacher }, { status: 201 });
}