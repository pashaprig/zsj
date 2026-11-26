import { describe, expect, it } from 'vitest';
import { parseEnv } from '@/shared/env';
import { NotFoundError, toErrorResponse } from '@/shared/errors';
import { newId } from '@/shared/ids';
import { routing } from '@/i18n/routing';
import uk from '../messages/uk.json';
import ru from '../messages/ru.json';
import { createFakeEmbedder } from './helpers/fake-embedder';

/** Skeleton smoke test: the app's module graph loads and its foundation contracts hold. */
describe('skeleton smoke', () => {
  it('every module barrel imports cleanly', async () => {
    for (const m of ['issues', 'search', 'ingest', 'auth']) {
      await expect(import(`@/modules/${m}/index.ts`)).resolves.toBeDefined();
    }
  });

  it('env schema accepts a complete env and rejects a missing var', () => {
    const env = {
      DATABASE_URL: 'postgres://u:p@localhost:5432/zsj',
      EMBEDDINGS_API_KEY: 'test-key',
      ADMIN_PASSWORD_HASH: 'test-hash',
      SESSION_SECRET: 'x'.repeat(32),
      COVERS_DIR: './covers',
    };
    expect(parseEnv(env).NODE_ENV).toBe('development');
    expect(() => parseEnv({ ...env, DATABASE_URL: undefined })).toThrow(/DATABASE_URL/);
  });

  it('domain errors map to the JSON error envelope', () => {
    expect(toErrorResponse(new NotFoundError('no issue'))).toEqual({
      status: 404,
      body: { error: { code: 'not_found', message: 'no issue' } },
    });
    expect(toErrorResponse(new Error('db exploded')).body.error.code).toBe('internal_error');
  });

  it('ids are UUIDv7', () => {
    expect(newId()).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  });

  it('uk and ru message files define the same keys', () => {
    const keys = (o: object, p = ''): string[] =>
      Object.entries(o).flatMap(([k, v]) => (typeof v === 'object' ? keys(v, `${p}${k}.`) : [`${p}${k}`]));
    expect(routing.locales).toEqual(['uk', 'ru']);
    expect(keys(ru).sort()).toEqual(keys(uk).sort());
  });

  it('Ukrainian URLs carry no prefix, Russian ones use /ru, no browser-language redirect (ADR-0006)', () => {
    expect(routing.defaultLocale).toBe('uk');
    expect(routing.localePrefix).toBe('as-needed');
    expect(routing.localeDetection).toBe(false);
  });

  it('fake embedder is deterministic and normalized', async () => {
    const e = createFakeEmbedder(8);
    const [a, b] = await e.embed(['здоров’я', 'здоров’я']);
    expect(a).toEqual(b);
    expect(Math.hypot(...a!)).toBeCloseTo(1);
  });
});
