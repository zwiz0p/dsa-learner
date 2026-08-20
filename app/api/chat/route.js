import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { getAuthUserFromRequest } from '../../../lib/auth';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const roomId = searchParams.get('roomId') || 'library';

    const messages = await db.chatMessage.findMany({
      where: { roomId },
      orderBy: { createdAt: 'asc' },
      take: 100,
    });

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Fetch chat error:', error);
    return NextResponse.json({ messages: [] });
  }
}

export async function POST(req) {
  try {
    const auth = getAuthUserFromRequest(req);
    const body = await req.json();
    const { text, roomId } = body;

    if (!text) {
      return NextResponse.json({ error: 'Message cannot be empty' }, { status: 400 });
    }

    const username = auth ? auth.username : 'Guest';
    const avatar = auth ? auth.avatar : '/avatars/default.png';

    const message = await db.chatMessage.create({
      data: {
        roomId: roomId || 'library',
        userId: auth ? auth.id : 'guest',
        username,
        avatar,
        text,
      },
    });

    return NextResponse.json({ message });
  } catch (error) {
    console.error('Post chat error:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const auth = getAuthUserFromRequest(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get('days') || '7', 10);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const deleted = await db.chatMessage.deleteMany({
      where: {
        createdAt: { lt: cutoffDate },
      },
    });

    return NextResponse.json({ message: `Deleted ${deleted.count} messages older than ${days} days.` });
  } catch (error) {
    console.error('Clear chat error:', error);
    return NextResponse.json({ error: 'Failed to clear chat history' }, { status: 500 });
  }
}
