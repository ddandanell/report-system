import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set. Copy .env.example → .env.local and fill in your Neon connection string.');
}

// neon() returns a tagged-template SQL function
// Usage: await sql`SELECT * FROM users WHERE id = ${id}`
export const sql = neon(process.env.DATABASE_URL);

export default sql;
