import { eq } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { helloMessages } from './hello.schema';
import type { GreetingRepository } from '../ports/greeting.repository';

export class DrizzleGreetingRepository implements GreetingRepository {
  constructor(private readonly db: NodePgDatabase) {}
  async getCurrent() {
    const [row] = await this.db
      .select({ message: helloMessages.message })
      .from(helloMessages)
      .where(eq(helloMessages.key, 'default'))
      .limit(1);
    return row;
  }
}
