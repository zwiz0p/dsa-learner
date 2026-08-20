import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { getAuthUserFromRequest } from '../../../lib/auth';

export async function GET(req) {
  try {
    const auth = getAuthUserFromRequest(req);
    if (!auth) {
      return NextResponse.json({ solved: {}, rev1: {}, rev2: {} });
    }

    const records = await db.userProgress.findMany({
      where: { userId: auth.id },
    });

    const solved = {};
    const rev1 = {};
    const rev2 = {};

    records.forEach((r) => {
      if (r.solved) solved[r.problemKey] = true;
      if (r.rev1) rev1[r.problemKey] = true;
      if (r.rev2) rev2[r.problemKey] = true;
    });

    return NextResponse.json({ solved, rev1, rev2 });
  } catch (error) {
    console.error('Fetch progress error:', error);
    return NextResponse.json({ solved: {}, rev1: {}, rev2: {} });
  }
}

export async function POST(req) {
  try {
    const auth = getAuthUserFromRequest(req);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { problemKey, type, value } = await req.json();
    if (!problemKey || !type) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const dataUpdate = {};
    if (type === 'solve') dataUpdate.solved = !!value;
    if (type === 'rev1') dataUpdate.rev1 = !!value;
    if (type === 'rev2') dataUpdate.rev2 = !!value;

    const record = await db.userProgress.upsert({
      where: {
        userId_problemKey: {
          userId: auth.id,
          problemKey,
        },
      },
      update: dataUpdate,
      create: {
        userId: auth.id,
        problemKey,
        solved: type === 'solve' ? !!value : false,
        rev1: type === 'rev1' ? !!value : false,
        rev2: type === 'rev2' ? !!value : false,
      },
    });

    return NextResponse.json({ success: true, record });
  } catch (error) {
    console.error('Update progress error:', error);
    return NextResponse.json({ error: 'Failed to update progress' }, { status: 500 });
  }
}
