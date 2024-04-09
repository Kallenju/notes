import type { PoolClient } from 'pg';

import { getHashedPassword } from '../auth/getHashedPassword.js';

export async function createNewUser(
  email: string,
  password: string,
  client: PoolClient,
): Promise<string> {
  const { hashedPassword, salt } = getHashedPassword(password);

  const {
    rows: [{ id: userId }],
  } = await client.query<{ id: string }>(
    `
      INSERT INTO users (email)
      VALUES ($1)
      RETURNING id
    `,
    [email],
  );

  await client.query(
    `
      INSERT INTO auth (user_id, password, salt)
      VALUES (
            $1,
            $2,
            $3
        )
    `,
    [userId, hashedPassword, salt],
  );

  return userId;
}
