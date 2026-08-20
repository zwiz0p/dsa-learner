import { NextResponse } from 'next/server';
import { db } from '../../../../lib/db';
import { hashPassword, signToken } from '../../../../lib/auth';

export async function POST(req) {
  try {
    const { username, email, password, avatar, mascotGif } = await req.json();

    if (!username || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const existing = await db.user.findFirst({
      where: { OR: [{ username }, { email }] },
    });

    if (existing) {
      return NextResponse.json({ error: 'Username or email already exists' }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);
    const user = await db.user.create({
      data: {
        username,
        email,
        passwordHash,
        avatar: avatar || '/avatars/default.png',
        mascotGif: mascotGif || '/mascots/default.gif',
        status: 'Online 🟢',
      },
    });

    const token = signToken({ id: user.id, username: user.username, email: user.email });

    const response = NextResponse.json({
      message: 'Signup successful',
      user: {
        id: user.id,
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
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
