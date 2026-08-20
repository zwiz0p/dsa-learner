import { NextResponse } from 'next/server';
import { db } from '../../../../lib/db';
import { getAuthUserFromRequest } from '../../../../lib/auth';

export async function POST(req) {
  try {
    const auth = getAuthUserFromRequest(req);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { avatar, mascotGif, status } = await req.json();

    const updatedUser = await db.user.update({
      where: { id: auth.id },
      data: {
        ...(avatar && { avatar }),
        ...(mascotGif && { mascotGif }),
        ...(status && { status }),
      },
      select: {
        id: true,
        username: true,
        email: true,
        avatar: true,
        mascotGif: true,
        status: true,
        inviteCode: true,
      },
    });

    return NextResponse.json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
