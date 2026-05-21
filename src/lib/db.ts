/**
 * Database connection — auto-detects Neon PostgreSQL, SQLite, or Demo mode.
 * Demo mode is the default when no database is configured.
 */

const dbUrl = process.env.DATABASE_URL || '';
const isRealNeon = dbUrl.startsWith('postgresql://') && !dbUrl.includes('xxxx') && !dbUrl.includes('user:password@ep-xxxx');

let sqlInstance: any;
let dbMode: 'neon' | 'sqlite' | 'demo' = 'demo';

if (isRealNeon) {
  // Use Neon serverless PostgreSQL
  const { neon } = require('@neondatabase/serverless');
  sqlInstance = neon(dbUrl);
  dbMode = 'neon';
  console.log('🗄️  Using Neon PostgreSQL');
} else {
  // Use demo mode with hardcoded sample data
  const { demoSql } = require('./demo-adapter');
  sqlInstance = demoSql;
  dbMode = 'demo';
  console.log('🎭 Demo mode — no database, using hardcoded sample data');
  console.log('   Login: any username/password works');
  console.log('   Try: admin, teacher, sarah, made, parent, maria, ketut');
}

export const sql = sqlInstance;
export function getDbMode() { return dbMode; }
