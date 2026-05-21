'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Stats { teachers: number; students: number; questions: number; reports_this_week: number; }

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
    <Link href={href} className="stat-card block group" style={{ '--accent-color': color } as any}>
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
    { label: 'Teachers', value: stats?.teachers ?? 0, href: '/admin/teachers', color: '#10B981', icon: '👩‍🏫' },
    { label: 'Students', value: stats?.students ?? 0, href: '/admin/students', color: '#3b82f6', icon: '👦' },
    { label: 'Questions', value: stats?.questions ?? 0, href: '/admin/questions', color: '#8b5cf6', icon: '❓' },
    { label: 'Reports', value: stats?.reports_this_week ?? 0, href: '/admin/reports', color: '#f59e0b', icon: '📋' },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-lg sm:text-xl font-extrabold tracking-tight" style={{ color: '#edf5ef' }}>Dashboard</h1>
        <p className="text-[0.8125rem] mt-0.5" style={{ color: '#5c6e60' }}>Overview of this week</p>
      </div>

      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {!stats && Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)}
        {stats && cards.map(c => (
          <StatCard key={c.label} {...c} />
        ))}
      </div>

      <div className="card">
        <h2 className="text-[0.8125rem] font-semibold tracking-wide uppercase mb-4" style={{ color: '#5c6e60' }}>Quick Actions</h2>
        <div className="grid grid-cols-1 xs:grid-cols-3 gap-2">
          {[
            { href: '/admin/students', label: 'Add Student' },
            { href: '/admin/teachers', label: 'Add Teacher' },
            { href: '/admin/questions', label: 'Add Question' },
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
