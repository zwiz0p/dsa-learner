import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const avatarsDir = path.join(process.cwd(), 'public', 'avatars');

    if (!fs.existsSync(avatarsDir)) {
      return NextResponse.json({ avatars: ['/avatars/default.png'] });
    }

    const files = fs.readdirSync(avatarsDir);
    const validExtensions = ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg'];

    const avatars = files
      .filter(file => validExtensions.includes(path.extname(file).toLowerCase()))
      .map(file => `/avatars/${file}`);

    if (avatars.length === 0) {
      avatars.push('/avatars/default.png');
    }

    return NextResponse.json({ avatars });
  } catch (error) {
    console.error('Error reading avatars directory:', error);
    return NextResponse.json({ avatars: ['/avatars/default.png'] });
  }
}
