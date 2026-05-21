'use client';
import { useEffect, useState, useCallback } from 'react';
import { useToast } from '@/components/Toast';

interface Student { id: number; name: string; age?: number; grade?: string; report_depth?: string; sessions_per_week: number; notes?: string; created_at: string; }

const DEPTH_OPTS = [
  { value: 'simple', label: 'Simple', icon: '📝', desc: 'Just write notes freely — no questions' },
  { value: 'standard', label: 'Standard', icon: '✏️', desc: 'Answer the 4 report questions' },
];

const BLANK: Omit<Student, 'id' | 'created_at'> = { name: '', age: undefined, grade: '', report_depth: 'standard', sessions_per_week: 2, notes: '' };

const SESSION_OPTS = [1, 2, 3, 4, 5];

function StudentSkeleton() {
  return (
    <div className="card flex items-center gap-4 animate-pulse">
      <div className="w-10 h-10 rounded-full flex-shrink-0" style={{ background: '#1e3320' }} />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-28 rounded" style={{ background: '#1e3320' }} />
        <div className="h-3 w-40 rounded" style={{ background: '#1e3320' }} />
      </div>
    </div>
  );
}

export default function StudentsPage() {
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [form, setForm] = useState<typeof BLANK>(BLANK);
  const [editing, setEditing] = useState<Student | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const r = await fetch('/api/admin/students');
    const d = await r.json();
    setStudents(d.students || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  function startEdit(s: Student) {
    setEditing(s);
    setForm({ name: s.name, age: s.age, grade: s.grade || '', report_depth: s.report_depth || 'standard', sessions_per_week: s.sessions_per_week, notes: s.notes || '' });
    setShowForm(true);
  }

  function startNew() {
    setEditing(null);
    setForm(BLANK);
    setShowForm(true);
  }

  async function save() {
    if (!form.name.trim()) return;
    setSaving(true);

    try {
      const url = editing ? `/api/admin/students/${editing.id}` : '/api/admin/students';
      const res = await fetch(url, {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) { toast('Failed to save', 'error'); setSaving(false); return; }

      if (editing) {
        setStudents(prev => prev.map(s => s.id === editing.id ? { ...s, ...form } : s));
      }
      toast(editing ? 'Student updated' : 'Student created');
    } catch {
      toast('Connection error', 'error');
    }
    setSaving(false);
    setShowForm(false);
    setTimeout(load, 300);
  }

  async function del(s: Student) {
    setDeleting(s.id);
    setStudents(prev => prev.filter(x => x.id !== s.id));
    try {
      const res = await fetch(`/api/admin/students/${s.id}`, { method: 'DELETE' });
      if (!res.ok) { setStudents(prev => [...prev, s]); toast('Failed to delete', 'error'); } else { toast(`${s.name} removed`); }
    } catch { setStudents(prev => [...prev, s]); toast('Connection error', 'error'); }
    setDeleting(null);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold" style={{ color: '#f0f7f0' }}>Students</h1>
          <p className="text-sm mt-1" style={{ color: '#9bb09e' }}>Manage student profiles and session schedules.</p>
        </div>
        <button onClick={startNew} className="btn-primary">+ Add Student</button>
      </div>

      <div className="space-y-2 list-enter">
        {loading && Array.from({ length: 4 }).map((_, i) => <StudentSkeleton key={i} />)}
        {!loading && students.length === 0 && (
          <div className="card text-center py-12" style={{ color: '#4a6a4e' }}>No students yet.</div>
        )}
        {!loading && students.map(s => (
          <div key={s.id} className="card flex items-center gap-4" style={{ opacity: deleting === s.id ? 0.5 : 1, transition: 'opacity 0.2s' }}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0" style={{ background: '#1e3320' }}>
              {s.name[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm" style={{ color: '#f0f7f0' }}>{s.name}</p>
              <div className="flex gap-3 mt-0.5 flex-wrap">
                {s.age && <span className="text-xs" style={{ color: '#4a6a4e' }}>Age {s.age}</span>}
                {s.grade && <span className="text-xs" style={{ color: '#4a6a4e' }}>· {s.grade}</span>}
                <span className="text-xs font-medium" style={{ color: '#10B981' }}>· {s.sessions_per_week}x/week</span>
              </div>
              <span className="text-xs font-medium ml-1" style={{ color: s.report_depth === 'simple' ? '#f59e0b' : '#10B981' }}>
                · {s.report_depth === 'simple' ? '📝 Simple' : '✏️ Standard'}
              </span>
              {s.notes && <p className="text-xs mt-0.5 truncate" style={{ color: '#4a6a4e' }}>{s.notes}</p>}
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button onClick={() => startEdit(s)} className="btn-secondary py-1.5 px-3 text-xs">Edit</button>
              <button onClick={() => del(s)} disabled={deleting === s.id} className="btn-danger py-1.5 px-3 text-xs">{deleting === s.id ? '…' : 'Del'}</button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop" style={{ background: 'rgba(0,0,0,0.6)' }}>
          <div className="w-[95vw] max-w-md card max-h-[85vh] overflow-y-auto">
            <h2 className="text-lg font-bold mb-5" style={{ color: '#f0f7f0' }}>{editing ? 'Edit Student' : 'New Student'}</h2>
            <div className="space-y-4">
              <div>
                <label className="label">Full Name *</label>
                <input className="input" autoFocus value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Luca van der Berg" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Age</label><input className="input" type="number" value={form.age || ''} onChange={e => setForm(f => ({ ...f, age: e.target.value ? Number(e.target.value) : undefined }))} placeholder="e.g. 8" /></div>
                <div><label className="label">Grade / Year</label><input className="input" value={form.grade} onChange={e => setForm(f => ({ ...f, grade: e.target.value }))} placeholder="e.g. Year 3" /></div>
              </div>
              <div>
                <label className="label">Sessions per Week</label>
                <div className="flex gap-2">
                  {SESSION_OPTS.map(n => (
                    <button key={n} type="button" onClick={() => setForm(f => ({ ...f, sessions_per_week: n }))} className="flex-1 py-2 rounded-lg text-sm font-bold transition-all" style={{ background: form.sessions_per_week === n ? '#10B981' : '#1e3320', color: form.sessions_per_week === n ? '#fff' : '#9bb09e', border: `1px solid ${form.sessions_per_week === n ? '#10B981' : '#2d4a30'}` }}>{n}</button>
                  ))}
                </div>
                <p className="text-xs mt-1.5" style={{ color: '#4a6a4e' }}>{form.sessions_per_week} session{form.sessions_per_week > 1 ? 's' : ''} per week.</p>
              </div>
              <div>
                <label className="label">Report Depth</label>
                <div className="space-y-1.5">
                  {DEPTH_OPTS.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, report_depth: opt.value }))}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all"
                      style={{
                        background: form.report_depth === opt.value ? 'rgba(16,185,129,0.08)' : '#1e3320',
                        border: `1px solid ${form.report_depth === opt.value ? '#10B981' : '#2d4a30'}`,
                      }}
                    >
                      <span className="text-lg">{opt.icon}</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium" style={{ color: form.report_depth === opt.value ? '#10B981' : '#9bb09e' }}>{opt.label}</p>
                        <p className="text-xs" style={{ color: '#4a6a4e' }}>{opt.desc}</p>
                      </div>
                      {form.report_depth === opt.value && (
                        <svg className="w-4 h-4 flex-shrink-0" style={{ color: '#10B981' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="label">Notes (optional)</label>
                <textarea className="input" rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="e.g. ADHD, shy around strangers, loves science" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={save} disabled={saving} className="btn-primary flex-1 justify-center">
                {saving ? <span className="flex items-center gap-2"><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Saving…</span> : 'Save Student'}
              </button>
              <button onClick={() => setShowForm(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
