import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getSession } from '@/lib/auth';
import { sql } from '@/lib/db';
import { sendParentWelcome } from '@/lib/email';

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const parents = await sql`
    SELECT u.id, u.name, u.username, u.email, u.invite_sent, u.created_at,
      json_agg(
        json_build_object('id', s.id, 'name', s.name)
      ) FILTER (WHERE s.id IS NOT NULL) as children
    FROM users u
    LEFT JOIN parent_students ps ON ps.parent_id = u.id
    LEFT JOIN students s ON s.id = ps.student_id
    WHERE u.role = 'parent'
    GROUP BY u.id
    ORDER BY u.name
  `;
  return NextResponse.json({ parents: parents.map(p => ({ ...p, children: p.children || [] })) });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { name, email, student_ids } = await req.json();
  if (!name || !email) return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });

  // Generate a unique username from email
  const username = email.split('@')[0].toLowerCase().replace(/[^a-z0-9.]/g, '.');
  const existing = await sql`SELECT id FROM users WHERE email = ${email}`;
  if (existing.length) return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });

  // Generate invite token (parent sets password via email link)
  const inviteToken = crypto.randomBytes(32).toString('hex');

  const rows = await sql`
    INSERT INTO users (name, username, email, password_hash, role, invite_token, invite_sent)
    VALUES (${name}, ${username}, ${email}, '', 'parent', ${inviteToken}, false)
    RETURNING id, name, username, email, role, created_at
  `;
  const parent = rows[0];

  // Link to students
  if (student_ids?.length) {
    for (const sid of student_ids) {
      await sql`
        INSERT INTO parent_students (parent_id, student_id) VALUES (${parent.id}, ${sid})
        ON CONFLICT DO NOTHING
      `;
    }
  }

  // Send welcome email
  try {
    await sendParentWelcome(email, name, inviteToken);
    await sql`UPDATE users SET invite_sent=true WHERE id=${parent.id}`;
  } catch (e) {
    console.error('Failed to send welcome email:', e);
    // Don't fail the request — admin can resend later
  }

  return NextResponse.json({ parent }, { status: 201 });
}
