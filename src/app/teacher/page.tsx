'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { EmptyStateStudents } from '@/components/Illustrations';

interface Student { id: number; name: string; age?: number; grade?: string; sessions_per_week: number; report_depth?: string; }
interface Report { id: number; student_id: number; session_date: string; week_start: string; }

function getWeekStart() {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(new Date().setDate(diff)).toISOString().split('T')[0];
}

export default function TeacherDashboard() {
  const [students, setStudents] = useState<Student[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [user, setUser] = useState<{ name: string } | null>(null);
  const weekStart = getWeekStart();

  useEffect(() => {
    Promise.all([
      fetch('/api/auth/me').then(r => r.json()),
      fetch('/api/teacher/students').then(r => r.json()),
      fetch(`/api/teacher/reports?week_start=${weekStart}`).then(r => r.json()),
    ]).then(([me, s, r]) => {
      setUser(me.user);
      setStudents(s.students || []);
      setReports(r.reports || []);
    });
  }, []);

  function reportsForStudent(studentId: number) {
    return reports.filter(r => r.student_id === studentId);
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-gradient">
          {user ? `Hello, ${user.name.split(' ')[0]} 👋` : 'My Students'}
        </h1>
        <p className="text-sm mt-1" style={{ color: '#9bb09e' }}>
          Week of {weekStart} — fill out a session report after each session.
        </p>
      </div>

      {students.length === 0 && (
        <div className="card text-center py-16" style={{ color: '#5c6e60' }}>
          <EmptyStateStudents />
          <p className="text-sm mt-4">No students assigned yet.</p>
          <p className="text-xs mt-1" style={{ color: '#5c6e60' }}>Your admin will set this up soon.</p>
        </div>
      )}

      <div className="space-y-4 list-enter">
        {students.map(s => {
          const done = reportsForStudent(s.id);
          const remaining = Math.max(0, s.sessions_per_week - done.length);
          const allDone = remaining === 0;

          return (
            <div key={s.id} className="card card-glow scale-hover">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: '#1e3320' }}>
                    {s.name[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold" style={{ color: '#f0f7f0' }}>{s.name}</p>
                    <div className="flex gap-2 mt-0.5 flex-wrap">
                      {s.age && <span className="text-xs" style={{ color: '#4a6a4e' }}>Age {s.age}</span>}
                      {s.grade && <span className="text-xs" style={{ color: '#4a6a4e' }}>· {s.grade}</span>}
                      <span className="text-xs font-medium" style={{ color: '#10B981' }}>· {s.sessions_per_week}x/week</span>
                      {s.report_depth && (
                        <span className="text-xs ml-1" style={{ color: s.report_depth === 'simple' ? '#f59e0b' : '#10B981' }}>
                          · {s.report_depth === 'simple' ? '📝' : '✏️'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Progress */}
                <div className="text-right flex-shrink-0">
                  <div className="text-2xl font-bold" style={{ color: allDone ? '#10B981' : '#f0f7f0' }}>
                    {done.length}/{s.sessions_per_week}
                  </div>
                  <div className="text-xs" style={{ color: '#4a6a4e' }}>this week</div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-4 h-1.5 rounded-full overflow-hidden" style={{ background: '#1e3320' }}>
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, (done.length / s.sessions_per_week) * 100)}%`,
                    background: allDone ? '#10B981' : 'linear-gradient(90deg, #10B981, #059669)',
                  }}
                />
              </div>

              {/* Action */}
              <div className="mt-4 flex items-center justify-between">
                <div>
                  {done.length > 0 && (
                    <div className="flex gap-1.5 flex-wrap">
                      {done.map((r, i) => (
                        <Link key={r.id} href={`/report/${r.id}`} className="text-xs px-2.5 py-1 rounded-full transition-all" style={{ background: '#1e3320', color: '#10B981', border: '1px solid #2d4a30' }}>
                          Session {i + 1} ✓
                        </Link>
                      ))}
                    </div>
                  )}
                  {done.length === 0 && (
                    <p className="text-xs" style={{ color: '#4a6a4e' }}>No reports yet this week.</p>
                  )}
                </div>
                {!allDone ? (
                  <Link href={`/teacher/report/${s.id}`} className="btn-primary">
                    Fill Report →
                  </Link>
                ) : (
                  <span className="text-sm font-semibold" style={{ color: '#10B981' }}>✅ Week complete!</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
