import { NextResponse } from 'next/server';
import { db } from '../../../../lib/db';
import { hashPassword, signToken } from '../../../../lib/auth';

export async function POST(req) {
  try {
    const { name, username, email, password, avatar, mascotGif } = await req.json();

    const cleanName = name?.trim() || username?.trim();
    const cleanUsername = username?.trim()?.toLowerCase();
    const cleanEmail = email?.trim()?.toLowerCase();

    if (!cleanUsername || !cleanEmail || !password) {
      return NextResponse.json({ error: 'Please fill in all required fields' }, { status: 400 });
    }

    // Check if username is taken
    const existingUser = await db.user.findFirst({
      where: { username: cleanUsername },
    });

    if (existingUser) {
      return NextResponse.json({ error: `Username "${cleanUsername}" is already taken` }, { status: 400 });
    }

    // Check if email is registered
    const existingEmail = await db.user.findFirst({
      where: { email: cleanEmail },
    });

    if (existingEmail) {
      return NextResponse.json({ error: `Email "${cleanEmail}" is already registered` }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);
    const user = await db.user.create({
      data: {
        name: cleanName,
        username: cleanUsername,
        email: cleanEmail,
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
    console.error('Signup error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
