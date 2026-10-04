import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

export const createDatabase = (connectionString: string) => {
  const pool = new Pool({ connectionString });
  return { db: drizzle(pool), pool };
};
