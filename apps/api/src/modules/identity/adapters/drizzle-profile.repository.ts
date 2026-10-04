import { eq } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { userProfiles } from './profile.schema';
import type { UserProfileRepository } from '../ports/profile.repository';

export class DrizzleProfileRepository implements UserProfileRepository {
  constructor(private readonly db: NodePgDatabase) {}
  async getFullName(id: string) {
    const [row] = await this.db
      .select({ fullName: userProfiles.fullName })
      .from(userProfiles)
      .where(eq(userProfiles.supertokensUserId, id))
      .limit(1);
    return row?.fullName;
  }
  async create(id: string, fullName: string) {
    await this.db.insert(userProfiles).values({ supertokensUserId: id, fullName });
  }
  async delete(id: string) {
    await this.db.delete(userProfiles).where(eq(userProfiles.supertokensUserId, id));
  }
}
