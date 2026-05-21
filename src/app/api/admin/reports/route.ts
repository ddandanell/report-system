import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { sql } from '@/lib/db';

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get('student_id');
  const weekStart = searchParams.get('week_start');

  let reports;
  if (studentId && weekStart) {
    reports = await sql`
      SELECT r.*, s.name as student_name, u.name as teacher_name
      FROM reports r JOIN students s ON s.id=r.student_id JOIN users u ON u.id=r.teacher_id
      WHERE r.student_id=${studentId} AND r.week_start=${weekStart}
      ORDER BY r.session_date DESC
    `;
  } else if (studentId) {
    reports = await sql`
      SELECT r.*, s.name as student_name, u.name as teacher_name
      FROM reports r JOIN students s ON s.id=r.student_id JOIN users u ON u.id=r.teacher_id
      WHERE r.student_id=${studentId} ORDER BY r.session_date DESC
    `;
  } else if (weekStart) {
    reports = await sql`
      SELECT r.*, s.name as student_name, u.name as teacher_name
      FROM reports r JOIN students s ON s.id=r.student_id JOIN users u ON u.id=r.teacher_id
      WHERE r.week_start=${weekStart} ORDER BY r.session_date DESC
    `;
  } else {
    reports = await sql`
      SELECT r.*, s.name as student_name, u.name as teacher_name
      FROM reports r JOIN students s ON s.id=r.student_id JOIN users u ON u.id=r.teacher_id
      ORDER BY r.session_date DESC LIMIT 200
    `;
  }

  return NextResponse.json({ reports });
}
