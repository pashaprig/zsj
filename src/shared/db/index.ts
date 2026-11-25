import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { getEnv } from '@/shared/env';
import * as schema from './schema';

export type Db = NodePgDatabase<typeof schema>;

/** Create a Drizzle client over node-postgres. Only src/modules/*\/infra should use it. */
export function createDb(databaseUrl: string): Db {
  return drizzle(new Pool({ connectionString: databaseUrl, max: 5 }), { schema });
}

let db: Db | undefined;

/** Lazily created app-wide client (connects on first use, not at build time). */
export function getDb(): Db {
  db ??= createDb(getEnv().DATABASE_URL);
  return db;
}
