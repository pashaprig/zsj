import { PGlite } from '@electric-sql/pglite';
import { vector } from '@electric-sql/pglite-pgvector';
import { drizzle } from 'drizzle-orm/pglite';
import { migrate } from 'drizzle-orm/pglite/migrator';
import * as schema from '@/shared/db/schema';
import { MIGRATIONS_FOLDER } from '@/shared/db/migrations';

/**
 * A fresh in-process PostgreSQL (PGlite + pgvector) with every migration applied.
 * Use one per integration test file; call close() in afterAll.
 */
export async function createTestDb() {
  const client = new PGlite({ extensions: { vector } });
  const db = drizzle(client, { schema });
  await migrate(db, { migrationsFolder: MIGRATIONS_FOLDER });
  return {
    client,
    db,
    migrate: () => migrate(db, { migrationsFolder: MIGRATIONS_FOLDER }),
    close: () => client.close(),
  };
}
