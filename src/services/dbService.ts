import { db } from '../config/db.js';

export async function getContentByKeyword(keyword: string) {
  const [rows] = await db.query(
    'SELECT title, body FROM contents WHERE title LIKE ? OR body LIKE ? LIMIT 3',
    [`%${keyword}%`, `%${keyword}%`]
  );
  return rows as { title: string; body: string }[];
}
