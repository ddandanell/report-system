'use client';
import { useEffect, useState } from 'react';

interface Student { id: number; name: string; age?: number; grade?: string; sessions_per_week: number; notes?: string; created_at: string; }

const BLANK: Omit<Student, 'id' | 'created_at'> = { name: '', age: undefined, grade: '', sessions_per_week: 2, notes: '' };

const SESSION_OPTS = [1, 2, 3, 4, 5];
const DAY_NAMES = ['', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Mon–Fri'];

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [form, setForm] = useState<typeof BLANK>(BLANK);
  const [editing, setEditing] = useState<Student | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  async function load() {
    const r = await fetch('/api/admin/students');
    const d = await r.json();
    setStudents(d.students || []);
  }

  useEffect(() => { load(); }, []);

  function startEdit(s: Student) {
    setEditing(s);
    setForm({ name: s.name, age: s.age, grade: s.grade || '', sessions_per_week: s.sessions_per_week, notes: s.notes || '' });
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
    const url = editing ? `/api/admin/students/${editing.id}` : '/api/admin/students';
    await fetch(url, {
      method: editing ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setShowForm(false);
    load();
  }

  async function del(s: Student) {
    if (!confirm(`Delete ${s.name}? This will also delete all their reports.`)) return;
    await fetch(`/api/admin/students/${s.id}`, { method: 'DELETE' });
    load();
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

      <div className="space-y-2">
        {students.length === 0 && (
          <div className="card text-center py-12" style={{ color: '#4a6a4e' }}>No students yet.</div>
        )}
        {students.map(s => (
          <div key={s.id} className="card flex items-center gap-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0" style={{ background: '#1e3320' }}>
              {s.name[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm" style={{ color: '#f0f7f0' }}>{s.name}</p>
              <div className="flex gap-3 mt-0.5 flex-wrap">
                {s.age && <span className="text-xs" style={{ color: '#4a6a4e' }}>Age {s.age}</span>}
                {s.grade && <span className="text-xs" style={{ color: '#4a6a4e' }}>· {s.grade}</span>}
                <span className="text-xs font-medium" style={{ color: '#10B981' }}>
                  · {s.sessions_per_week}x/week
                </span>
              </div>
              {s.notes && <p className="text-xs mt-0.5 truncate" style={{ color: '#4a6a4e' }}>{s.notes}</p>}
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button onClick={() => startEdit(s)} className="btn-secondary py-1 px-3">Edit</button>
              <button onClick={() => del(s)} className="btn-danger py-1 px-3">Del</button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="w-[95vw] max-w-md card max-h-[85vh] overflow-y-auto">
            <h2 className="text-lg font-bold mb-5" style={{ color: '#f0f7f0' }}>{editing ? 'Edit Student' : 'New Student'}</h2>
            <div className="space-y-4">
              <div>
                <label className="label">Full Name *</label>
                <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Luca van der Berg" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Age</label>
                  <input className="input" type="number" value={form.age || ''} onChange={e => setForm(f => ({ ...f, age: e.target.value ? Number(e.target.value) : undefined }))} placeholder="e.g. 8" />
                </div>
                <div>
                  <label className="label">Grade / Year</label>
                  <input className="input" value={form.grade} onChange={e => setForm(f => ({ ...f, grade: e.target.value }))} placeholder="e.g. Year 3" />
                </div>
              </div>
              <div>
                <label className="label">Sessions per Week</label>
                <div className="flex gap-2">
                  {SESSION_OPTS.map(n => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, sessions_per_week: n }))}
                      className="flex-1 py-2 rounded-lg text-sm font-bold transition-all"
                      style={{
                        background: form.sessions_per_week === n ? '#10B981' : '#1e3320',
                        color: form.sessions_per_week === n ? '#fff' : '#9bb09e',
                        border: `1px solid ${form.sessions_per_week === n ? '#10B981' : '#2d4a30'}`,
                      }}
                    >
                      {n}
                    </button>
                  ))}
                </div>
                <p className="text-xs mt-1.5" style={{ color: '#4a6a4e' }}>
                  {form.sessions_per_week} session{form.sessions_per_week > 1 ? 's' : ''} per week = {form.sessions_per_week} report{form.sessions_per_week > 1 ? 's' : ''} to complete each week.
                </p>
              </div>
              <div>
                <label className="label">Notes (optional)</label>
                <textarea className="input" rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="e.g. ADHD, shy around strangers, loves science" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={save} disabled={saving} className="btn-primary flex-1">{saving ? 'Saving…' : 'Save Student'}</button>
              <button onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
