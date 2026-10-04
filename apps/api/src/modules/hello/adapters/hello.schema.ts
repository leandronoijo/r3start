import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const helloMessages = pgTable('hello_messages', {
  key: text('key').primaryKey(),
  message: text('message').notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
