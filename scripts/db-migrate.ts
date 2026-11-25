/** npm run db:migrate — apply pending drizzle migrations to DATABASE_URL. */
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Client } from 'pg';
import { getDatabaseUrl } from '../src/shared/env/index';
import { MIGRATIONS_FOLDER } from '../src/shared/db/migrations';

const client = new Client({ connectionString: getDatabaseUrl() });
await client.connect();
try {
  await migrate(drizzle(client), { migrationsFolder: MIGRATIONS_FOLDER });
  console.log('migrations applied');
} finally {
  await client.end();
}
