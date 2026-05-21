'use client';
import { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function SetPasswordForm() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) { setError('Passwords do not match'); return; }
    setError('');
    setLoading(true);
    const res = await fetch('/api/auth/set-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error || 'Error'); setLoading(false); return; }
    setDone(true);
    setTimeout(() => router.replace('/parent'), 1500);
  }

  if (!token) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0b130c' }}>
      <div className="card max-w-sm w-full text-center" style={{ color: '#ef4444' }}>Invalid invite link.</div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #060908, #0b130c, #121f13)' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4" style={{ background: 'linear-gradient(135deg, #10B981, #047857)' }}>
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold" style={{ color: '#f0f7f0' }}>Set Your Password</h1>
          <p className="text-sm mt-1" style={{ color: '#9bb09e' }}>Private Tutoring Bali — Parent Portal</p>
        </div>
        <div className="card">
          {done ? (
            <div className="text-center py-4">
              <div className="text-4xl mb-3">✅</div>
              <p className="font-semibold" style={{ color: '#10B981' }}>Password set! Redirecting…</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">New Password</label>
                <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Minimum 8 characters" required minLength={8} />
              </div>
              <div>
                <label className="label">Confirm Password</label>
                <input className="input" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Repeat password" required />
              </div>
              {error && <p className="text-red-400 text-sm bg-red-900/20 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}
              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? 'Saving…' : 'Set Password & Log In'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0b130c' }}>
        <div className="text-center" style={{ color: '#4a6a4e' }}>Loading…</div>
      </div>
    }>
      <SetPasswordForm />
    </Suspense>
  );
}
