import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { sql } from '@/lib/db';
import { createToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();
    if (!username || !password) {
      return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
    }

    const rows = await sql`SELECT * FROM users WHERE username = ${username} LIMIT 1`;
    const user = rows[0];

    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }

    const token = await createToken({
      id: user.id,
      name: user.name,
      username: user.username,
      role: user.role,
    });

    const res = NextResponse.json({
      user: { id: user.id, name: user.name, username: user.username, role: user.role },
    });

    res.cookies.set('ptb_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return res;
  } catch (e) {
    console.error('Login error:', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
