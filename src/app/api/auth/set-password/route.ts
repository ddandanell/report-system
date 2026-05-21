import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { sql } from '@/lib/db';
import { createToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const { token, password } = await req.json();
  if (!token || !password) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  if (password.length < 8) return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });

  const rows = await sql`SELECT * FROM users WHERE invite_token=${token}`;
  const user = rows[0];
  if (!user) return NextResponse.json({ error: 'Invalid or expired invite link' }, { status: 400 });

  const hash = bcrypt.hashSync(password, 10);
  await sql`UPDATE users SET password_hash=${hash}, invite_token=NULL WHERE id=${user.id}`;

  // Auto-login after password set
  const jwtToken = await createToken({ id: user.id, name: user.name, username: user.username, role: user.role });
  const res = NextResponse.json({ user: { id: user.id, name: user.name, role: user.role } });
  res.cookies.set('ptb_token', jwtToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });
  return res;
}
