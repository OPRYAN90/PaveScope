import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

export async function POST(req: NextRequest) {
  if (!req.body) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }

  const data = await req.formData();
  const file = data.get('file') as File;

  if (!file) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }

  const buffer = await file.arrayBuffer();
  const img = sharp(buffer);
  const metadata = await img.metadata();

  if (metadata.height && metadata.height > 1080) {
    const resizedImage = await img
      .resize({ height: 1080, fit: 'contain' })
      .withMetadata()
      .toBuffer();

    return new NextResponse(resizedImage, {
      headers: {
        'Content-Type': file.type,
      },
    });
  }

  // If the image doesn't need resizing, return the original
  return new NextResponse(buffer, {
    headers: {
      'Content-Type': file.type,
    },
  });
}
