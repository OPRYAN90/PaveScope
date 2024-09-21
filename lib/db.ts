import { sql } from '@vercel/postgres';

export { sql };

export async function saveImageToDatabase(userId: string, fileName: string) {
  // Assuming you're using a SQL database
  const query = 'INSERT INTO user_images (user_id, file_name) VALUES (?, ?)';
  await db.execute(query, [userId, fileName]);
}

// ... other database functions