import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { sql } from '@/lib/db';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || session.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { text, type, category, sort_order, active } = await req.json();
  const rows = await sql`
    UPDATE questions SET text=${text}, type=${type}, category=${category},
      sort_order=${sort_order}, active=${active}
    WHERE id=${params.id} RETURNING *
  `;
  return NextResponse.json({ question: rows[0] });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || session.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await sql`DELETE FROM questions WHERE id=${params.id}`;
  return NextResponse.json({ ok: true });
}
