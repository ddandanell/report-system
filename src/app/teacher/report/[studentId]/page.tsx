'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface Question { id: number; text: string; type: string; category: string; }
interface Student { id: number; name: string; age?: number; grade?: string; sessions_per_week: number; }

const SMILEYS = [
  { value: '1', emoji: '😢', label: 'Very bad' },
  { value: '2', emoji: '😕', label: 'Not great' },
  { value: '3', emoji: '😐', label: 'Okay' },
  { value: '4', emoji: '🙂', label: 'Good' },
  { value: '5', emoji: '😄', label: 'Excellent' },
];

function RatingInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {SMILEYS.map(s => (
        <button
          key={s.value}
          type="button"
          onClick={() => onChange(s.value)}
          className="flex flex-col items-center gap-1 p-2 sm:p-3 rounded-xl transition-all flex-1 min-w-[52px]"
          style={{
            background: value === s.value ? 'rgba(16,185,129,0.15)' : '#1e3320',
            border: `2px solid ${value === s.value ? '#10B981' : '#2d4a30'}`,
            transform: value === s.value ? 'scale(1.05)' : 'scale(1)',
          }}
        >
          <span className="text-2xl sm:text-3xl">{s.emoji}</span>
          <span className="text-[10px] sm:text-xs leading-tight" style={{ color: value === s.value ? '#10B981' : '#4a6a4e' }}>{s.label}</span>
        </button>
      ))}
    </div>
  );
}

function BooleanInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex gap-2 sm:gap-3">
      {[{ v: 'yes', e: '👍', l: 'Yes' }, { v: 'no', e: '👎', l: 'No' }].map(opt => (
        <button
          key={opt.v}
          type="button"
          onClick={() => onChange(opt.v)}
          className="flex items-center gap-3 px-6 py-3 rounded-xl transition-all flex-1 justify-center"
          style={{
            background: value === opt.v ? 'rgba(16,185,129,0.15)' : '#1e3320',
            border: `2px solid ${value === opt.v ? '#10B981' : '#2d4a30'}`,
          }}
        >
          <span className="text-2xl">{opt.e}</span>
          <span className="font-semibold" style={{ color: value === opt.v ? '#10B981' : '#9bb09e' }}>{opt.l}</span>
        </button>
      ))}
    </div>
  );
}

export default function ReportFormPage() {
  const { studentId } = useParams();
  const router = useRouter();
  const [student, setStudent] = useState<Student | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const [step, setStep] = useState(0); // current question index for mobile-friendly flow

  useEffect(() => {
    Promise.all([
      fetch('/api/teacher/students').then(r => r.json()),
      fetch('/api/questions/active').then(r => r.json()),
    ]).then(([s, q]) => {
      const stu = (s.students || []).find((x: Student) => x.id === Number(studentId));
      if (!stu) { router.replace('/teacher'); return; }
      setStudent(stu);
      setQuestions(q.questions || []);
    });
  }, [studentId]);

  function setAnswer(qId: number, val: string) {
    setAnswers(a => ({ ...a, [qId]: val }));
  }

  const totalSteps = questions.length + 1; // +1 for the final notes/submit step
  const progress = questions.length > 0 ? Math.round(((step) / totalSteps) * 100) : 0;
  const currentQ = questions[step];
  const onFinalStep = step === questions.length;

  function canAdvance() {
    if (onFinalStep) return true;
    if (!currentQ) return false;
    if (currentQ.type === 'text' || currentQ.type === 'multiline') return true; // text is optional
    return !!answers[currentQ.id];
  }

  async function submit() {
    setErr('');
    // Check all required questions answered
    const missing = questions.filter(q => q.type !== 'text' && q.type !== 'multiline' && !answers[q.id]);
    if (missing.length) {
      setErr(`Please answer all questions. Missing: ${missing.map(q => `"${q.text}"`).join(', ')}`);
      return;
    }
    setSaving(true);
    const res = await fetch('/api/teacher/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_id: Number(studentId), session_date: date, answers, overall_notes: notes }),
    });
    if (!res.ok) { const d = await res.json(); setErr(d.error || 'Error saving report'); setSaving(false); return; }
    const { report } = await res.json();
    router.replace(`/report/${report.id}`);
  }

  if (!student || questions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center" style={{ color: '#4a6a4e' }}>
          <div className="text-4xl mb-3">⏳</div>
          <p>Loading report form…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button onClick={() => router.back()} className="text-sm mb-3 flex items-center gap-1" style={{ color: '#4a6a4e' }}>
          ← Back
        </button>
        <h1 className="text-xl font-bold" style={{ color: '#f0f7f0' }}>Session Report</h1>
        <p className="text-sm mt-0.5" style={{ color: '#9bb09e' }}>{student.name}{student.grade ? ` · ${student.grade}` : ''}</p>
      </div>

      {/* Date selector */}
      <div className="card mb-5">
        <label className="label">Session Date</label>
        <input type="date" className="input" value={date} onChange={e => setDate(e.target.value)} max={new Date().toISOString().split('T')[0]} />
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-xs mb-2" style={{ color: '#4a6a4e' }}>
          <span>Question {Math.min(step + 1, questions.length)} of {questions.length}</span>
          <span>{progress}% complete</span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#1e3320' }}>
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #10B981, #34d399)' }} />
        </div>
      </div>

      {/* Question card */}
      {!onFinalStep && currentQ && (
        <div className="card mb-4">
          <div className="mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded" style={{ background: '#1e3320', color: '#10B981' }}>
              {currentQ.category}
            </span>
          </div>
          <h2 className="text-lg font-semibold mt-3 mb-5" style={{ color: '#f0f7f0' }}>{currentQ.text}</h2>

          {currentQ.type === 'rating' && (
            <RatingInput value={answers[currentQ.id] || ''} onChange={v => setAnswer(currentQ.id, v)} />
          )}
          {currentQ.type === 'boolean' && (
            <BooleanInput value={answers[currentQ.id] || ''} onChange={v => setAnswer(currentQ.id, v)} />
          )}
          {currentQ.type === 'text' && (
            <input
              className="input"
              placeholder="Type your answer… (optional)"
              value={answers[currentQ.id] || ''}
              onChange={e => setAnswer(currentQ.id, e.target.value)}
            />
          )}
          {currentQ.type === 'multiline' && (
            <textarea
              className="input"
              rows={3}
              placeholder="Type your notes… (optional)"
              value={answers[currentQ.id] || ''}
              onChange={e => setAnswer(currentQ.id, e.target.value)}
            />
          )}
        </div>
      )}

      {/* Final step — overall notes */}
      {onFinalStep && (
        <div className="card mb-4">
          <h2 className="text-lg font-semibold mb-2" style={{ color: '#f0f7f0' }}>📝 Overall Notes</h2>
          <p className="text-sm mb-4" style={{ color: '#9bb09e' }}>Add any additional observations about today's session (optional).</p>
          <textarea
            className="input"
            rows={4}
            placeholder="e.g. Great focus today, worked through chapter 5, still struggles with fractions…"
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />
          {err && <p className="text-red-400 text-sm mt-3 bg-red-900/20 border border-red-500/20 rounded-lg px-3 py-2">{err}</p>}
        </div>
      )}

      {/* Navigation buttons */}
      <div className="flex gap-3">
        {step > 0 && (
          <button onClick={() => setStep(s => s - 1)} className="btn-secondary flex-1">← Back</button>
        )}
        {!onFinalStep && (
          <button
            onClick={() => setStep(s => s + 1)}
            disabled={!canAdvance()}
            className="btn-primary flex-1"
            style={{ opacity: canAdvance() ? 1 : 0.4 }}
          >
            Next →
          </button>
        )}
        {onFinalStep && (
          <button onClick={submit} disabled={saving} className="btn-primary flex-1 justify-center">
            {saving ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Submitting…
              </span>
            ) : '✅ Submit Report'}
          </button>
        )}
      </div>

      {/* Quick overview (dots) */}
      <div className="flex gap-1.5 justify-center mt-6">
        {questions.map((q, i) => (
          <button
            key={q.id}
            onClick={() => setStep(i)}
            className="w-2 h-2 rounded-full transition-all"
            style={{
              background: i < step ? '#10B981' : i === step ? '#34d399' : '#2d4a30',
              transform: i === step ? 'scale(1.4)' : 'scale(1)',
            }}
          />
        ))}
        <button
          onClick={() => setStep(questions.length)}
          className="w-2 h-2 rounded-full transition-all"
          style={{ background: onFinalStep ? '#34d399' : '#2d4a30', transform: onFinalStep ? 'scale(1.4)' : 'scale(1)' }}
        />
      </div>
    </div>
  );
}