import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().url(),
  SUPERTOKENS_CONNECTION_URI: z.string().url(),
  SUPERTOKENS_API_KEY: z.string().min(16),
  APP_ORIGIN: z.string().url(),
  API_DOMAIN: z.string().url(),
  WEBSITE_DOMAIN: z.string().url(),
});

export type AppConfig = z.infer<typeof schema>;
export const readConfig = (): AppConfig => schema.parse(process.env);
