import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { sql } from '@/lib/db';

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const rows = await sql`SELECT key, value FROM settings ORDER BY key`;
  const settings: Record<string, string> = {};
  for (const r of rows) settings[r.key] = r.value;
  return NextResponse.json({ settings });
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const updates: Record<string, string> = await req.json();
  for (const [key, value] of Object.entries(updates)) {
    await sql`INSERT INTO settings (key, value) VALUES (${key}, ${value}) ON CONFLICT (key) DO UPDATE SET value=${value}`;
  }
  return NextResponse.json({ ok: true });
}
