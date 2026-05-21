import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { sql } from '@/lib/db';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const questions = await sql`
    SELECT * FROM questions WHERE active = true ORDER BY sort_order, id
  `;
  return NextResponse.json({ questions });
}
