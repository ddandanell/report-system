/**
 * PTB Session Tracker — Database Seed Script
 *
 * Run AFTER running schema.sql in the Neon SQL Editor:
 *   npx tsx scripts/seed.ts
 *
 * This creates:
 *   - 1 admin user (admin / ptb2024admin)
 *   - 9 default report questions
 */

import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

if (!process.env.DATABASE_URL) {
  console.error('\n❌ DATABASE_URL not found. Make sure .env.local exists and has your Neon connection string.\n');
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

async function seed() {
  console.log('\n🌱 PTB Session Tracker — Seeding database...\n');

  // Admin user
  const existing = await sql`SELECT id FROM users WHERE username = 'admin'`;
  if (existing.length === 0) {
    const hash = bcrypt.hashSync('ptb2024admin', 10);
    await sql`
      INSERT INTO users (name, username, password_hash, role)
      VALUES ('Admin', 'admin', ${hash}, 'admin')
    `;
    console.log('✅ Admin user created');
    console.log('   Username: admin');
    console.log('   Password: ptb2024admin');
    console.log('   ⚠️  Change this password after first login!\n');
  } else {
    console.log('ℹ️  Admin user already exists\n');
  }

  // Default questions
  const qCount = await sql`SELECT COUNT(*) as count FROM questions`;
  if (Number(qCount[0].count) === 0) {
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
      await sql`
        INSERT INTO questions (text, type, category, sort_order, active)
        VALUES (${q.text}, ${q.type}, ${q.category}, ${q.sort_order}, true)
      `;
    }
    console.log(`✅ ${questions.length} default questions created\n`);
  } else {
    console.log(`ℹ️  Questions already exist (${qCount[0].count} found)\n`);
  }

  console.log('🎉 Seed complete!\n');
  console.log('Next step: npm run dev → http://localhost:3000\n');
}

seed().catch(e => {
  console.error('❌ Seed failed:', e);
  process.exit(1);
});
