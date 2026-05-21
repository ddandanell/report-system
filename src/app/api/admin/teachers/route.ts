import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getSession } from '@/lib/auth';
import { sql } from '@/lib/db';

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const teachers = await sql`
    SELECT u.id, u.name, u.username, u.email, u.role, u.created_at,
           json_agg(
             json_build_object('id', s.id, 'name', s.name, 'subject', a.subject, 'sessions_per_week', a.sessions_per_week)
           ) FILTER (WHERE s.id IS NOT NULL) as students
    FROM users u
    LEFT JOIN assignments a ON a.teacher_id = u.id AND a.active = true
    LEFT JOIN students s ON s.id = a.student_id
    WHERE u.role = 'teacher'
    GROUP BY u.id
    ORDER BY u.name
  `;
  return NextResponse.json({ teachers: teachers.map(t => ({ ...t, students: t.students || [] })) });
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
