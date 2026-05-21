'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface TeacherStudent { id: number; name: string; sessions_per_week: number; }
interface Teacher { id: number; name: string; students: TeacherStudent[]; }
interface Report { teacher_id: number; student_id: number; week_start: string; }

function getWeekStart() {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff)).toISOString().split('T')[0];
}

function StatSkeleton() {
  return (
    <div className="stat-card animate-pulse">
      <div className="space-y-2">
        <div className="h-8 w-12 rounded" style={{ background: '#253628' }} />
        <div className="h-3 w-20 rounded" style={{ background: '#253628' }} />
      </div>
    </div>
  );
}

function StatCard({ label, value, href, color, icon }: { label: string; value: number; href: string; color: string; icon: string }) {
  return (
    <Link href={href} className="stat-card stat-card-shimmer block group scale-hover">
      <div className="absolute left-0 top-0 bottom-0 w-0.5 rounded-l-[14px]" style={{ background: `linear-gradient(180deg, ${color}, ${color}88)` }} />
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[1.75rem] font-extrabold tracking-tight leading-none mb-1.5" style={{ color }}>{value}</div>
          <div className="text-[0.75rem] font-medium tracking-wide uppercase" style={{ color: '#5c6e60' }}>{label}</div>
        </div>
        <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg flex-shrink-0 opacity-75 group-hover:opacity-100 transition-opacity" style={{ background: `${color}10` }}>
          {icon}
        </div>
      </div>
    </Link>
  );
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const weekStart = getWeekStart();

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/teachers').then(r => r.json()),
      fetch('/api/admin/reports').then(r => r.json()),
    ]).then(([t, r]) => {
      setTeachers(t.teachers || []);
      setReports(r.reports || []);
      setLoading(false);
    });
  }, []);

  // Calculate per-teacher stats
  const teacherStats = teachers.map(teacher => {
    const thisWeekReports = reports.filter(r =>
      r.teacher_id === teacher.id && r.week_start === weekStart
    );
    let required = 0;
    let submitted = 0;
    const studentDetails: { name: string; done: number; total: number }[] = [];

    for (const s of teacher.students) {
      const perWeek = s.sessions_per_week || 0;
      const done = thisWeekReports.filter(r => r.student_id === s.id).length;
      required += perWeek;
      submitted += done;
      studentDetails.push({ name: s.name, done, total: perWeek });
    }

    const missing = required - submitted;
    const complete = required > 0 && missing <= 0;

    return { ...teacher, required, submitted, missing, complete, studentDetails };
  });

  const totalRequired = teacherStats.reduce((s, t) => s + t.required, 0);
  const totalSubmitted = teacherStats.reduce((s, t) => s + t.submitted, 0);
  const totalMissing = totalRequired - totalSubmitted;

  const cards = [
    { label: 'Teachers', value: teachers.length, href: '/admin/teachers', color: '#10B981', icon: '👩‍🏫' },
    { label: 'Students', value: teachers.reduce((s, t) => s + t.students.length, 0), href: '/admin/students', color: '#3b82f6', icon: '👦' },
    { label: 'Done', value: totalSubmitted, href: '/admin/reports', color: '#10B981', icon: '✅' },
    { label: 'Missing', value: totalMissing, href: '/admin/reports', color: totalMissing > 0 ? '#ef4444' : '#10B981', icon: '⚠️' },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-gradient">Dashboard</h1>
        <p className="text-[0.8125rem] mt-0.5" style={{ color: '#5c6e60' }}>
          Week of {weekStart} · {totalSubmitted}/{totalRequired} reports submitted
        </p>
      </div>

      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {loading && Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)}
        {!loading && cards.map(c => <StatCard key={c.label} {...c} />)}
      </div>

      {/* Weekly Report Tracker */}
      {!loading && (
        <div className="card mb-4">
          <h2 className="text-[0.8125rem] font-semibold tracking-wide uppercase mb-4" style={{ color: '#5c6e60' }}>
            This Week's Reports
          </h2>
          {teacherStats.length === 0 && (
            <p className="text-sm py-4 text-center" style={{ color: '#5c6e60' }}>No teachers or students yet. Add them to start tracking.</p>
          )}
          <div className="space-y-3 list-enter">
            {teacherStats.map(t => (
              <div key={t.id} className={`rounded-lg p-3 card-glow ${!t.complete ? 'missing-pulse' : ''}`} style={{ background: '#0f1611', border: `1px solid ${t.complete ? '#1d2d20' : 'rgba(239,68,68,0.15)'}` }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm" style={{ color: '#edf5ef' }}>{t.name}</span>
                    {t.complete ? (
                      <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981' }}>✓ Complete</span>
                    ) : (
                      <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>⚠ {t.missing} missing</span>
                    )}
                  </div>
                  <span className="text-xs font-mono" style={{ color: t.complete ? '#10B981' : '#ef4444' }}>
                    {t.submitted}/{t.required}
                  </span>
                </div>
                {/* Progress bar */}
                <div className="h-1 rounded-full overflow-hidden mb-2" style={{ background: '#1a261e' }}>
                  <div className="h-full rounded-full transition-all" style={{
                    width: `${t.required > 0 ? (t.submitted / t.required) * 100 : 0}%`,
                    background: t.complete ? '#10B981' : '#f59e0b',
                  }} />
                </div>
                {/* Per-student breakdown */}
                <div className="flex gap-3 flex-wrap">
                  {t.studentDetails.map(s => (
                    <span key={s.name} className="text-xs" style={{ color: s.done >= s.total ? '#10B981' : '#8fa394' }}>
                      {s.name} {s.done}/{s.total}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <h2 className="text-[0.8125rem] font-semibold tracking-wide uppercase mb-4" style={{ color: '#5c6e60' }}>Quick Actions</h2>
        <div className="grid grid-cols-1 xs:grid-cols-3 gap-2">
          {[
            { href: '/admin/students', label: 'Add Student' },
            { href: '/admin/teachers', label: 'Add Teacher' },
            { href: '/admin/questions', label: 'Edit Questions' },
          ].map(a => (
            <Link key={a.href} href={a.href} className="btn-secondary justify-center">
              + {a.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
