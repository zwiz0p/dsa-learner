import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const mascotsDir = path.join(process.cwd(), 'public', 'mascots');

    if (!fs.existsSync(mascotsDir)) {
      return NextResponse.json({ mascots: ['/mascots/default.gif'] });
    }

    const files = fs.readdirSync(mascotsDir);
    const validExtensions = ['.gif', '.png', '.jpg', '.jpeg', '.webp', '.svg'];

    const mascots = files
      .filter(file => validExtensions.includes(path.extname(file).toLowerCase()))
      .map(file => `/mascots/${file}`);

    if (mascots.length === 0) {
      mascots.push('/mascots/default.gif');
    }

    return NextResponse.json({ mascots });
  } catch (error) {
    console.error('Error reading mascots directory:', error);
    return NextResponse.json({ mascots: ['/mascots/default.gif'] });
  }
}
