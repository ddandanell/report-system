import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { sql } from '@/lib/db';

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const students = await sql`SELECT * FROM students ORDER BY name`;
  return NextResponse.json({ students });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { name, age, grade, subject, notes } = await req.json();
  if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

  const rows = await sql`
    INSERT INTO students (name, age, grade, subject, notes)
    VALUES (${name}, ${age || null}, ${grade || null}, ${subject || null}, ${notes || null})
    RETURNING *
  `;
  return NextResponse.json({ student: rows[0] }, { status: 201 });
}
