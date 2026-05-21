'use client';
import { useEffect, useState, useCallback } from 'react';
import { useToast } from '@/components/Toast';
import { EmptyStateTeachers } from '@/components/Illustrations';

interface Student { id: number; name: string; sessions_per_week: number; }
interface Teacher { id: number; name: string; username: string; students: Student[]; created_at: string; }

const BLANK = { name: '', username: '', password: '', student_ids: [] as number[] };

function TeacherSkeleton() {
  return (
    <div className="card animate-pulse">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="h-4 w-32 rounded" style={{ background: '#1e3320' }} />
          <div className="h-3 w-20 rounded" style={{ background: '#1e3320' }} />
        </div>
        <div className="flex gap-2">
          <div className="h-8 w-14 rounded-lg" style={{ background: '#1e3320' }} />
          <div className="h-8 w-14 rounded-lg" style={{ background: '#1e3320' }} />
        </div>
      </div>
    </div>
  );
}

export default function TeachersPage() {
  const { toast } = useToast();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [form, setForm] = useState(BLANK);
  const [editing, setEditing] = useState<Teacher | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const [deleting, setDeleting] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const [t, s] = await Promise.all([
      fetch('/api/admin/teachers').then(r => r.json()),
      fetch('/api/admin/students').then(r => r.json()),
    ]);
    setTeachers(t.teachers || []);
    setAllStudents(s.students || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  function startEdit(t: Teacher) {
    setEditing(t);
    setForm({ name: t.name, username: t.username, password: '', student_ids: t.students.map(s => s.id) });
    setShowForm(true);
    setErr('');
  }

  function startNew() {
    setEditing(null);
    setForm(BLANK);
    setShowForm(true);
    setErr('');
  }

  function toggleStudent(id: number) {
    setForm(f => ({
      ...f,
      student_ids: f.student_ids.includes(id)
        ? f.student_ids.filter(x => x !== id)
        : [...f.student_ids, id],
    }));
  }

  async function save() {
    setErr('');
    if (!form.name || !form.username) { setErr('Name and username are required.'); return; }
    if (!editing && !form.password) { setErr('Password is required for new teachers.'); return; }
    setSaving(true);

    // Optimistic temp ID for new items
    const tempId = editing ? editing.id : -(Date.now());

    try {
      const res = await fetch(editing ? `/api/admin/teachers/${editing.id}` : '/api/admin/teachers', {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const d = await res.json();
        setErr(d.error || 'Error');
        setSaving(false);
        return;
      }

      // Optimistic update
      if (editing) {
        setTeachers(prev => prev.map(t =>
          t.id === editing.id
            ? { ...t, name: form.name, username: form.username, students: allStudents.filter(s => form.student_ids.includes(s.id)).map(s => ({ ...s, sessions_per_week: s.sessions_per_week })) }
            : t
        ));
      }
      toast(editing ? 'Teacher updated' : 'Teacher created');
    } catch {
      toast('Connection error', 'error');
      setErr('Connection error');
    }

    setSaving(false);
    setShowForm(false);
    // Reload to get server data (assignments)
    setTimeout(load, 300);
  }

  async function del(t: Teacher) {
    setDeleting(t.id);
    // Optimistic removal
    setTeachers(prev => prev.filter(x => x.id !== t.id));

    try {
      const res = await fetch(`/api/admin/teachers/${t.id}`, { method: 'DELETE' });
      if (!res.ok) {
        setTeachers(prev => [...prev, t]); // rollback
        toast('Failed to delete', 'error');
      } else {
        toast(`${t.name} removed`);
      }
    } catch {
      setTeachers(prev => [...prev, t]); // rollback
      toast('Connection error', 'error');
    }
    setDeleting(null);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold" style={{ color: '#f0f7f0' }}>Teachers</h1>
          <p className="text-sm mt-1" style={{ color: '#9bb09e' }}>Create teacher accounts and assign students.</p>
        </div>
        <button onClick={startNew} className="btn-primary">+ Add Teacher</button>
      </div>

      <div className="space-y-3 list-enter">
        {loading && Array.from({ length: 3 }).map((_, i) => <TeacherSkeleton key={i} />)}
        {!loading && teachers.length === 0 && (
          <div className="card text-center py-12" style={{ color: '#5c6e60' }}>
            <EmptyStateTeachers />
            <p className="text-sm">No teachers yet. Add your first one above.</p>
          </div>
        )}
        {!loading && teachers.map(t => (
          <div key={t.id} className="card" style={{ opacity: deleting === t.id ? 0.5 : 1, transition: 'opacity 0.2s' }}>
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold" style={{ color: '#f0f7f0' }}>{t.name}</p>
                <p className="text-sm font-mono mt-0.5" style={{ color: '#10B981' }}>@{t.username}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => startEdit(t)} className="btn-secondary py-1.5 px-3 text-xs">Edit</button>
                <button
                  onClick={() => del(t)}
                  disabled={deleting === t.id}
                  className="btn-danger py-1.5 px-3 text-xs"
                >
                  {deleting === t.id ? '…' : 'Del'}
                </button>
              </div>
            </div>
            {t.students.length > 0 && (
              <div className="mt-3 flex gap-2 flex-wrap">
                {t.students.map(s => (
                  <span key={s.id} className="badge" style={{ background: '#1e3320', color: '#10B981', border: '1px solid #2d4a30' }}>
                    {s.name} · {s.sessions_per_week}x/wk
                  </span>
                ))}
              </div>
            )}
            {t.students.length === 0 && <p className="text-xs mt-2" style={{ color: '#4a6a4e' }}>No students assigned yet.</p>}
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop" style={{ background: 'rgba(0,0,0,0.6)' }}>
          <div className="w-[95vw] max-w-md card max-h-[85vh] overflow-y-auto">
            <h2 className="text-lg font-bold mb-5" style={{ color: '#f0f7f0' }}>{editing ? 'Edit Teacher' : 'New Teacher'}</h2>
            <div className="space-y-4">
              <div>
                <label className="label">Full Name *</label>
                <input className="input" autoFocus value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Sarah Johnson" />
              </div>
              <div>
                <label className="label">Username *</label>
                <input className="input" value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value.toLowerCase().replace(/\s/g, '.') }))} placeholder="e.g. sarah.johnson" />
              </div>
              <div>
                <label className="label">{editing ? 'New Password (leave blank to keep)' : 'Password *'}</label>
                <input className="input" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="••••••••" />
              </div>
              <div>
                <label className="label">Assign Students</label>
                <div className="space-y-1.5 mt-1">
                  {allStudents.length === 0 && <p className="text-xs" style={{ color: '#4a6a4e' }}>No students created yet.</p>}
                  {allStudents.map(s => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => toggleStudent(s.id)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-left transition-all"
                      style={{
                        background: form.student_ids.includes(s.id) ? 'rgba(16,185,129,0.1)' : '#1e3320',
                        border: `1px solid ${form.student_ids.includes(s.id) ? '#10B981' : '#2d4a30'}`,
                        color: '#f0f7f0',
                      }}
                    >
                      <span className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0" style={{ background: form.student_ids.includes(s.id) ? '#10B981' : '#2d4a30' }}>
                        {form.student_ids.includes(s.id) && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>}
                      </span>
                      <span className="flex-1">{s.name}</span>
                      <span className="text-xs" style={{ color: '#4a6a4e' }}>{s.sessions_per_week}x/wk</span>
                    </button>
                  ))}
                </div>
              </div>
              {err && (
                <button onClick={() => setErr('')} className="w-full text-left text-red-400 text-sm bg-red-900/20 border border-red-500/20 rounded-lg px-3 py-2">
                  {err}
                </button>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={save} disabled={saving} className="btn-primary flex-1 justify-center">
                {saving ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Saving…
                  </span>
                ) : 'Save Teacher'}
              </button>
              <button onClick={() => setShowForm(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
