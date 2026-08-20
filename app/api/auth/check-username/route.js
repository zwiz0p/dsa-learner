import { NextResponse } from 'next/server';
import { db } from '../../../../lib/db';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get('username')?.trim()?.toLowerCase();

    if (!username || username.length < 2) {
      return NextResponse.json({ available: true, message: '' });
    }

    const existing = await db.user.findFirst({
      where: {
        username: {
          equals: username,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ available: false, message: `Username "${username}" is already taken` });
    }

    return NextResponse.json({ available: true, message: `Username "${username}" is available!` });
  } catch (error) {
    console.error('Check username error:', error);
    // On DB error/connecting, default to available: true so signup is never blocked
    return NextResponse.json({ available: true, message: '' });
  }
}
