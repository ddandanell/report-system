/**
 * PTB Session Tracker — Database Seed Script
 *
 * Local (SQLite):  npx tsx scripts/seed.ts
 * Neon:            npx tsx scripts/seed.ts   (with .env.local DATABASE_URL)
 *
 * Creates:
 *   - Admin:  admin / admin
 *   - Teacher: teacher / teacher
 *   - Parent:  parent / parent
 *   - 1 test student assigned to teacher and linked to parent
 *   - 9 default report questions
 */

import bcrypt from 'bcryptjs';

// Use dynamic import for db to handle both Neon and SQLite
async function seed() {
  const { sql } = await import('../src/lib/db');
  const isNeon = !!process.env.DATABASE_URL?.startsWith('postgresql://') && !process.env.DATABASE_URL?.includes('xxxx');

  console.log('\n🌱 PTB Session Tracker — Seeding database...\n');
  console.log(isNeon ? 'Using Neon PostgreSQL' : 'Using local SQLite');

  // ── Admin user ──
  const adminExisting = await sql`SELECT id FROM users WHERE username = 'admin'`;
  if (adminExisting.length === 0) {
    const hash = bcrypt.hashSync('admin', 10);
    await sql`INSERT INTO users (name, username, password_hash, role) VALUES ('Admin', 'admin', ${hash}, 'admin')`;
    console.log('✅ Admin created: admin / admin');
  } else {
    // Update password to 'admin' if it exists
    const hash = bcrypt.hashSync('admin', 10);
    await sql`UPDATE users SET password_hash = ${hash} WHERE username = 'admin'`;
    console.log('✅ Admin password reset: admin / admin');
  }

  // ── Teacher user ──
  const teacherExisting = await sql`SELECT id FROM users WHERE username = 'teacher'`;
  if (teacherExisting.length === 0) {
    const hash = bcrypt.hashSync('admin', 10);
    await sql`INSERT INTO users (name, username, password_hash, role) VALUES ('Sarah Johnson', 'teacher', ${hash}, 'teacher')`;
    console.log('✅ Teacher created: teacher / admin');
  } else {
    const hash = bcrypt.hashSync('admin', 10);
    await sql`UPDATE users SET password_hash = ${hash} WHERE username = 'teacher'`;
    console.log('✅ Teacher password reset: teacher / admin');
  }

  // ── Parent user ──
  const parentExisting = await sql`SELECT id FROM users WHERE username = 'parent'`;
  if (parentExisting.length === 0) {
    const hash = bcrypt.hashSync('admin', 10);
    await sql`INSERT INTO users (name, username, email, password_hash, role) VALUES ('Maria Parent', 'parent', 'parent@example.com', ${hash}, 'parent')`;
    console.log('✅ Parent created: parent / admin');
  } else {
    const hash = bcrypt.hashSync('admin', 10);
    await sql`UPDATE users SET password_hash = ${hash} WHERE username = 'parent'`;
    console.log('✅ Parent password reset: parent / admin');
  }

  // ── Test student ──
  const studentExisting = await sql`SELECT id FROM students WHERE name = 'Luca van der Berg'`;
  let studentId: number;
  if (studentExisting.length === 0) {
    const rows = await sql`INSERT INTO students (name, age, grade, notes) VALUES ('Luca van der Berg', 8, 'Year 3', 'Loves science, shy around new people') RETURNING id`;
    // For SQLite adapter
    if (rows.length === 0) {
      await sql`INSERT INTO students (name, age, grade, notes) VALUES ('Luca van der Berg', 8, 'Year 3', 'Loves science, shy around new people')`;
      const r = await sql`SELECT id FROM students WHERE name = 'Luca van der Berg'`;
      studentId = r[0]?.id;
    } else {
      studentId = rows[0].id;
    }
    console.log('✅ Test student created: Luca van der Berg (Age 8, Year 3, 2x/week)');
  } else {
    studentId = studentExisting[0].id;
    console.log('ℹ️  Test student already exists');
  }

  // ── Assign teacher to student ──
  const teacherRows = await sql`SELECT id FROM users WHERE username = 'teacher'`;
  const teacherId = teacherRows[0]?.id;
  if (teacherId && studentId) {
    const assignExisting = await sql`SELECT id FROM assignments WHERE teacher_id = ${teacherId} AND student_id = ${studentId}`;
    if (assignExisting.length === 0) {
      await sql`INSERT INTO assignments (teacher_id, student_id, sessions_per_week, active) VALUES (${teacherId}, ${studentId}, 2, 1)`;
      console.log('✅ Teacher Sarah assigned to Luca (2 sessions/week)');
    } else {
      console.log('ℹ️  Teacher-student assignment already exists');
    }
  }

  // ── Link parent to student ──
  const parentRows = await sql`SELECT id FROM users WHERE username = 'parent'`;
  const parentId = parentRows[0]?.id;
  if (parentId && studentId) {
    const linkExisting = await sql`SELECT 1 FROM parent_students WHERE parent_id = ${parentId} AND student_id = ${studentId}`;
    if (linkExisting.length === 0) {
      await sql`INSERT INTO parent_students (parent_id, student_id) VALUES (${parentId}, ${studentId})`;
      console.log('✅ Parent Maria linked to Luca');
    } else {
      console.log('ℹ️  Parent-student link already exists');
    }
  }

  // ── Default questions ──
  const qCount = await sql`SELECT COUNT(*) as count FROM questions`;
  const count = qCount[0]?.count ?? qCount[0]?.COUNT ?? 0;
  if (Number(count) === 0) {
    const questions = [
      { text: 'Did the student get enough sleep last night?',    type: 'boolean',   category: 'Wellbeing', sort_order: 1 },
      { text: "How was the student's energy level today?",      type: 'rating',    category: 'Wellbeing', sort_order: 2 },
      { text: "How was the student's mood during the session?", type: 'rating',    category: 'Wellbeing', sort_order: 3 },
      { text: "How was the student's focus and attention?",     type: 'rating',    category: 'Learning',  sort_order: 4 },
      { text: 'Did the student complete the planned tasks?',    type: 'boolean',   category: 'Learning',  sort_order: 5 },
      { text: 'How motivated was the student today?',           type: 'rating',    category: 'Learning',  sort_order: 6 },
      { text: "How was the student's behaviour?",               type: 'rating',    category: 'Behaviour', sort_order: 7 },
      { text: 'Did the student engage well with the material?', type: 'rating',    category: 'Behaviour', sort_order: 8 },
      { text: 'Any specific observations or concerns?',         type: 'multiline', category: 'Notes',     sort_order: 9 },
    ];

    for (const q of questions) {
      await sql`INSERT INTO questions (text, type, category, sort_order, active) VALUES (${q.text}, ${q.type}, ${q.category}, ${q.sort_order}, 1)`;
    }
    console.log(`✅ ${questions.length} default questions created`);
  } else {
    console.log(`ℹ️  ${count} questions already exist`);
  }

  console.log('\n🎉 Seed complete!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  Login credentials:');
  console.log('  ┌─────────┬───────────┬──────────┐');
  console.log('  │ Role    │ Username  │ Password │');
  console.log('  ├─────────┼───────────┼──────────┤');
  console.log('  │ Admin   │ admin     │ admin    │');
  console.log('  │ Teacher │ teacher   │ admin    │');
  console.log('  │ Parent  │ parent    │ admin    │');
  console.log('  └─────────┴───────────┴──────────┘');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('▶️  npm run dev → http://localhost:3000\n');
}

seed().catch(e => {
  console.error('❌ Seed failed:', e);
  process.exit(1);
});
