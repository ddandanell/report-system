// Run with: node scripts/seed.js
const path = require('path');
const fs = require('fs');

// Ensure data dir exists
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');

const db = new Database(path.join(dataDir, 'ptb.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Create schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('admin', 'teacher')),
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    age INTEGER,
    grade TEXT,
    sessions_per_week INTEGER NOT NULL DEFAULT 1,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS teacher_students (
    teacher_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    PRIMARY KEY (teacher_id, student_id)
  );
  CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('rating', 'boolean', 'text', 'multiline')),
    category TEXT NOT NULL DEFAULT 'General',
    sort_order INTEGER NOT NULL DEFAULT 0,
    active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    teacher_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_date TEXT NOT NULL,
    week_start TEXT NOT NULL,
    overall_notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS report_answers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    report_id INTEGER NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    answer TEXT NOT NULL
  );
`);

// Admin user
const existing = db.prepare("SELECT id FROM users WHERE username = 'admin'").get();
if (!existing) {
  const hash = bcrypt.hashSync('ptb2024admin', 10);
  db.prepare("INSERT INTO users (name, username, password_hash, role) VALUES (?, ?, ?, 'admin')")
    .run('Admin', 'admin', hash);
  console.log('✅ Admin user created: username=admin, password=ptb2024admin');
} else {
  console.log('ℹ️  Admin user already exists');
}

// Default questions
const qCount = db.prepare('SELECT COUNT(*) as c FROM questions').get().c;
if (qCount === 0) {
  const insert = db.prepare('INSERT INTO questions (text, type, category, sort_order, active) VALUES (?, ?, ?, ?, 1)');
  const questions = [
    ['Did the student get enough sleep last night?',    'boolean',   'Wellbeing', 1],
    ['How was the student\'s energy level today?',      'rating',    'Wellbeing', 2],
    ['How was the student\'s mood during the session?', 'rating',    'Wellbeing', 3],
    ['How was the student\'s focus and attention?',     'rating',    'Learning',  4],
    ['Did the student complete the planned tasks?',     'boolean',   'Learning',  5],
    ['How motivated was the student today?',            'rating',    'Learning',  6],
    ['How was the student\'s behaviour?',               'rating',    'Behaviour', 7],
    ['Did the student engage well with the material?',  'rating',    'Behaviour', 8],
    ['Any specific observations or concerns?',          'multiline', 'Notes',     9],
  ];
  for (const [text, type, category, sort_order] of questions) {
    insert.run(text, type, category, sort_order);
  }
  console.log('✅ Default questions created (9 questions)');
} else {
  console.log(`ℹ️  Questions already exist (${qCount} found)`);
}

db.close();
console.log('\n🎉 Seed complete! Run: npm run dev\n');
console.log('   Login at: http://localhost:3000');
console.log('   Username: admin');
console.log('   Password: ptb2024admin\n');
