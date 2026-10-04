import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const userProfiles = pgTable('user_profiles', {
  supertokensUserId: text('supertokens_user_id').primaryKey(),
  fullName: text('full_name').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
