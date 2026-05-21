/**
 * Demo data — realistic hardcoded data for the full app demo.
 * Used when no database is configured.
 */

export const DEMO_USERS = {
  admin: { id: 1, name: 'Dede (Admin)', username: 'admin', email: 'admin@privatetutoringbali.com', role: 'admin', created_at: '2026-01-15T10:00:00Z' },
  teacher1: { id: 2, name: 'Sarah Johnson', username: 'sarah', email: 'sarah@ptb.com', role: 'teacher', created_at: '2026-02-01T08:00:00Z' },
  teacher2: { id: 3, name: 'Made Arka', username: 'made', email: 'made@ptb.com', role: 'teacher', created_at: '2026-02-15T09:00:00Z' },
  parent1: { id: 4, name: 'Maria van der Berg', username: 'maria', email: 'maria@example.com', role: 'parent', created_at: '2026-03-01T11:00:00Z' },
  parent2: { id: 5, name: 'Ketut Wirawan', username: 'ketut', email: 'ketut@example.com', role: 'parent', created_at: '2026-03-10T14:00:00Z' },
};

export const DEMO_STUDENTS = [
  { id: 1, name: 'Luca van der Berg', age: 8, grade: 'Year 3', subject: 'English & Math', report_depth: 'standard', notes: 'Loves science, shy around new people', avatar_url: null, created_at: '2026-02-01T08:00:00Z' },
  { id: 2, name: 'Putu Darma', age: 10, grade: 'Year 5', subject: 'Math', report_depth: 'standard', notes: 'Quick learner, needs help with fractions', avatar_url: null, created_at: '2026-02-01T08:00:00Z' },
  { id: 3, name: 'Anika Dewi', age: 12, grade: 'Year 7', subject: 'English', report_depth: 'standard', notes: 'Preparing for IGCSE, very motivated', avatar_url: null, created_at: '2026-02-15T09:00:00Z' },
  { id: 4, name: 'Kadek Raka', age: 6, grade: 'Year 1', subject: 'English & Math', report_depth: 'simple', notes: 'Energetic, needs short sessions', avatar_url: null, created_at: '2026-03-01T11:00:00Z' },
  { id: 5, name: 'Komang Sari', age: 9, grade: 'Year 4', subject: 'Math & Science', report_depth: 'standard', notes: 'Excellent focus, top of class', avatar_url: null, created_at: '2026-03-10T14:00:00Z' },
];

export const DEMO_ASSIGNMENTS = [
  { teacher_id: 2, student_id: 1, subject: 'English', sessions_per_week: 2, active: 1 },
  { teacher_id: 2, student_id: 2, subject: 'Math', sessions_per_week: 3, active: 1 },
  { teacher_id: 2, student_id: 4, subject: 'English & Math', sessions_per_week: 1, active: 1 },
  { teacher_id: 3, student_id: 3, subject: 'English', sessions_per_week: 2, active: 1 },
  { teacher_id: 3, student_id: 5, subject: 'Math & Science', sessions_per_week: 2, active: 1 },
];

export const DEMO_PARENT_STUDENTS = [
  { parent_id: 4, student_id: 1 },
  { parent_id: 4, student_id: 4 },
  { parent_id: 5, student_id: 2 },
  { parent_id: 5, student_id: 5 },
];

export const DEMO_QUESTIONS = [
  { id: 1, text: 'How was your time with the student?', type: 'text', category: 'Session', sort_order: 1, active: 1 },
  { id: 2, text: 'How did it go today?', type: 'text', category: 'Session', sort_order: 2, active: 1 },
  { id: 3, text: 'Did you have any problems or challenges?', type: 'text', category: 'Session', sort_order: 3, active: 1 },
  { id: 4, text: 'What do you think about the overall progress?', type: 'multiline', category: 'Progress', sort_order: 4, active: 1 },
];

// Generate reports for the past 2 weeks
const week1Start = '2026-05-04';
const week2Start = '2026-05-11';

export const DEMO_REPORTS = [
  // Luca — 2 sessions/week
  { id: 1, student_id: 1, teacher_id: 2, session_date: '2026-05-05', week_start: week1Start, topic: 'Reading comprehension', overall_notes: 'Luca did great today. Finished chapter 4 and answered all follow-up questions correctly.', status: 'approved', approved_at: '2026-05-06T10:00:00Z', approved_by: 1, created_at: '2026-05-05T15:30:00Z' },
  { id: 2, student_id: 1, teacher_id: 2, session_date: '2026-05-07', week_start: week1Start, topic: 'Multiplication tables', overall_notes: 'Still struggling with 7x and 8x tables. Used flashcards — improving slowly.', status: 'approved', approved_at: '2026-05-08T09:00:00Z', approved_by: 1, created_at: '2026-05-07T14:00:00Z' },
  { id: 3, student_id: 1, teacher_id: 2, session_date: '2026-05-12', week_start: week2Start, topic: 'Fractions introduction', overall_notes: 'First session on fractions. Used pizza slices as visual aid — Luca picked it up quickly!', status: 'submitted', approved_at: null, approved_by: null, created_at: '2026-05-12T16:00:00Z' },
  // Putu — 3 sessions/week
  { id: 4, student_id: 2, teacher_id: 2, session_date: '2026-05-05', week_start: week1Start, topic: 'Long division', overall_notes: 'Good focus today. Completed 10 problems with 80% accuracy.', status: 'approved', approved_at: '2026-05-06T10:00:00Z', approved_by: 1, created_at: '2026-05-05T10:00:00Z' },
  { id: 5, student_id: 2, teacher_id: 2, session_date: '2026-05-06', week_start: week1Start, topic: 'Geometry basics', overall_notes: 'Introduced triangles and angles. Used interactive drawing app.', status: 'approved', approved_at: '2026-05-07T09:00:00Z', approved_by: 1, created_at: '2026-05-06T10:30:00Z' },
  { id: 6, student_id: 2, teacher_id: 2, session_date: '2026-05-08', week_start: week1Start, topic: 'Word problems', overall_notes: 'Practiced translating word problems to equations. Good progress.', status: 'submitted', approved_at: null, approved_by: null, created_at: '2026-05-08T11:00:00Z' },
  // Anika — 2 sessions/week
  { id: 7, student_id: 3, teacher_id: 3, session_date: '2026-05-06', week_start: week1Start, topic: 'Essay writing structure', overall_notes: 'Anika wrote a brilliant 5-paragraph essay about Bali tourism. Grammar needs minor work.', status: 'approved', approved_at: '2026-05-07T09:00:00Z', approved_by: 1, created_at: '2026-05-06T13:00:00Z' },
  { id: 8, student_id: 3, teacher_id: 3, session_date: '2026-05-13', week_start: week2Start, topic: 'Vocabulary building', overall_notes: 'Covered 20 new academic words. Anika used each in a sentence correctly.', status: 'submitted', approved_at: null, approved_by: null, created_at: '2026-05-13T14:00:00Z' },
  // Kadek — 1 session/week
  { id: 9, student_id: 4, teacher_id: 2, session_date: '2026-05-09', week_start: week1Start, topic: 'Alphabet and phonics', overall_notes: 'Kadek knows all letters now. Working on blending sounds — getting there!', status: 'approved', approved_at: '2026-05-10T09:00:00Z', approved_by: 1, created_at: '2026-05-09T09:00:00Z' },
  // Komang — 2 sessions/week
  { id: 10, student_id: 5, teacher_id: 3, session_date: '2026-05-07', week_start: week1Start, topic: 'Chemical reactions', overall_notes: 'Did a safe vinegar+baking soda experiment. Komang was fascinated!', status: 'approved', approved_at: '2026-05-08T09:00:00Z', approved_by: 1, created_at: '2026-05-07T15:00:00Z' },
  { id: 11, student_id: 5, teacher_id: 3, session_date: '2026-05-14', week_start: week2Start, topic: 'Algebra basics', overall_notes: 'Started solving for x. Used balance scale analogy — very effective.', status: 'submitted', approved_at: null, approved_by: null, created_at: '2026-05-14T16:00:00Z' },
];

export const DEMO_REPORT_ANSWERS: Record<number, { question_id: number; answer: string }[]> = {
  1: [
    { question_id: 1, answer: 'Great time with Luca today. He was focused and eager to learn.' },
    { question_id: 2, answer: 'Reading comprehension went very well. He finished chapter 4 and understood all the key themes.' },
    { question_id: 3, answer: 'No major problems. He got a bit distracted halfway through but we took a short break and he refocused.' },
    { question_id: 4, answer: 'Luca is making steady progress. His reading speed has improved noticeably since last month. I think he will be ready for chapter books soon.' },
  ],
  2: [
    { question_id: 1, answer: 'Today was a bit challenging. Luca seemed tired.' },
    { question_id: 2, answer: 'We worked on multiplication tables. He struggled with 7x and 8x especially.' },
    { question_id: 3, answer: 'Yes — he was frustrated with the harder multiplication facts. I switched to flashcards which helped a bit.' },
    { question_id: 4, answer: 'He needs more practice on multiplication. I recommend daily 5-minute drills at home. Overall he is improving but slowly on this topic.' },
  ],
  3: [
    { question_id: 1, answer: 'Wonderful session today! Fractions finally clicked for Luca.' },
    { question_id: 2, answer: 'We introduced fractions using a pizza visual. He understood halves, quarters, and eighths immediately.' },
    { question_id: 3, answer: 'No problems at all. This was one of our smoothest sessions.' },
    { question_id: 4, answer: 'Excellent progress. Moving to equivalent fractions next session. Luca is right on track.' },
  ],
};

const defaultAnswers = [
  { question_id: 1, answer: 'Good session with the student today.' },
  { question_id: 2, answer: 'It went well. Covered the planned material.' },
  { question_id: 3, answer: 'No significant problems.' },
  { question_id: 4, answer: 'The student is making steady progress overall.' },
];

export function getDemoAnswers(reportId: number) {
  return DEMO_REPORT_ANSWERS[reportId] || defaultAnswers;
}

export const DEMO_SETTINGS: Record<string, string> = {
  smtp_host: 'smtp.gmail.com',
  smtp_port: '587',
  smtp_user: '',
  smtp_pass: '',
  smtp_from: 'PTB Tracker <noreply@privatetutoringbali.com>',
  app_url: 'http://localhost:3000',
  app_name: 'Private Tutoring Bali',
};
