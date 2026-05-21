'use client';
import { useEffect, useState } from 'react';

const TYPES = ['rating', 'boolean', 'text', 'multiline'];
const TYPE_LABELS: Record<string, string> = { rating: '😊 Rating (1–5)', boolean: '✅ Yes / No', text: '📝 Short text', multiline: '📄 Long text' };

interface Question { id: number; text: string; type: string; category: string; sort_order: number; active: number; }

const DEFAULTS: Omit<Question, 'id' | 'active'> = { text: '', type: 'rating', category: 'General', sort_order: 0 };

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [form, setForm] = useState<typeof DEFAULTS>(DEFAULTS);
  const [editing, setEditing] = useState<Question | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  async function load() {
    const r = await fetch('/api/admin/questions');
    const d = await r.json();
    setQuestions(d.questions || []);
  }

  useEffect(() => { load(); }, []);

  function startEdit(q: Question) {
    setEditing(q);
    setForm({ text: q.text, type: q.type, category: q.category, sort_order: q.sort_order });
    setShowForm(true);
  }

  function startNew() {
    setEditing(null);
    setForm({ ...DEFAULTS, sort_order: questions.length + 1 });
    setShowForm(true);
  }

  async function save() {
    setSaving(true);
    if (editing) {
      await fetch(`/api/admin/questions/${editing.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, active: editing.active }),
      });
    } else {
      await fetch('/api/admin/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
    }
    setSaving(false);
    setShowForm(false);
    load();
  }

  async function toggleActive(q: Question) {
    await fetch(`/api/admin/questions/${q.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...q, active: q.active ? 0 : 1 }),
    });
    load();
  }

  async function del(q: Question) {
    if (!confirm(`Delete "${q.text}"?`)) return;
    await fetch(`/api/admin/questions/${q.id}`, { method: 'DELETE' });
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#f0f7f0' }}>Questions</h1>
          <p className="text-sm mt-1" style={{ color: '#9bb09e' }}>These appear on every session report.</p>
        </div>
        <button onClick={startNew} className="btn-primary">+ Add Question</button>
      </div>

      {/* Question list */}
      <div className="space-y-2">
        {questions.length === 0 && (
          <div className="card text-center py-12" style={{ color: '#4a6a4e' }}>
            No questions yet. Add your first one above.
          </div>
        )}
        {questions.map(q => (
          <div key={q.id} className="card flex items-center gap-4" style={{ opacity: q.active ? 1 : 0.5 }}>
            <div className="text-xl w-8 text-center">
              {q.type === 'rating' ? '😊' : q.type === 'boolean' ? '✅' : q.type === 'text' ? '📝' : '📄'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate" style={{ color: '#f0f7f0' }}>{q.text}</p>
              <div className="flex gap-3 mt-0.5">
                <span className="text-xs" style={{ color: '#4a6a4e' }}>{TYPE_LABELS[q.type]}</span>
                <span className="text-xs" style={{ color: '#4a6a4e' }}>· {q.category}</span>
                <span className="text-xs" style={{ color: '#4a6a4e' }}>· #{q.sort_order}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => toggleActive(q)}
                className="text-xs px-3 py-1 rounded-full border transition-all"
                style={{ borderColor: q.active ? '#10B981' : '#2d4a30', color: q.active ? '#10B981' : '#4a6a4e' }}
              >
                {q.active ? 'Active' : 'Inactive'}
              </button>
              <button onClick={() => startEdit(q)} className="btn-secondary py-1 px-3">Edit</button>
              <button onClick={() => del(q)} className="btn-danger py-1 px-3">Del</button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-md card">
            <h2 className="text-lg font-bold mb-5" style={{ color: '#f0f7f0' }}>{editing ? 'Edit Question' : 'New Question'}</h2>
            <div className="space-y-4">
              <div>
                <label className="label">Question Text</label>
                <input className="input" value={form.text} onChange={e => setForm(f => ({ ...f, text: e.target.value }))} placeholder="e.g. Did the student get enough sleep?" />
              </div>
              <div>
                <label className="label">Type</label>
                <select className="input" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                  {TYPES.map(t => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Category</label>
                <input className="input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="e.g. Wellbeing, Learning, Behaviour" />
              </div>
              <div>
                <label className="label">Sort Order</label>
                <input className="input" type="number" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: Number(e.target.value) }))} />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={save} disabled={saving} className="btn-primary flex-1">{saving ? 'Saving…' : 'Save'}</button>
              <button onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
