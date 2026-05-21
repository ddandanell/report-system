import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { sql } from '@/lib/db';

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'parent') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const childId = searchParams.get('child_id');

  let reports;
  if (childId) {
    reports = await sql`
      SELECT r.id, r.session_date, r.topic, s.name as child_name
      FROM reports r
      JOIN students s ON s.id = r.student_id
      JOIN parent_students ps ON ps.student_id = r.student_id
      WHERE ps.parent_id = ${session.id} AND r.student_id = ${childId}
      ORDER BY r.session_date DESC LIMIT 50
    `;
  } else {
    reports = await sql`
      SELECT r.id, r.session_date, r.topic, s.name as child_name
      FROM reports r
      JOIN students s ON s.id = r.student_id
      JOIN parent_students ps ON ps.student_id = r.student_id
      WHERE ps.parent_id = ${session.id}
      ORDER BY r.session_date DESC LIMIT 50
    `;
  }

  return NextResponse.json({ reports });
}
