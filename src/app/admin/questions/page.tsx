'use client';
import { useEffect, useState, useCallback } from 'react';
import { useToast } from '@/components/Toast';

const TYPES = ['rating', 'boolean', 'text', 'multiline'];
const TYPE_LABELS: Record<string, string> = { rating: '😊 Rating (1–5)', boolean: '✅ Yes / No', text: '📝 Short text', multiline: '📄 Long text' };

interface Question { id: number; text: string; type: string; category: string; sort_order: number; active: number; }

const DEFAULTS: Omit<Question, 'id' | 'active'> = { text: '', type: 'rating', category: 'General', sort_order: 0 };

function QuestionSkeleton() {
  return (
    <div className="card flex items-center gap-4 animate-pulse">
      <div className="w-8 h-8 rounded" style={{ background: '#1e3320' }} />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-48 rounded" style={{ background: '#1e3320' }} />
        <div className="h-3 w-32 rounded" style={{ background: '#1e3320' }} />
      </div>
    </div>
  );
}

export default function QuestionsPage() {
  const { toast } = useToast();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [form, setForm] = useState<typeof DEFAULTS>(DEFAULTS);
  const [editing, setEditing] = useState<Question | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [toggling, setToggling] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const r = await fetch('/api/admin/questions');
    const d = await r.json();
    setQuestions(d.questions || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

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
    try {
      if (editing) {
        const res = await fetch(`/api/admin/questions/${editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, active: editing.active }) });
        if (!res.ok) { toast('Failed to save', 'error'); setSaving(false); return; }
        setQuestions(prev => prev.map(q => q.id === editing.id ? { ...q, ...form, active: editing.active } : q));
      } else {
        const res = await fetch('/api/admin/questions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
        if (!res.ok) { toast('Failed to save', 'error'); setSaving(false); return; }
      }
      toast(editing ? 'Question updated' : 'Question added');
    } catch {
      toast('Connection error', 'error');
    }
    setSaving(false);
    setShowForm(false);
    setTimeout(load, 200);
  }

  async function toggleActive(q: Question) {
    setToggling(q.id);
    setQuestions(prev => prev.map(x => x.id === q.id ? { ...x, active: q.active ? 0 : 1 } : x));
    try {
      await fetch(`/api/admin/questions/${q.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...q, active: q.active ? 0 : 1 }) });
    } catch {
      setQuestions(prev => prev.map(x => x.id === q.id ? { ...x, active: q.active } : x));
      toast('Failed to toggle', 'error');
    }
    setToggling(null);
  }

  async function del(q: Question) {
    setDeleting(q.id);
    setQuestions(prev => prev.filter(x => x.id !== q.id));
    try {
      const res = await fetch(`/api/admin/questions/${q.id}`, { method: 'DELETE' });
      if (!res.ok) { setQuestions(prev => [...prev, q]); toast('Failed to delete', 'error'); } else { toast('Question removed'); }
    } catch { setQuestions(prev => [...prev, q]); toast('Connection error', 'error'); }
    setDeleting(null);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold" style={{ color: '#f0f7f0' }}>Questions</h1>
          <p className="text-sm mt-1" style={{ color: '#9bb09e' }}>These appear on every session report.</p>
        </div>
        <button onClick={startNew} className="btn-primary">+ Add Question</button>
      </div>

      <div className="space-y-2">
        {loading && Array.from({ length: 5 }).map((_, i) => <QuestionSkeleton key={i} />)}
        {!loading && questions.length === 0 && (
          <div className="card text-center py-12" style={{ color: '#4a6a4e' }}>No questions yet. Add your first one above.</div>
        )}
        {!loading && questions.map(q => (
          <div key={q.id} className="card flex items-center gap-4" style={{ opacity: deleting === q.id ? 0.5 : q.active ? 1 : 0.5, transition: 'opacity 0.2s' }}>
            <div className="text-xl w-8 text-center">{q.type === 'rating' ? '😊' : q.type === 'boolean' ? '✅' : q.type === 'text' ? '📝' : '📄'}</div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate" style={{ color: '#f0f7f0' }}>{q.text}</p>
              <div className="flex gap-3 mt-0.5 flex-wrap">
                <span className="text-xs" style={{ color: '#4a6a4e' }}>{TYPE_LABELS[q.type]}</span>
                <span className="text-xs" style={{ color: '#4a6a4e' }}>· {q.category}</span>
                <span className="text-xs" style={{ color: '#4a6a4e' }}>· #{q.sort_order}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
              <button onClick={() => toggleActive(q)} disabled={toggling === q.id} className="text-xs px-3 py-1 rounded-full border transition-all" style={{ borderColor: q.active ? '#10B981' : '#2d4a30', color: q.active ? '#10B981' : '#4a6a4e' }}>{q.active ? 'Active' : 'Inactive'}</button>
              <button onClick={() => startEdit(q)} className="btn-secondary py-1.5 px-3 text-xs">Edit</button>
              <button onClick={() => del(q)} disabled={deleting === q.id} className="btn-danger py-1.5 px-3 text-xs">{deleting === q.id ? '…' : 'Del'}</button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="w-[95vw] max-w-md card max-h-[85vh] overflow-y-auto">
            <h2 className="text-lg font-bold mb-5" style={{ color: '#f0f7f0' }}>{editing ? 'Edit Question' : 'New Question'}</h2>
            <div className="space-y-4">
              <div><label className="label">Question Text</label><input className="input" autoFocus value={form.text} onChange={e => setForm(f => ({ ...f, text: e.target.value }))} placeholder="e.g. Did the student get enough sleep?" /></div>
              <div><label className="label">Type</label><select className="input" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>{TYPES.map(t => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}</select></div>
              <div><label className="label">Category</label><input className="input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="e.g. Wellbeing, Learning, Behaviour" /></div>
              <div><label className="label">Sort Order</label><input className="input" type="number" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: Number(e.target.value) }))} /></div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={save} disabled={saving} className="btn-primary flex-1 justify-center">
                {saving ? <span className="flex items-center gap-2"><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Saving…</span> : 'Save'}
              </button>
              <button onClick={() => setShowForm(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
