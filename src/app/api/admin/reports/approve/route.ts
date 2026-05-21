import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { sql } from '@/lib/db';
import { sendReportApprovedNotification } from '@/lib/email';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { report_id } = await req.json();
  if (!report_id) return NextResponse.json({ error: 'report_id required' }, { status: 400 });

  // Mark report as approved
  const rows = await sql`
    UPDATE reports SET status='approved', approved_at=NOW(), approved_by=${session.id}
    WHERE id=${report_id}
    RETURNING *
  `;
  const report = rows[0];
  if (!report) return NextResponse.json({ error: 'Report not found' }, { status: 404 });

  // Get student + parent info
  const studentRows = await sql`SELECT * FROM students WHERE id=${report.student_id}`;
  const student = studentRows[0];

  // Find all parents of this student
  const parentRows = await sql`
    SELECT u.name, u.email FROM users u
    JOIN parent_students ps ON ps.parent_id = u.id
    WHERE ps.student_id=${report.student_id} AND u.email IS NOT NULL AND u.email != ''
  `;

  // Email each parent
  const emailErrors: string[] = [];
  for (const parent of parentRows) {
    try {
      await sendReportApprovedNotification(
        parent.email,
        parent.name,
        student.name,
        report.id,
        report.session_date,
        report.topic
      );
    } catch (e) {
      console.error(`Failed to email ${parent.email}:`, e);
      emailErrors.push(parent.email);
    }
  }

  return NextResponse.json({
    ok: true,
    report,
    parents_notified: parentRows.length - emailErrors.length,
    email_errors: emailErrors,
  });
}
