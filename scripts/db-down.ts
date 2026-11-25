/** npm run db:down — revert the most recent migration on DATABASE_URL via drizzle/down/<tag>.down.sql. */
import { Client } from 'pg';
import { getDatabaseUrl } from '../src/shared/env/index';
import { rollbackLast } from '../src/shared/db/migrations';

const client = new Client({ connectionString: getDatabaseUrl() });
await client.connect();
try {
  const tag = await rollbackLast({
    query: (text) => client.query(text),
    exec: (text) => client.query(text),
  });
  console.log(tag ? `reverted ${tag}` : 'nothing to revert');
} finally {
  await client.end();
}
