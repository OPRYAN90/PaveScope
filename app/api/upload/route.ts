import { NextRequest, NextResponse } from 'next/server';
import { saveImageToDatabase } from '../../../lib/db'; // Fixed import path

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File | null; // Added null check
  const userId = formData.get('userId') as string;

  if (!file || !userId) {
    return NextResponse.json({ error: 'File or user ID is missing' }, { status: 400 });
  }

  try {
    // Here you would typically upload the file to a storage service like S3
    // For this example, we'll just save the file name to the database
    await saveImageToDatabase(userId, file.name);
    return NextResponse.json({ message: 'File uploaded successfully' });
  } catch (error) {
    console.error('Error saving image:', error);
    return NextResponse.json({ error: 'Failed to save image' }, { status: 500 });
  }
}