'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Report { id: number; student_name: string; teacher_name: string; session_date: string; week_start: string; created_at: string; }
interface Student { id: number; name: string; }

function getWeekStart(offset = 0) {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) + offset * 7;
  const monday = new Date(new Date().setDate(diff));
  return monday.toISOString().split('T')[0];
}

function fmtDate(str: string) {
  return new Date(str + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [weekStart, setWeekStart] = useState(getWeekStart(0));
  const [studentId, setStudentId] = useState('');
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const params = new URLSearchParams();
    if (weekStart) params.set('week_start', weekStart);
    if (studentId) params.set('student_id', studentId);
    const [r, s] = await Promise.all([
      fetch(`/api/admin/reports?${params}`).then(x => x.json()),
      fetch('/api/admin/students').then(x => x.json()),
    ]);
    setReports(r.reports || []);
    setStudents(s.students || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, [weekStart, studentId]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#f0f7f0' }}>Reports</h1>
          <p className="text-sm mt-1" style={{ color: '#9bb09e' }}>Browse all session reports. Click to view the full report.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-6 flex gap-4 flex-wrap">
        <div className="flex-1 min-w-[160px]">
          <label className="label">Week</label>
          <div className="flex gap-2 items-center">
            <button onClick={() => setWeekStart(getWeekStart(-1))} className="btn-secondary py-1.5 px-3">← Prev</button>
            <input type="date" className="input flex-1" value={weekStart} onChange={e => setWeekStart(e.target.value)} />
            <button onClick={() => setWeekStart(getWeekStart(1))} className="btn-secondary py-1.5 px-3">Next →</button>
          </div>
        </div>
        <div className="flex-1 min-w-[160px]">
          <label className="label">Student</label>
          <select className="input" value={studentId} onChange={e => setStudentId(e.target.value)}>
            <option value="">All students</option>
            {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div className="flex items-end">
          <button onClick={() => { setWeekStart(getWeekStart(0)); setStudentId(''); }} className="btn-secondary py-2.5">Reset</button>
        </div>
      </div>

      {/* Reports */}
      {loading && <div className="text-center py-12" style={{ color: '#4a6a4e' }}>Loading…</div>}
      {!loading && reports.length === 0 && (
        <div className="card text-center py-12" style={{ color: '#4a6a4e' }}>No reports found for this filter.</div>
      )}
      {!loading && reports.length > 0 && (
        <div className="space-y-2">
          {reports.map(r => (
            <Link
              key={r.id}
              href={`/report/${r.id}`}
              className="card flex items-center gap-4 hover:border-emerald-500/30 transition-all cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0" style={{ background: '#1e3320', color: '#10B981' }}>
                {r.student_name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm" style={{ color: '#f0f7f0' }}>{r.student_name}</p>
                <p className="text-xs mt-0.5" style={{ color: '#9bb09e' }}>Teacher: {r.teacher_name} · {fmtDate(r.session_date)}</p>
              </div>
              <div className="flex-shrink-0 flex items-center gap-2">
                <span className="text-xs px-2 py-1 rounded-full" style={{ background: '#1e3320', color: '#10B981' }}>
                  Wk of {r.week_start}
                </span>
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" style={{ color: '#4a6a4e' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
