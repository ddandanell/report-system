/**
 * SQLite adapter that matches the Neon @neondatabase/serverless `sql` tagged-template API.
 * Auto-creates the database and tables. Translates common PostgreSQL patterns.
 */
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DATA_DIR, 'ptb.db');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ── Schema ──
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL, username TEXT NOT NULL UNIQUE, email TEXT,
    password_hash TEXT, role TEXT NOT NULL CHECK(role IN ('admin','teacher','parent')),
    avatar_url TEXT, invite_token TEXT UNIQUE, invite_sent INTEGER DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL, age INTEGER, grade TEXT, subject TEXT, notes TEXT, avatar_url TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS assignments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    teacher_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    subject TEXT, sessions_per_week INTEGER NOT NULL DEFAULT 1,
    active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(teacher_id, student_id)
  );
  CREATE TABLE IF NOT EXISTS parent_students (
    parent_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    PRIMARY KEY (parent_id, student_id)
  );
  CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT NOT NULL, type TEXT NOT NULL CHECK(type IN ('rating','boolean','text','multiline')),
    category TEXT NOT NULL DEFAULT 'General', sort_order INTEGER NOT NULL DEFAULT 0,
    active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    teacher_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_date TEXT NOT NULL, week_start TEXT NOT NULL,
    topic TEXT, overall_notes TEXT,
    status TEXT NOT NULL DEFAULT 'submitted' CHECK(status IN ('submitted','approved')),
    approved_at TEXT, approved_by INTEGER REFERENCES users(id),
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS report_answers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    report_id INTEGER NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    answer TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY, value TEXT NOT NULL
  );
`);

// Default settings
const ins = db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)');
for (const [k, v] of Object.entries({
  smtp_host: 'smtp.gmail.com', smtp_port: '587', smtp_user: '', smtp_pass: '',
  smtp_from: 'PTB Tracker <noreply@privatetutoringbali.com>',
  app_url: 'http://localhost:3000', app_name: 'Private Tutoring Bali',
})) ins.run(k, v);

// ── SQL translator ──
function translateSQL(sql: string, raw: string): string {
  let s = sql;

  // RETURNING clause: SQLite doesn't support it with INSERT/UPDATE/DELETE directly
  // We'll handle this in the executor by re-querying
  s = s.replace(/\bRETURNING\s+\*/gi, '');
  s = s.replace(/\bRETURNING\s+[\w,\s]+\b/gi, '');

  // NOW() → datetime('now')
  s = s.replace(/\bNOW\s*\(\s*\)/gi, "datetime('now')");

  // true/false → 1/0
  s = s.replace(/\btrue\b/gi, '1');
  s = s.replace(/\bfalse\b/gi, '0');

  // ON CONFLICT DO NOTHING → strip (SQLite INSERT OR IGNORE handles this)
  s = s.replace(/ON\s+CONFLICT\s*\([^)]+\)\s*DO\s+NOTHING/gi, '');
  // ON CONFLICT (key) DO UPDATE SET ... → strip, handled by INSERT OR REPLACE
  s = s.replace(/\s+ON\s+CONFLICT\s*\([^)]+\)\s*DO\s+UPDATE\s+SET\s+[^;]+/gi, '');
  // Convert INSERT INTO → INSERT OR REPLACE INTO when ON CONFLICT DO UPDATE was present
  if (/ON\s+CONFLICT/i.test(raw)) {
    s = s.replace(/\bINSERT\s+INTO\b/i, 'INSERT OR REPLACE INTO');
  }

  // ILIKE → LIKE (case-insensitive)
  s = s.replace(/\bILIKE\b/gi, 'LIKE');

  // ::timestamptz → (strip cast)
  s = s.replace(/::timestamptz/gi, '');

  // Remove LIMIT conflicts with params
  // LIMIT $N → LIMIT ? (but params handle this)

  return s;
}

/**
 * Parse tagged template to { sql, params }
 */
function parseTemplate(strings: TemplateStringsArray, ...values: any[]): { sql: string; params: any[] } {
  let sqlStr = '';
  const params: any[] = [];
  for (let i = 0; i < strings.length; i++) {
    sqlStr += strings[i];
    if (i < values.length) {
      sqlStr += '?';
      const v = values[i];
      // Convert boolean/undefined/null
      if (typeof v === 'boolean') params.push(v ? 1 : 0);
      else if (v === undefined || v === null) params.push(null);
      else params.push(v);
    }
  }
  return { sql: sqlStr, params };
}

/**
 * Async wrapper matching Neon's tagged-template API.
 */
export function localSql(strings: TemplateStringsArray, ...values: any[]): Promise<any[]> {
  return new Promise((resolve, reject) => {
    try {
      const { sql: rawSql, params } = parseTemplate(strings, ...values);
      const sqlStr = translateSQL(rawSql.trim(), rawSql);
      const upper = sqlStr.trim().toUpperCase();
      const hasReturning = /\bRETURNING\b/i.test(rawSql);

      if (upper.startsWith('SELECT') || upper.startsWith('WITH')) {
        const stmt = db.prepare(sqlStr);
        const rows = stmt.all(...params) as any[];
        resolve(rows);
      } else if (upper.startsWith('INSERT')) {
        const stmt = db.prepare(sqlStr);
        const info = stmt.run(...params);

        if (hasReturning) {
          // Simulate RETURNING by re-querying the last inserted row
          const lastId = info.lastInsertRowid as number;
          // Try to figure out which table was inserted
          const tableMatch = sqlStr.match(/INSERT\s+INTO\s+(\w+)/i);
          const table = tableMatch?.[1];
          if (table && lastId) {
            const row = db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(lastId) as any;
            resolve(row ? [row] : []);
          } else {
            resolve([]);
          }
        } else {
          resolve([]);
        }
      } else if (upper.startsWith('UPDATE') && hasReturning) {
        // UPDATE ... RETURNING — re-query
        const stmt = db.prepare(sqlStr);
        stmt.run(...params);

        // Try to extract WHERE clause for re-query
        const whereMatch = sqlStr.match(/WHERE\s+([\s\S]+?)(?:\s*RETURNING|\s*$)/i);
        if (whereMatch) {
          // Not easily reversible; just return empty
          resolve([]);
        } else {
          resolve([]);
        }
      } else {
        const stmt = db.prepare(sqlStr);
        stmt.run(...params);
        resolve([]);
      }
    } catch (e: any) {
      reject(e);
    }
  });
}

export function getLocalDb() { return db; }
export default localSql;
