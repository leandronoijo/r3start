import { createDatabase } from './client';
import { readConfig } from '../config';
import { helloMessages } from '../../modules/hello/adapters/hello.schema';
async function main() {
  const { db, pool } = createDatabase(readConfig().DATABASE_URL);
  await db
    .insert(helloMessages)
    .values({ key: 'default', message: 'Hello world' })
    .onConflictDoNothing();
  await pool.end();
}
main().catch((error) => {
  console.error(error);
  process.exit(1);
});
