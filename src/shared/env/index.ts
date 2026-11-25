import { z } from 'zod';

/** Every environment variable the app reads. Declared and validated only here. */
export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_URL: z.string().url(),
  EMBEDDINGS_API_KEY: z.string().min(1),
  ADMIN_PASSWORD_HASH: z.string().min(1),
  SESSION_SECRET: z.string().min(32),
  COVERS_DIR: z.string().min(1),
});

export type Env = z.infer<typeof envSchema>;

/** Parse an env source; throws a readable error listing every missing/invalid variable. */
export function parseEnv(source: Record<string, string | undefined>): Env {
  const result = envSchema.safeParse(source);
  if (!result.success) {
    const issues = result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
    throw new Error(`Invalid environment: ${issues}`);
  }
  return result.data;
}

/** Only what the migration scripts need (CI/CD runs them without the app's other secrets). */
export function getDatabaseUrl(source: Record<string, string | undefined> = process.env): string {
  return envSchema.pick({ DATABASE_URL: true }).parse(source).DATABASE_URL;
}

let cached: Env | undefined;

/** Lazily validated process env — fails fast on first use, not at build time. */
export function getEnv(): Env {
  cached ??= parseEnv(process.env);
  return cached;
}
