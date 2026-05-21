-- PTB Session Tracker — PostgreSQL Schema (Neon)
-- ================================================
-- STEP 1: Go to neon.tech → your project → SQL Editor
-- STEP 2: Paste this entire file and click Run
-- STEP 3: Then run: npm run seed

-- Users (admin, teacher, parent)
CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  name          TEXT NOT NULL,
  username      TEXT NOT NULL UNIQUE,
  email         TEXT,
  password_hash TEXT,
  role          TEXT NOT NULL CHECK(role IN ('admin', 'teacher', 'parent')),
  avatar_url    TEXT,
  invite_token  TEXT UNIQUE,
  invite_sent   BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Students / Children
CREATE TABLE IF NOT EXISTS students (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  age         INTEGER,
  grade       TEXT,
  subject     TEXT,
  notes       TEXT,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Teacher ↔ Student assignments
CREATE TABLE IF NOT EXISTS assignments (
  id                SERIAL PRIMARY KEY,
  teacher_id        INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  student_id        INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  subject           TEXT,
  sessions_per_week INTEGER NOT NULL DEFAULT 1,
  active            BOOLEAN NOT NULL DEFAULT TRUE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(teacher_id, student_id)
);

-- Parent ↔ Student links
CREATE TABLE IF NOT EXISTS parent_students (
  parent_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  student_id  INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  PRIMARY KEY (parent_id, student_id)
);

-- Report questions
CREATE TABLE IF NOT EXISTS questions (
  id          SERIAL PRIMARY KEY,
  text        TEXT NOT NULL,
  type        TEXT NOT NULL CHECK(type IN ('rating', 'boolean', 'text', 'multiline')),
  category    TEXT NOT NULL DEFAULT 'General',
  sort_order  INTEGER NOT NULL DEFAULT 0,
  active      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Session reports
CREATE TABLE IF NOT EXISTS reports (
  id              SERIAL PRIMARY KEY,
  student_id      INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  teacher_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_date    DATE NOT NULL,
  week_start      DATE NOT NULL,
  topic           TEXT,
  overall_notes   TEXT,
  status          TEXT NOT NULL DEFAULT 'submitted' CHECK(status IN ('submitted', 'approved')),
  approved_at     TIMESTAMPTZ,
  approved_by     INTEGER REFERENCES users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Report answers
CREATE TABLE IF NOT EXISTS report_answers (
  id          SERIAL PRIMARY KEY,
  report_id   INTEGER NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  answer      TEXT NOT NULL
);

-- System settings (SMTP config, etc.) — stored in DB so admin can edit via UI
CREATE TABLE IF NOT EXISTS settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- Insert SMTP defaults (admin edits these in Settings page)
INSERT INTO settings (key, value) VALUES
  ('smtp_host',     'smtp.gmail.com'),
  ('smtp_port',     '587'),
  ('smtp_user',     ''),
  ('smtp_pass',     ''),
  ('smtp_from',     'PTB Tracker <noreply@privatetutoringbali.com>'),
  ('app_url',       'https://your-app.vercel.app'),
  ('app_name',      'Private Tutoring Bali')
ON CONFLICT (key) DO NOTHING;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_reports_teacher   ON reports(teacher_id);
CREATE INDEX IF NOT EXISTS idx_reports_student   ON reports(student_id);
CREATE INDEX IF NOT EXISTS idx_reports_week      ON reports(week_start);
CREATE INDEX IF NOT EXISTS idx_reports_status    ON reports(status);
CREATE INDEX IF NOT EXISTS idx_assignments_teacher ON assignments(teacher_id);
CREATE INDEX IF NOT EXISTS idx_assignments_student ON assignments(student_id);
