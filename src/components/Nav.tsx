'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

interface NavItem { href: string; label: string; icon: React.ReactNode; }

function NavIcon({ path }: { path: string }) {
  const icons: Record<string, React.ReactNode> = {
    dashboard: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />,
    questions: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
    teachers: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />,
    students: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />,
    reports: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />,
  };
  return (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      {icons[path]}
    </svg>
  );
}

function SidebarContent({ role, items, onNav }: { role: string; items: NavItem[]; onNav?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.replace('/');
  }

  return (
    <div className="flex flex-col h-full" style={{ background: '#080c09' }}>
      {/* Logo */}
      <div className="px-4 py-4" style={{ borderBottom: '1px solid #1a261e' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm" style={{ background: 'linear-gradient(135deg, #10B981, #047857)' }}>
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div className="leading-tight">
            <div className="text-xs font-bold tracking-tight" style={{ color: '#edf5ef' }}>PTB TRACKER</div>
            <div className="text-[10px] font-medium tracking-wide" style={{ color: '#5c6e60' }}>
              {role === 'admin' ? 'ADMIN' : role === 'parent' ? 'PARENT' : 'TEACHER'}
            </div>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-2.5 py-3 space-y-0.5 overflow-y-auto">
        {items.map(item => {
          const active = pathname === item.href || (item.href !== '/admin' && item.href !== '/teacher' && item.href !== '/parent' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNav}
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium transition-all duration-150"
              style={{
                color: active ? '#10B981' : '#8fa394',
                background: active ? 'rgba(16,185,129,0.1)' : 'transparent',
              }}
            >
              {item.icon}
              <span className="truncate">{item.label}</span>
              {active && (
                <div className="ml-auto w-1 h-1 rounded-full flex-shrink-0" style={{ background: '#10B981' }} />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="px-2.5 py-3" style={{ borderTop: '1px solid #1a261e' }}>
        <button
          onClick={logout}
          className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium w-full transition-all"
          style={{ color: '#5c6e60' }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign Out
        </button>
      </div>
    </div>
  );
}

export default function Nav({ role }: { role: 'admin' | 'teacher' | 'parent' }) {
  const [open, setOpen] = useState(false);

  // Close sidebar on route change (handled by Link clicks via onNav)
  // Also close on screen resize to desktop
  useEffect(() => {
    function onResize() {
      if (window.innerWidth >= 768) setOpen(false);
    }
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Lock body scroll when sidebar is open on mobile
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const adminItems: NavItem[] = [
    { href: '/admin', label: 'Dashboard', icon: <NavIcon path="dashboard" /> },
    { href: '/admin/questions', label: 'Questions', icon: <NavIcon path="questions" /> },
    { href: '/admin/teachers', label: 'Teachers', icon: <NavIcon path="teachers" /> },
    { href: '/admin/students', label: 'Students', icon: <NavIcon path="students" /> },
    { href: '/admin/reports', label: 'Reports', icon: <NavIcon path="reports" /> },
  ];

  const teacherItems: NavItem[] = [
    { href: '/teacher', label: 'My Students', icon: <NavIcon path="students" /> },
  ];

  const parentItems: NavItem[] = [
    { href: '/parent', label: 'Dashboard', icon: <NavIcon path="dashboard" /> },
  ];

  const items = role === 'admin' ? adminItems : role === 'parent' ? parentItems : teacherItems;

  const roleLabel = role === 'admin' ? 'Admin' : role === 'parent' ? 'Parent' : 'Teacher';

  return (
    <>
      {/* ── Mobile: hamburger top bar ── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 flex items-center gap-3 px-4 py-2.5" style={{ background: '#080c09', borderBottom: '1px solid #1a261e', paddingTop: 'max(10px, env(safe-area-inset-top))' }}>
        <button
          onClick={() => setOpen(o => !o)}
          className="w-10 h-10 flex items-center justify-center rounded-lg flex-shrink-0"
          style={{ background: open ? 'rgba(16,185,129,0.1)' : 'transparent' }}
          aria-label="Toggle menu"
        >
          {open ? (
            <svg className="w-5 h-5" style={{ color: '#10B981' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5" style={{ color: '#9bb09e' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #10B981, #047857)' }}>
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <span className="text-sm font-semibold truncate" style={{ color: '#f0f7f0' }}>PTB {roleLabel}</span>
        </div>
      </div>

      {/* ── Mobile: overlay backdrop + sidebar ── */}
      {open && (
        <div className="md:hidden fixed inset-0 z-40">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          {/* Sidebar panel */}
          <div className="absolute left-0 top-0 bottom-0 w-64 max-w-[85vw] animate-slide-in shadow-2xl" style={{ borderRight: '1px solid #1a261e' }}>
            <SidebarContent role={role} items={items} onNav={() => setOpen(false)} />
          </div>
        </div>
      )}

      {/* ── Desktop: fixed sidebar ── */}
      <aside className="hidden md:flex md:w-52 md:flex-shrink-0 md:flex-col" style={{ background: '#080c09', borderRight: '1px solid #1a261e', minHeight: '100vh' }}>
        <SidebarContent role={role} items={items} />
      </aside>

      <style jsx>{`
        @keyframes slideIn {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in {
          animation: slideIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </>
  );
}
