import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { getAuthUserFromRequest } from '../../../lib/auth';

export async function GET() {
  try {
    const customProblems = await db.problem.findMany({
      orderBy: { createdAt: 'asc' },
    });
    return NextResponse.json({ problems: customProblems });
  } catch (error) {
    console.error('Fetch problems error:', error);
    return NextResponse.json({ problems: [] });
  }
}

export async function POST(req) {
  try {
    const auth = getAuthUserFromRequest(req);
    const body = await req.json();
    const { title, topic, difficulty, link } = body;

    if (!title || !topic || !difficulty) {
      return NextResponse.json({ error: 'Missing required problem info' }, { status: 400 });
    }

    const addedByName = auth ? auth.username : 'Friend';

    const newProblem = await db.problem.create({
      data: {
        title,
        topic,
        difficulty: difficulty || 'Medium',
        link: link || `https://leetcode.com/problemset/all/?search=${encodeURIComponent(title)}`,
        platform: link && link.includes('geeksforgeeks') ? 'GFG' : 'LeetCode',
        addedByUserId: auth ? auth.id : null,
        addedByName,
      },
    });

    return NextResponse.json({ message: 'Problem added successfully', problem: newProblem });
  } catch (error) {
    console.error('Add problem error:', error);
    return NextResponse.json({ error: 'Failed to add problem' }, { status: 500 });
  }
}
