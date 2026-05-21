'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me').then(r => {
      if (r.ok) r.json().then(d => {
        const dest = d.user.role === 'admin' ? '/admin' : d.user.role === 'parent' ? '/parent' : '/teacher';
        router.replace(dest);
      });
    });
  }, []);

  async function login(username: string) {
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password: 'demo' }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Login failed'); setLoading(false); return; }
      const dest = data.user.role === 'admin' ? '/admin' : data.user.role === 'parent' ? '/parent' : '/teacher';
      router.replace(dest);
    } catch {
      setError('Connection error.');
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Login failed'); setLoading(false); return; }
      const dest = data.user.role === 'admin' ? '/admin' : data.user.role === 'parent' ? '/parent' : '/teacher';
      router.replace(dest);
    } catch {
      setError('Connection error.');
      setLoading(false);
    }
  }

  const demoButtons = [
    { label: 'Admin', username: 'admin', desc: 'Dashboard, manage all', color: '#10B981', icon: '⚙️' },
    { label: 'Teacher', username: 'teacher', desc: 'Students & reports', color: '#3b82f6', icon: '👩‍🏫' },
    { label: 'Parent', username: 'parent', desc: 'Children & progress', color: '#f59e0b', icon: '👨‍👩‍👧' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 animated-bg">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4" style={{ background: 'linear-gradient(135deg, #10B981, #047857)' }}>
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: '#f0f7f0' }}>Private Tutoring Bali</h1>
          <p className="text-sm mt-1" style={{ color: '#9bb09e' }}>Session Tracker — Demo Preview</p>
        </div>

        {/* One-click demo access */}
        <div className="card mb-4">
          <p className="text-xs font-semibold uppercase tracking-wider mb-3 text-center" style={{ color: '#4a6a4e' }}>View Demo — No login needed</p>
          <div className="space-y-2">
            {demoButtons.map(btn => (
              <button
                key={btn.username}
                onClick={() => login(btn.username)}
                disabled={loading}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all active:scale-[0.98]"
                style={{
                  background: `${btn.color}15`,
                  border: `1px solid ${btn.color}30`,
                }}
              >
                <span className="text-xl w-8 text-center">{btn.icon}</span>
                <div className="flex-1">
                  <p className="font-semibold text-sm" style={{ color: '#f0f7f0' }}>{btn.label} Portal</p>
                  <p className="text-xs" style={{ color: '#4a6a4e' }}>{btn.desc}</p>
                </div>
                <svg className="w-4 h-4 flex-shrink-0" style={{ color: btn.color }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>
          {loading && (
            <div className="flex items-center justify-center gap-2 mt-3 text-sm" style={{ color: '#9bb09e' }}>
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Opening portal…
            </div>
          )}
        </div>

        {/* Manual login */}
        <details className="card mb-0">
          <summary className="text-xs font-semibold uppercase tracking-wider cursor-pointer select-none" style={{ color: '#4a6a4e' }}>
            Or sign in with credentials
          </summary>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div>
              <label className="label">Username</label>
              <input
                className="input"
                type="text"
                placeholder="your.username"
                autoComplete="username"
                value={form.username}
                onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="label">Password</label>
              <input
                className="input"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required
              />
            </div>
            {error && (
              <div className="text-red-400 text-sm bg-red-900/20 border border-red-500/20 rounded-lg px-4 py-3">{error}</div>
            )}
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </details>

        <p className="text-center text-xs mt-6" style={{ color: '#4a6a4e' }}>
          © 2026 Private Tutoring Bali · Internal use only
        </p>
      </div>
    </div>
  );
}
