'use client';
import Link from 'next/link';

const SMILEY_MAP: Record<string, { emoji: string; label: string; color: string }> = {
  '1': { emoji: '😢', label: 'Very bad', color: '#ef4444' },
  '2': { emoji: '😕', label: 'Not great', color: '#f59e0b' },
  '3': { emoji: '😐', label: 'Okay', color: '#d1d5db' },
  '4': { emoji: '🙂', label: 'Good', color: '#10B981' },
  '5': { emoji: '😄', label: 'Excellent', color: '#34d399' },
};

const BOOL_MAP: Record<string, { emoji: string; label: string; color: string }> = {
  'yes': { emoji: '✅', label: 'Yes', color: '#10B981' },
  'no': { emoji: '❌', label: 'No', color: '#ef4444' },
};

function AnswerDisplay({ type, answer }: { type: string; answer: string }) {
  if (type === 'rating') {
    const s = SMILEY_MAP[answer];
    if (!s) return <span style={{ color: '#9bb09e' }}>{answer}</span>;
    return (
      <div className="flex items-center gap-3">
        <span className="text-4xl">{s.emoji}</span>
        <div>
          <div className="text-sm font-semibold" style={{ color: s.color }}>{s.label}</div>
          <div className="flex gap-0.5 mt-1">
            {[1,2,3,4,5].map(n => (
              <div key={n} className="w-5 h-2 rounded-full" style={{ background: n <= Number(answer) ? s.color : '#1e3320' }} />
            ))}
          </div>
        </div>
      </div>
    );
  }
  if (type === 'boolean') {
    const b = BOOL_MAP[answer.toLowerCase()];
    if (!b) return <span style={{ color: '#9bb09e' }}>{answer}</span>;
    return (
      <span className="flex items-center gap-2 text-sm font-semibold" style={{ color: b.color }}>
        <span className="text-2xl">{b.emoji}</span> {b.label}
      </span>
    );
  }
  return <p className="text-sm leading-relaxed" style={{ color: '#f0f7f0' }}>{answer || '—'}</p>;
}

function fmtDate(str: string) {
  return new Date(str + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

function avgRating(answers: any[]) {
  const ratings = answers.filter(a => a.type === 'rating').map(a => Number(a.answer)).filter(n => !isNaN(n));
  if (!ratings.length) return null;
  return (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1);
}

function overallMood(avg: string | null) {
  if (!avg) return null;
  const n = parseFloat(avg);
  if (n >= 4.5) return { emoji: '😄', label: 'Excellent session', color: '#34d399' };
  if (n >= 3.5) return { emoji: '🙂', label: 'Good session', color: '#10B981' };
  if (n >= 2.5) return { emoji: '😐', label: 'Average session', color: '#d1d5db' };
  if (n >= 1.5) return { emoji: '😕', label: 'Challenging session', color: '#f59e0b' };
  return { emoji: '😢', label: 'Difficult session', color: '#ef4444' };
}

// Group answers by category
function groupByCategory(answers: any[]) {
  const groups: Record<string, any[]> = {};
  for (const a of answers) {
    if (!groups[a.category]) groups[a.category] = [];
    groups[a.category].push(a);
  }
  return groups;
}

export default function ReportView({ report, answers, role }: { report: any; answers: any[]; role: string }) {
  const avg = avgRating(answers);
  const mood = overallMood(avg);
  const groups = groupByCategory(answers);

  return (
    <div style={{ background: '#080c09', minHeight: '100vh', padding: '3.5rem 1rem 2rem' }}>
      <div className="max-w-2xl mx-auto">
        {/* Nav */}
        <div className="flex items-center justify-between mb-6 gap-2 print:hidden">
          <Link href={role === 'admin' ? '/admin/reports' : role === 'parent' ? '/parent' : '/teacher'} className="text-sm flex items-center gap-1" style={{ color: '#4a6a4e' }}>
            ← Back
          </Link>
          <button onClick={() => window.print()} className="btn-secondary text-sm">
            🖨️ Print / Save PDF
          </button>
        </div>

        {/* Report card */}
        <div style={{
          background: '#121f13',
          border: '1px solid #2d4a30',
          borderRadius: '16px',
          overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{ background: 'linear-gradient(135deg, #0b130c, #1e3320)', padding: '1.25rem', borderBottom: '1px solid #2d4a30' }} className="sm:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-start justify-between gap-3 sm:gap-4">
              <div>
                {/* PTB Brand */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#10B981' }}>
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs font-bold tracking-widest uppercase" style={{ color: '#10B981' }}>Private Tutoring Bali</div>
                    <div className="text-xs" style={{ color: '#4a6a4e' }}>Session Report</div>
                  </div>
                </div>

                <h1 className="text-xl sm:text-2xl font-bold" style={{ color: '#f0f7f0' }}>{report.student_name}</h1>
                <div className="flex gap-4 mt-1 flex-wrap">
                  {report.student_age && <span className="text-sm" style={{ color: '#9bb09e' }}>Age {report.student_age}</span>}
                  {report.student_grade && <span className="text-sm" style={{ color: '#9bb09e' }}>· {report.student_grade}</span>}
                </div>
                <div className="mt-3 space-y-0.5">
                  <p className="text-sm" style={{ color: '#9bb09e' }}>
                    <span style={{ color: '#4a6a4e' }}>Date:</span> {fmtDate(report.session_date)}
                  </p>
                  <p className="text-sm" style={{ color: '#9bb09e' }}>
                    <span style={{ color: '#4a6a4e' }}>Tutor:</span> {report.teacher_name}
                  </p>
                </div>
              </div>

              {/* Overall mood */}
              {mood && (
                <div className="text-center flex-shrink-0">
                  <div className="text-5xl mb-1">{mood.emoji}</div>
                  <div className="text-xs font-semibold" style={{ color: mood.color }}>{mood.label}</div>
                  {avg && <div className="text-xs mt-0.5" style={{ color: '#4a6a4e' }}>avg {avg}/5</div>}
                </div>
              )}
            </div>
          </div>

          {/* Body */}
          <div style={{ padding: '1rem 1.25rem' }} className="sm:px-8 sm:py-6">
            {/* Answers by category */}
            {Object.entries(groups).map(([category, catAnswers]) => (
              <div key={category} className="mb-6">
                <h3 className="text-xs font-bold uppercase tracking-widest mb-3 pb-2" style={{ color: '#10B981', borderBottom: '1px solid #1e3320' }}>
                  {category}
                </h3>
                <div className="space-y-4">
                  {catAnswers.map((a, i) => (
                    <div key={i}>
                      <p className="text-xs font-semibold mb-2" style={{ color: '#9bb09e' }}>{a.question}</p>
                      <AnswerDisplay type={a.type} answer={a.answer} />
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Overall notes */}
            {report.overall_notes && (
              <div className="mb-4">
                <h3 className="text-xs font-bold uppercase tracking-widest mb-3 pb-2" style={{ color: '#10B981', borderBottom: '1px solid #1e3320' }}>
                  Tutor Notes
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: '#f0f7f0' }}>{report.overall_notes}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid #1e3320', background: '#0b130c' }} className="sm:px-8">
            <div className="flex items-center justify-between">
              <p className="text-xs" style={{ color: '#4a6a4e' }}>privatetutoringbali.com · +62 858-6969-6869</p>
              <p className="text-xs" style={{ color: '#4a6a4e' }}>Report #{report.id}</p>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body { background: white !important; }
          .print\\:hidden { display: none !important; }
          * { color: #111 !important; border-color: #ccc !important; }
          div[style*="background: #121f13"],
          div[style*="background: linear-gradient"],
          div[style*="background: #0b130c"] {
            background: white !important;
          }
        }
      `}</style>
    </div>
  );
}