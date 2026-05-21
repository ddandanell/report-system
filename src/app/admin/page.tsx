'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Stats { teachers: number; students: number; questions: number; reports_this_week: number; }

function StatSkeleton() {
  return (
    <div className="card animate-pulse">
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <div className="h-9 w-16 rounded" style={{ background: '#1e3320' }} />
          <div className="h-4 w-24 rounded" style={{ background: '#1e3320' }} />
        </div>
        <div className="w-8 h-8 rounded" style={{ background: '#1e3320' }} />
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/teachers').then(r => r.json()),
      fetch('/api/admin/students').then(r => r.json()),
      fetch('/api/admin/questions').then(r => r.json()),
      fetch('/api/admin/reports').then(r => r.json()),
    ]).then(([t, s, q, r]) => {
      const now = new Date();
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      const weekStart = new Date(now.setDate(diff)).toISOString().split('T')[0];
      const thisWeek = (r.reports || []).filter((rep: any) => rep.week_start === weekStart).length;
      setStats({
        teachers: (t.teachers || []).length,
        students: (s.students || []).length,
        questions: (q.questions || []).filter((q: any) => q.active).length,
        reports_this_week: thisWeek,
      });
    });
  }, []);

  const cards = [
    { label: 'Active Teachers', value: stats?.teachers ?? null, href: '/admin/teachers', color: '#10B981', icon: '👩‍🏫' },
    { label: 'Students', value: stats?.students ?? null, href: '/admin/students', color: '#3b82f6', icon: '👦' },
    { label: 'Active Questions', value: stats?.questions ?? null, href: '/admin/questions', color: '#a855f7', icon: '❓' },
    { label: 'Reports This Week', value: stats?.reports_this_week ?? null, href: '/admin/reports', color: '#f59e0b', icon: '📋' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-xl sm:text-2xl font-bold" style={{ color: '#f0f7f0' }}>Dashboard</h1>
        <p className="text-sm mt-1" style={{ color: '#9bb09e' }}>Welcome back — here's your week at a glance.</p>
      </div>

      <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4 mb-8">
        {!stats && Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)}
        {stats && cards.map(c => (
          <Link key={c.label} href={c.href} className="card hover:border-emerald-500/30 transition-all duration-200 group">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-3xl font-bold mb-1" style={{ color: c.color }}>{c.value}</div>
                <div className="text-sm" style={{ color: '#9bb09e' }}>{c.label}</div>
              </div>
              <span className="text-2xl">{c.icon}</span>
            </div>
          </Link>
        ))}
      </div>

      <div className="card">
        <h2 className="font-semibold mb-4" style={{ color: '#f0f7f0' }}>Quick Actions</h2>
        <div className="grid grid-cols-1 xs:grid-cols-3 gap-2 sm:gap-3">
          {[
            { href: '/admin/students', label: '+ Add Student' },
            { href: '/admin/teachers', label: '+ Add Teacher' },
            { href: '/admin/questions', label: '+ Add Question' },
          ].map(a => (
            <Link key={a.href} href={a.href} className="btn-secondary text-center block justify-center">
              {a.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
