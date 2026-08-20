import { NextResponse } from 'next/server';
import { db } from '../../../../lib/db';
import { getAuthUserFromRequest } from '../../../../lib/auth';

export async function GET(req) {
  try {
    const auth = getAuthUserFromRequest(req);
    if (!auth) {
      return NextResponse.json({ user: null });
    }

    const user = await db.user.findUnique({
      where: { id: auth.id },
      select: {
        id: true,
        username: true,
        email: true,
        avatar: true,
        mascotGif: true,
        status: true,
        inviteCode: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json({ user: null });
  }
}
