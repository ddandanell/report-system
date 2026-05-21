'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface ChildInfo { id: number; name: string; age?: number; grade?: string; subject?: string; teacher_name?: string; }
interface ReportSummary { id: number; child_name: string; session_date: string; topic?: string; }

export default function ParentDashboard() {
  const [user, setUser] = useState<{ name: string } | null>(null);
  const [children, setChildren] = useState<ChildInfo[]>([]);
  const [reports, setReports] = useState<ReportSummary[]>([]);

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => setUser(d.user));
    // For now, show a simple dashboard. Full children/reports API to be built.
    fetch('/api/parent/children').then(r => r.json()).then(d => setChildren(d.children || []));
    fetch('/api/parent/reports').then(r => r.json()).then(d => setReports(d.reports || []));
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: '#f0f7f0' }}>
          {user ? `Hello, ${user.name.split(' ')[0]} 👋` : 'Parent Dashboard'}
        </h1>
        <p className="text-sm mt-1" style={{ color: '#9bb09e' }}>
          View your children's session reports below.
        </p>
      </div>

      {/* Children cards */}
      {children.length === 0 && (
        <div className="card text-center py-16" style={{ color: '#4a6a4e' }}>
          <p className="text-4xl mb-3">👨‍👩‍👧</p>
          <p>No children linked to your account yet.</p>
          <p className="text-xs mt-1">Your admin will connect your children soon.</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 mb-8">
        {children.map(c => (
          <div key={c.id} className="card hover:border-emerald-500/30 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: '#1e3320' }}>
                {c.name[0].toUpperCase()}
              </div>
              <div>
                <p className="font-bold" style={{ color: '#f0f7f0' }}>{c.name}</p>
                <div className="flex gap-2 mt-0.5 flex-wrap">
                  {c.age && <span className="text-xs" style={{ color: '#4a6a4e' }}>Age {c.age}</span>}
                  {c.grade && <span className="text-xs" style={{ color: '#4a6a4e' }}>· {c.grade}</span>}
                  {c.subject && <span className="text-xs" style={{ color: '#10B981' }}>· {c.subject}</span>}
                </div>
                {c.teacher_name && <p className="text-xs mt-1" style={{ color: '#4a6a4e' }}>Tutor: {c.teacher_name}</p>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent reports */}
      {reports.length > 0 && (
        <div className="card">
          <h2 className="font-semibold mb-4" style={{ color: '#f0f7f0' }}>Recent Reports</h2>
          <div className="space-y-2">
            {reports.slice(0, 10).map(r => (
              <Link
                key={r.id}
                href={`/report/${r.id}`}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-dark-700 transition-colors"
                style={{ color: '#f0f7f0' }}
              >
                <span className="text-lg">{r.child_name?.[0]?.toUpperCase() || '?'}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium">{r.child_name}</p>
                  <p className="text-xs" style={{ color: '#9bb09e' }}>
                    {new Date(r.session_date + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
                    {r.topic ? ` · ${r.topic}` : ''}
                  </p>
                </div>
                <svg className="w-4 h-4" style={{ color: '#4a6a4e' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Info panel */}
      <div className="card mt-4">
        <h2 className="font-semibold mb-2" style={{ color: '#f0f7f0' }}>About Session Reports</h2>
        <p className="text-sm leading-relaxed" style={{ color: '#9bb09e' }}>
          After each tutoring session, your child's teacher fills out a report covering energy level, mood, focus,
          task completion, behaviour, and overall progress. Reports include a rating scale from 😢 to 😄.
        </p>
        <p className="text-xs mt-2" style={{ color: '#4a6a4e' }}>
          Need help? Contact admin@privatetutoringbali.com
        </p>
      </div>
    </div>
  );
}
