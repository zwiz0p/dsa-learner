import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { getAuthUserFromRequest } from '../../../lib/auth';

export async function GET(req) {
  try {
    const auth = getAuthUserFromRequest(req);
    if (!auth) return NextResponse.json({ friends: [] });

    // Fetch accepted friendships where user is sender or receiver
    const friendships = await db.friendship.findMany({
      where: {
        status: 'ACCEPTED',
        OR: [{ senderId: auth.id }, { receiverId: auth.id }],
      },
      include: {
        sender: {
          select: {
            id: true, username: true, avatar: true, status: true,
            progress: { where: { solved: true }, select: { id: true } },
          },
        },
        receiver: {
          select: {
            id: true, username: true, avatar: true, status: true,
            progress: { where: { solved: true }, select: { id: true } },
          },
        },
      },
    });

    const friends = friendships.map((f) => {
      const friendObj = f.senderId === auth.id ? f.receiver : f.sender;
      return {
        id: friendObj.id,
        username: friendObj.username,
        avatar: friendObj.avatar,
        status: friendObj.status,
        solvedCount: friendObj.progress.length,
      };
    });

    return NextResponse.json({ friends });
  } catch (error) {
    console.error('Fetch friends error:', error);
    return NextResponse.json({ friends: [] });
  }
}
