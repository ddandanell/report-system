/**
 * Database connection — auto-detects Neon PostgreSQL or falls back to local SQLite.
 *
 * If DATABASE_URL starts with "postgresql://" and is not a placeholder, use Neon.
 * Otherwise, use the local SQLite adapter (data/ptb.db).
 */

// We need a tagged-template SQL function regardless of backend.
// Both Neon and our SQLite adapter export a `sql` function with the same signature.

// Check if we have a real Neon URL
const dbUrl = process.env.DATABASE_URL || '';
const isRealNeon = dbUrl.startsWith('postgresql://') && !dbUrl.includes('xxxx') && !dbUrl.includes('user:password@ep-xxxx');

let sqlInstance: any;

if (isRealNeon) {
  // Use Neon serverless PostgreSQL
  const { neon } = require('@neondatabase/serverless');
  sqlInstance = neon(dbUrl);
  console.log('🗄️  Using Neon PostgreSQL');
} else {
  // Use local SQLite
  const { localSql } = require('./sqlite-adapter');
  sqlInstance = localSql;
  console.log('🗄️  Using local SQLite (data/ptb.db)');
}

export const sql = sqlInstance;

// Also export getDb for direct SQLite access when needed (seed scripts)
export function getDb() {
  if (!isRealNeon) {
    const { getLocalDb } = require('./sqlite-adapter');
    return getLocalDb();
  }
  return null;
}
