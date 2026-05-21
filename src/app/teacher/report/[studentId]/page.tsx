'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface Question { id: number; text: string; type: string; category: string; }
interface Student { id: number; name: string; age?: number; grade?: string; sessions_per_week: number; report_depth?: string; }

export default function ReportFormPage() {
  const { studentId } = useParams();
  const router = useRouter();
  const [student, setStudent] = useState<Student | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    Promise.all([
      fetch('/api/teacher/students').then(r => r.json()),
      fetch('/api/questions/active').then(r => r.json()),
    ]).then(([s, q]) => {
      const stu = (s.students || []).find((x: Student) => x.id === Number(studentId));
      if (!stu) { router.replace('/teacher'); return; }
      setStudent(stu);

      const allQuestions = q.questions || [];
      const depth = stu.report_depth || 'standard';

      if (depth === 'simple') {
        setQuestions([]); // No questions, just notes
      } else {
        // Always show all questions (4 text-based questions)
        setQuestions(allQuestions);
      }
    });
  }, [studentId]);

  async function submit() {
    setErr('');
    setSaving(true);
    try {
      const res = await fetch('/api/teacher/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: Number(studentId), session_date: date, answers, overall_notes: '' }),
      });
      if (!res.ok) { const d = await res.json(); setErr(d.error || 'Error saving'); setSaving(false); return; }
      const { report } = await res.json();
      router.replace(`/report/${report.id}`);
    } catch {
      setErr('Connection error');
      setSaving(false);
    }
  }

  if (!student) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center" style={{ color: '#5c6e60' }}>
          <div className="text-4xl mb-3">⏳</div>
          <p className="text-sm">Loading…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-6">
        <button onClick={() => router.back()} className="text-sm mb-3 flex items-center gap-1" style={{ color: '#5c6e60' }}>
          ← Back
        </button>
        <h1 className="text-lg font-extrabold tracking-tight" style={{ color: '#edf5ef' }}>Session Report</h1>
        <p className="text-[0.8125rem] mt-0.5" style={{ color: '#8fa394' }}>
          {student.name}{student.grade ? ` · ${student.grade}` : ''}
          {student.report_depth === 'simple' ? ' · 📝 Simple' : ''}
        </p>
      </div>

      {/* Date */}
      <div className="card mb-4">
        <label className="label">Session Date</label>
        <input type="date" className="input" value={date} onChange={e => setDate(e.target.value)} max={new Date().toISOString().split('T')[0]} />
      </div>

      {/* Questions — all visible at once */}
      {questions.length > 0 && (
        <div className="space-y-3 mb-4">
          {questions.map(q => (
            <div key={q.id} className="card">
              <label className="label" style={{ color: '#8fa394' }}>{q.text}</label>
              {q.type === 'multiline' ? (
                <textarea
                  className="input"
                  rows={3}
                  placeholder="Write your thoughts…"
                  value={answers[q.id] || ''}
                  onChange={e => setAnswers(a => ({ ...a, [q.id]: e.target.value }))}
                />
              ) : (
                <input
                  className="input"
                  type="text"
                  placeholder="Type your answer…"
                  value={answers[q.id] || ''}
                  onChange={e => setAnswers(a => ({ ...a, [q.id]: e.target.value }))}
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Simple mode — just one big notes field */}
      {questions.length === 0 && student.report_depth === 'simple' && (
        <div className="card mb-4">
          <div className="mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded" style={{ background: '#1a261e', color: '#f59e0b' }}>
              📝 Simple Report
            </span>
          </div>
          <textarea
            className="input"
            rows={6}
            placeholder="Write your session notes here — how did it go, any problems, general observations…"
            value={answers[0] || ''}
            onChange={e => setAnswers({ 0: e.target.value })}
          />
        </div>
      )}

      {err && (
        <div className="text-sm mb-3 px-4 py-3 rounded-lg" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444' }}>
          {err}
        </div>
      )}

      <button onClick={submit} disabled={saving} className="btn-primary w-full justify-center">
        {saving ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            Submitting…
          </span>
        ) : 'Submit Report'}
      </button>
    </div>
  );
}
