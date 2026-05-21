import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { sql } from '@/lib/db';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || session.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { name, age, grade, subject, notes } = await req.json();
  const rows = await sql`
    UPDATE students SET name=${name}, age=${age || null}, grade=${grade || null},
      subject=${subject || null}, notes=${notes || null}
    WHERE id=${params.id} RETURNING *
  `;
  return NextResponse.json({ student: rows[0] });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || session.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await sql`DELETE FROM students WHERE id=${params.id}`;
  return NextResponse.json({ ok: true });
}
