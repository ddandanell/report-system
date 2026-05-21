import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { sql } from '@/lib/db';
import ReportView from './ReportView';

export default async function ReportPage({ params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) redirect('/');

  const rows = await sql`
    SELECT r.*, s.name as student_name, s.age as student_age, s.grade as student_grade,
           u.name as teacher_name
    FROM reports r
    JOIN students s ON s.id = r.student_id
    JOIN users u ON u.id = r.teacher_id
    WHERE r.id = ${params.id}
  `;
  const report = rows[0] as any;

  if (!report) redirect(session.role === 'admin' ? '/admin/reports' : '/teacher');

  if (session.role === 'teacher' && report.teacher_id !== session.id) {
    redirect('/teacher');
  }

  // Parent access check
  if (session.role === 'parent') {
    const access = await sql`
      SELECT 1 FROM parent_students
      WHERE parent_id = ${session.id} AND student_id = ${report.student_id}
    `;
    if (!access.length) redirect('/');
  }

  const answers = await sql`
    SELECT ra.answer, q.text as question, q.type, q.category, q.id as question_id, q.sort_order
    FROM report_answers ra
    JOIN questions q ON q.id = ra.question_id
    WHERE ra.report_id = ${params.id}
    ORDER BY q.sort_order, q.id
  `;

  return <ReportView report={report} answers={answers as any[]} role={session.role} />;
}
