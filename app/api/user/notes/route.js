import { NextResponse } from 'next/server';
import { db } from '../../../../lib/db';
import { getAuthUserFromRequest } from '../../../../lib/auth';

export async function GET(req) {
  try {
    const auth = getAuthUserFromRequest(req);
    if (!auth) {
      return NextResponse.json({ notes: {} });
    }

    const notes = await db.problemNote.findMany({
      where: { userId: auth.id },
    });

    const notesMap = {};
    notes.forEach((n) => {
      notesMap[n.problemKey] = n.content;
    });

    return NextResponse.json({ notes: notesMap });
  } catch (error) {
    return NextResponse.json({ notes: {} });
  }
}

export async function POST(req) {
  try {
    const auth = getAuthUserFromRequest(req);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { problemKey, content } = await req.json();
    if (!problemKey) {
      return NextResponse.json({ error: 'Missing problem key' }, { status: 400 });
    }

    const note = await db.problemNote.upsert({
      where: {
        userId_problemKey: {
          userId: auth.id,
          problemKey,
        },
      },
      update: { content: content || '' },
      create: {
        userId: auth.id,
        problemKey,
        content: content || '',
      },
    });

    return NextResponse.json({ success: true, note });
  } catch (error) {
    console.error('Save note error:', error);
    return NextResponse.json({ error: 'Failed to save note' }, { status: 500 });
  }
}
