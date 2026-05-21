import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { sql } from '@/lib/db';

function getWeekStart(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  return monday.toISOString().split('T')[0];
}

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get('student_id');
  const weekStart = searchParams.get('week_start');

  let reports;
  if (studentId && weekStart) {
    reports = await sql`
      SELECT r.*, s.name as student_name FROM reports r JOIN students s ON s.id=r.student_id
      WHERE r.teacher_id=${session.id} AND r.student_id=${studentId} AND r.week_start=${weekStart}
      ORDER BY r.session_date DESC
    `;
  } else if (weekStart) {
    reports = await sql`
      SELECT r.*, s.name as student_name FROM reports r JOIN students s ON s.id=r.student_id
      WHERE r.teacher_id=${session.id} AND r.week_start=${weekStart}
      ORDER BY r.session_date DESC
    `;
  } else {
    reports = await sql`
      SELECT r.*, s.name as student_name FROM reports r JOIN students s ON s.id=r.student_id
      WHERE r.teacher_id=${session.id}
      ORDER BY r.session_date DESC LIMIT 100
    `;
  }
  return NextResponse.json({ reports });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { student_id, session_date, answers, overall_notes, topic } = await req.json();
  if (!student_id || !session_date || !answers) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  // Verify teacher has access to this student
  const access = await sql`
    SELECT 1 FROM assignments WHERE teacher_id=${session.id} AND student_id=${student_id} AND active=true
  `;
  if (!access.length) return NextResponse.json({ error: 'Access denied' }, { status: 403 });

  const week_start = getWeekStart(session_date);

  const rows = await sql`
    INSERT INTO reports (student_id, teacher_id, session_date, week_start, topic, overall_notes)
    VALUES (${student_id}, ${session.id}, ${session_date}, ${week_start}, ${topic || null}, ${overall_notes || null})
    RETURNING *
  `;
  const report = rows[0];

  for (const [questionId, answer] of Object.entries(answers)) {
    await sql`
      INSERT INTO report_answers (report_id, question_id, answer)
      VALUES (${report.id}, ${questionId}, ${String(answer)})
    `;
  }

  return NextResponse.json({ report }, { status: 201 });
}
