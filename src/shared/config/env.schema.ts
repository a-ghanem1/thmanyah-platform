import { z } from 'zod';

export const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  MEILI_HOST: z.string().url(),
  MEILI_API_KEY: z.string().optional(),
  REDIS_URL: z.string().optional(),
  STUDIO_API_KEY: z.string().min(1),
  PORT: z.coerce.number().int().positive(),
});

export type Env = z.infer<typeof envSchema>;
