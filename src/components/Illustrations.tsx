/**
 * Reusable SVG illustrations for the app.
 * Simple, clean line-art style in the PTB brand colors.
 */

export function EmptyStateStudents() {
  return (
    <svg className="w-20 h-20 mx-auto mb-4 opacity-40" viewBox="0 0 80 80" fill="none">
      <circle cx="40" cy="40" r="38" stroke="#10B981" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.5"/>
      <circle cx="30" cy="32" r="10" stroke="#10B981" strokeWidth="1.5" fill="none"/>
      <circle cx="50" cy="34" r="8" stroke="#10B981" strokeWidth="1.5" fill="none"/>
      <path d="M18 60c0-8 7-12 12-12h4c2 0 3 1 3 3v2c0 2-1 3-3 3h-4c-4 0-8-2-12 4z" stroke="#10B981" strokeWidth="1.5" fill="none"/>
      <path d="M38 56c0-6 5-10 10-10h4c1 0 2 1 2 2v1c0 1-1 2-2 2h-4c-3 0-6 2-10 5z" stroke="#10B981" strokeWidth="1.5" fill="none"/>
      <circle cx="55" cy="28" r="2" fill="#10B981" opacity="0.5"/>
      <circle cx="25" cy="38" r="1.5" fill="#10B981" opacity="0.3"/>
      <circle cx="62" cy="45" r="1" fill="#10B981" opacity="0.3"/>
    </svg>
  );
}

export function EmptyStateReports() {
  return (
    <svg className="w-20 h-20 mx-auto mb-4 opacity-40" viewBox="0 0 80 80" fill="none">
      <rect x="18" y="12" width="44" height="56" rx="4" stroke="#f59e0b" strokeWidth="1.5" fill="none"/>
      <line x1="28" y1="24" x2="52" y2="24" stroke="#f59e0b" strokeWidth="1.2" opacity="0.5"/>
      <line x1="28" y1="32" x2="48" y2="32" stroke="#f59e0b" strokeWidth="1.2" opacity="0.4"/>
      <line x1="28" y1="40" x2="52" y2="40" stroke="#f59e0b" strokeWidth="1.2" opacity="0.3"/>
      <line x1="28" y1="48" x2="42" y2="48" stroke="#f59e0b" strokeWidth="1.2" opacity="0.2"/>
      <line x1="28" y1="56" x2="50" y2="56" stroke="#f59e0b" strokeWidth="1.2" opacity="0.15"/>
      <circle cx="60" cy="52" r="8" stroke="#10B981" strokeWidth="1.5" fill="none"/>
      <path d="M57 52l2 3 5-5" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function EmptyStateTeachers() {
  return (
    <svg className="w-20 h-20 mx-auto mb-4 opacity-40" viewBox="0 0 80 80" fill="none">
      <circle cx="40" cy="28" r="12" stroke="#3b82f6" strokeWidth="1.5" fill="none"/>
      <path d="M20 62c0-7 4-14 12-14h16c8 0 12 7 12 14v3c0 2-1 3-3 3H23c-2 0-3-1-3-3v-3z" stroke="#3b82f6" strokeWidth="1.5" fill="none"/>
      <rect x="30" y="14" width="20" height="6" rx="3" stroke="#3b82f6" strokeWidth="1.5" fill="none"/>
      <line x1="33" y1="17" x2="47" y2="17" stroke="#3b82f6" strokeWidth="1" opacity="0.5"/>
      <circle cx="28" cy="40" r="2" fill="#3b82f6" opacity="0.3"/>
      <circle cx="52" cy="38" r="1.5" fill="#3b82f6" opacity="0.3"/>
    </svg>
  );
}

export function EmptyStateQuestions() {
  return (
    <svg className="w-20 h-20 mx-auto mb-4 opacity-40" viewBox="0 0 80 80" fill="none">
      <circle cx="40" cy="38" r="16" stroke="#8b5cf6" strokeWidth="1.5" fill="none"/>
      <text x="40" y="43" textAnchor="middle" fill="#8b5cf6" fontSize="18" fontWeight="bold" opacity="0.6">?</text>
      <circle cx="24" cy="24" r="4" stroke="#8b5cf6" strokeWidth="1" fill="none" opacity="0.4"/>
      <circle cx="56" cy="56" r="3" stroke="#8b5cf6" strokeWidth="1" fill="none" opacity="0.3"/>
      <circle cx="58" cy="22" r="2" stroke="#8b5cf6" strokeWidth="0.8" fill="none" opacity="0.2"/>
    </svg>
  );
}

export function DashboardIllustration() {
  return (
    <svg className="w-32 h-32 mx-auto mb-6 opacity-50" viewBox="0 0 120 120" fill="none">
      {/* Book */}
      <path d="M35 30v55l25-12 25 12V30L60 18 35 30z" stroke="#10B981" strokeWidth="2" fill="none" strokeLinejoin="round"/>
      <line x1="60" y1="21" x2="60" y2="73" stroke="#10B981" strokeWidth="1.5" opacity="0.5"/>
      {/* Stars */}
      <circle cx="22" cy="22" r="3" stroke="#f59e0b" strokeWidth="1" fill="none" opacity="0.6"/>
      <circle cx="98" cy="18" r="2" stroke="#f59e0b" strokeWidth="1" fill="none" opacity="0.4"/>
      <circle cx="16" cy="50" r="2" stroke="#8b5cf6" strokeWidth="1" fill="none" opacity="0.4"/>
      <circle cx="104" cy="55" r="2.5" stroke="#3b82f6" strokeWidth="1" fill="none" opacity="0.4"/>
      {/* Check mark */}
      <path d="M88 85l6 6 12-14" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.7"/>
      {/* Graph line */}
      <polyline points="12,90 30,75 48,80 66,55 84,60 102,45" stroke="#3b82f6" strokeWidth="1.5" fill="none" opacity="0.4"/>
    </svg>
  );
}

export function ReportCompleteBadge() {
  return (
    <svg className="w-5 h-5 inline-block" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="9" stroke="#10B981" strokeWidth="1.5" fill="rgba(16,185,129,0.1)"/>
      <path d="M6 10l3 3 5-6" stroke="#10B981" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function SectionIcon({ type }: { type: 'students' | 'teachers' | 'reports' | 'questions' | 'settings' }) {
  const icons: Record<string, JSX.Element> = {
    students: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 4-7 8-7s8 3 8 7"/>
      </svg>
    ),
    teachers: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 4a4 4 0 100 8 4 4 0 000-8z"/><path d="M4 20c0-4 4-7 8-7s8 3 8 7v1H4v-1z"/><circle cx="18" cy="5" r="2"/><circle cx="6" cy="5" r="2"/>
      </svg>
    ),
    reports: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
    ),
    questions: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    ),
    settings: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
      </svg>
    ),
  };
  return icons[type] || null;
}
