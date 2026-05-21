import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { sql } from '@/lib/db';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const students = await sql`
    SELECT s.*, a.subject, a.sessions_per_week
    FROM students s
    JOIN assignments a ON a.student_id = s.id
    WHERE a.teacher_id = ${session.id} AND a.active = true
    ORDER BY s.name
  `;
  return NextResponse.json({ students });
}
