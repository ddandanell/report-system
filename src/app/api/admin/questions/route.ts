import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { sql } from '@/lib/db';

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const questions = await sql`SELECT * FROM questions ORDER BY sort_order, id`;
  return NextResponse.json({ questions });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { text, type, category, sort_order } = await req.json();
  if (!text || !type) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

  const maxRows = await sql`SELECT MAX(sort_order) as m FROM questions`;
  const maxOrder = maxRows[0]?.m ?? 0;

  const rows = await sql`
    INSERT INTO questions (text, type, category, sort_order)
    VALUES (${text}, ${type}, ${category || 'General'}, ${sort_order ?? Number(maxOrder) + 1})
    RETURNING *
  `;
  return NextResponse.json({ question: rows[0] }, { status: 201 });
}
