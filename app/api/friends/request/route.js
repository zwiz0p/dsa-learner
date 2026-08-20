import { NextResponse } from 'next/server';
import { db } from '../../../../lib/db';
import { getAuthUserFromRequest } from '../../../../lib/auth';

// GET pending friend requests for authenticated user
export async function GET(req) {
  try {
    const auth = getAuthUserFromRequest(req);
    if (!auth) return NextResponse.json({ requests: [] });

    const requests = await db.friendship.findMany({
      where: { receiverId: auth.id, status: 'PENDING' },
      include: {
        sender: {
          select: { id: true, username: true, avatar: true, status: true },
        },
      },
    });

    return NextResponse.json({ requests });
  } catch (error) {
    return NextResponse.json({ requests: [] });
  }
}

// POST: Send a friend request by username or inviteCode
export async function POST(req) {
  try {
    const auth = getAuthUserFromRequest(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { usernameOrInviteCode } = await req.json();
    if (!usernameOrInviteCode) {
      return NextResponse.json({ error: 'Please provide a username or invite code' }, { status: 400 });
    }

    const targetUser = await db.user.findFirst({
      where: {
        OR: [
          { username: usernameOrInviteCode },
          { inviteCode: usernameOrInviteCode },
        ],
      },
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'Friend not found' }, { status: 404 });
    }

    if (targetUser.id === auth.id) {
      return NextResponse.json({ error: "You cannot add yourself as a friend!" }, { status: 400 });
    }

    const existing = await db.friendship.findFirst({
      where: {
        OR: [
          { senderId: auth.id, receiverId: targetUser.id },
          { senderId: targetUser.id, receiverId: auth.id },
        ],
      },
    });

    if (existing) {
      if (existing.status === 'ACCEPTED') {
        return NextResponse.json({ error: 'You are already friends!' }, { status: 400 });
      } else {
        return NextResponse.json({ error: 'Friend request already pending' }, { status: 400 });
      }
    }

    const request = await db.friendship.create({
      data: {
        senderId: auth.id,
        receiverId: targetUser.id,
        status: 'PENDING',
      },
    });

    return NextResponse.json({ message: `Friend request sent to ${targetUser.username}!`, request });
  } catch (error) {
    console.error('Friend request error:', error);
    return NextResponse.json({ error: 'Failed to send request' }, { status: 500 });
  }
}

// PUT: Accept or Reject a friend request
export async function PUT(req) {
  try {
    const auth = getAuthUserFromRequest(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { requestId, action } = await req.json(); // action: 'ACCEPT' or 'REJECT'
    if (!requestId || !action) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const friendship = await db.friendship.findUnique({
      where: { id: requestId },
    });

    if (!friendship || friendship.receiverId !== auth.id) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    if (action === 'ACCEPT') {
      const updated = await db.friendship.update({
        where: { id: requestId },
        data: { status: 'ACCEPTED' },
      });
      return NextResponse.json({ message: 'Friend request accepted!', friendship: updated });
    } else {
      await db.friendship.delete({
        where: { id: requestId },
      });
      return NextResponse.json({ message: 'Friend request rejected' });
    }
  } catch (error) {
    console.error('Accept/reject error:', error);
    return NextResponse.json({ error: 'Action failed' }, { status: 500 });
  }
}
