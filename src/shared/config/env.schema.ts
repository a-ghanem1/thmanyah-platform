import { z } from 'zod';

export const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  DATABASE_REPLICA_URLS: z.string().optional(),
  MEILI_HOST: z.string().url(),
  MEILI_API_KEY: z.string().optional(),
  REDIS_URL: z.string().optional(),
  JWT_SECRET: z.string().min(1),
  JWT_EXPIRES_IN: z.string().default('1h'),
  PORT: z.coerce.number().int().positive(),
});

export type Env = z.infer<typeof envSchema>;
