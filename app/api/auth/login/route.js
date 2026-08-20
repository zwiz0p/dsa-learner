import { NextResponse } from 'next/server';
import { db } from '../../../../lib/db';
import { comparePassword, signToken } from '../../../../lib/auth';

export async function POST(req) {
  try {
    const { usernameOrEmail, password } = await req.json();

    if (!usernameOrEmail || !password) {
      return NextResponse.json({ error: 'Please enter username/email and password' }, { status: 400 });
    }

    const cleanInput = usernameOrEmail.trim().toLowerCase();

    const user = await db.user.findFirst({
      where: {
        OR: [{ username: cleanInput }, { email: cleanInput }],
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const match = await comparePassword(password, user.passwordHash);
    if (!match) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = signToken({ id: user.id, username: user.username, email: user.email });

    const response = NextResponse.json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        mascotGif: user.mascotGif,
        status: user.status,
        inviteCode: user.inviteCode,
      },
      token,
    });

    response.cookies.set('token', token, {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
