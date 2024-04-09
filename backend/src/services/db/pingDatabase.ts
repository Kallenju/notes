import { db } from '../../database.js';

export async function pingDatabase() {
  await db.query('SELECT NULL')
}
