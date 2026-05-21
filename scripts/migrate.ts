/**
 * One-off script to run schema.sql against Neon PostgreSQL.
 * Usage: npx tsx scripts/migrate.ts
 * Uses pg (node-postgres) for direct SQL execution.
 */
import * as dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: '.env.local' });

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not set in .env.local');
  process.exit(1);
}

async function migrate() {
  // Use node-postgres for raw SQL execution
  const { Client } = await import('pg');
  const client = new Client({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });

  try {
    await client.connect();
    console.log('🗄️  Connected to Neon PostgreSQL\n');

    const schemaPath = path.join(__dirname, '..', 'src', 'lib', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');

    console.log('Running schema...\n');
    await client.query(schema);
    console.log('✅ Schema applied successfully!');
    console.log('   Tables: users, students, assignments, parent_students, questions, reports, report_answers, settings');
    console.log('   Default settings inserted.\n');
  } catch (e: any) {
    if (e.message?.includes('already exists')) {
      console.log('⏭️  Schema already exists, continuing...\n');
    } else {
      console.error('❌ Migration failed:', e.message);
      process.exit(1);
    }
  } finally {
    await client.end();
  }
}

migrate();
