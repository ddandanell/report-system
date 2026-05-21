import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { sql } from '@/lib/db';

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== 'parent') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const children = await sql`
    SELECT s.id, s.name, s.age, s.grade, s.subject,
           u.name as teacher_name
    FROM students s
    JOIN parent_students ps ON ps.student_id = s.id
    LEFT JOIN assignments a ON a.student_id = s.id AND a.active = true
    LEFT JOIN users u ON u.id = a.teacher_id
    WHERE ps.parent_id = ${session.id}
    ORDER BY s.name
  `;
  return NextResponse.json({ children });
}
