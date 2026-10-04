import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { createDatabase } from './client';
import { readConfig } from '../config';
import { join } from 'node:path';
async function main() {
  const { db, pool } = createDatabase(readConfig().DATABASE_URL);
  await migrate(db, { migrationsFolder: join(__dirname, '../../../drizzle') });
  await pool.end();
}
main().catch((error) => {
  console.error(error);
  process.exit(1);
});
