import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { sql } from '@/lib/db';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const rows = await sql`
    SELECT r.*, s.name as student_name, s.age as student_age, s.grade as student_grade,
           s.subject as student_subject, u.name as teacher_name
    FROM reports r
    JOIN students s ON s.id = r.student_id
    JOIN users u ON u.id = r.teacher_id
    WHERE r.id = ${params.id}
  `;
  const report = rows[0];
  if (!report) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Access control
  if (session.role === 'teacher' && report.teacher_id !== session.id) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }
  if (session.role === 'parent') {
    const access = await sql`
      SELECT 1 FROM parent_students WHERE parent_id=${session.id} AND student_id=${report.student_id}
    `;
    if (!access.length) return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }

  const answers = await sql`
    SELECT ra.answer, q.text as question, q.type, q.category, q.sort_order
    FROM report_answers ra
    JOIN questions q ON q.id = ra.question_id
    WHERE ra.report_id = ${params.id}
    ORDER BY q.sort_order, q.id
  `;

  return NextResponse.json({ report, answers });
}
