import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { rollbackLast } from '@/shared/db/migrations';
import { createTestDb } from './helpers/db';

/** Skeleton smoke for the migration tool: apply → use pgvector → revert → re-apply. */
describe('migrations on PGlite', () => {
  let t: Awaited<ReturnType<typeof createTestDb>>;
  beforeAll(async () => {
    t = await createTestDb();
  });
  afterAll(async () => {
    await t.close();
  });

  const hasVector = async () =>
    (await t.client.query(`SELECT 1 FROM pg_extension WHERE extname = 'vector'`)).rows.length === 1;

  it('applies the initial migration and enables pgvector', async () => {
    expect(await hasVector()).toBe(true);
    const { rows } = await t.client.query<{ d: number }>(`SELECT '[1,2,3]'::vector <-> '[1,2,4]'::vector AS d`);
    expect(rows[0]!.d).toBeCloseTo(1);
  });

  it('reverts the last migration with its down pair, then re-applies', async () => {
    expect(await rollbackLast(t.client)).toBe('0000_init');
    expect(await hasVector()).toBe(false);
    expect(await rollbackLast(t.client)).toBeNull();
    await t.migrate();
    expect(await hasVector()).toBe(true);
  });
});
