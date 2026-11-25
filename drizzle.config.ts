import { defineConfig } from 'drizzle-kit';

/** drizzle-kit generates forward SQL migrations into drizzle/ (ADR-0002). */
export default defineConfig({
  dialect: 'postgresql',
  schema: './src/shared/db/schema.ts',
  out: './drizzle',
  dbCredentials: { url: process.env.DATABASE_URL ?? '' },
});
