import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { sql, getDbMode } from '@/lib/db';
import { createToken } from '@/lib/auth';

const DEMO_USERS: Record<string, { id: number; name: string; username: string; role: 'admin' | 'teacher' | 'parent' }> = {
  admin: { id: 1, name: 'Dede (Admin)', username: 'admin', role: 'admin' },
  teacher: { id: 2, name: 'Sarah Johnson', username: 'teacher', role: 'teacher' },
  sarah: { id: 2, name: 'Sarah Johnson', username: 'sarah', role: 'teacher' },
  made: { id: 3, name: 'Made Arka', username: 'made', role: 'teacher' },
  parent: { id: 4, name: 'Maria van der Berg', username: 'parent', role: 'parent' },
  maria: { id: 4, name: 'Maria van der Berg', username: 'maria', role: 'parent' },
  ketut: { id: 5, name: 'Ketut Wirawan', username: 'ketut', role: 'parent' },
};

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();
    if (!username || !password) {
      return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
    }

    const dbMode = getDbMode();

    // Demo mode: accept any known username, skip bcrypt
    if (dbMode === 'demo') {
      const demoUser = DEMO_USERS[username.toLowerCase()];
      if (!demoUser) {
        // Allow any username by defaulting to admin
        const token = await createToken({ id: 1, name: 'Demo User', username, role: 'admin' });
        const res = NextResponse.json({ user: { id: 1, name: 'Demo User', username, role: 'admin' } });
        res.cookies.set('ptb_token', token, { httpOnly: true, secure: false, sameSite: 'lax', maxAge: 60 * 60 * 24 * 7, path: '/' });
        return res;
      }
      const token = await createToken(demoUser);
      const res = NextResponse.json({ user: demoUser });
      res.cookies.set('ptb_token', token, { httpOnly: true, secure: false, sameSite: 'lax', maxAge: 60 * 60 * 24 * 7, path: '/' });
      return res;
    }

    // Real database mode
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
