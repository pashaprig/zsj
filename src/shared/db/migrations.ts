import { readFile } from 'node:fs/promises';
import path from 'node:path';

/** Minimal SQL surface shared by node-postgres and PGlite, so rollback works on both. */
export interface SqlRunner {
  query(text: string): Promise<{ rows: unknown[] }>;
  /** Runs one or more statements (no parameters). */
  exec(text: string): Promise<unknown>;
}

type JournalEntry = { idx: number; tag: string; when: number };

export const MIGRATIONS_FOLDER = path.resolve(process.cwd(), 'drizzle');

async function readJournal(folder: string): Promise<JournalEntry[]> {
  const raw = await readFile(path.join(folder, 'meta', '_journal.json'), 'utf8');
  return (JSON.parse(raw) as { entries: JournalEntry[] }).entries;
}

/**
 * Revert the most recently applied drizzle migration using its hand-written pair
 * `drizzle/down/<tag>.down.sql`, and remove its row from drizzle's migrations table.
 * drizzle-kit is forward-only, so this is the project's rollback (architecture map §Conventions).
 * Returns the reverted tag, or null when nothing is applied.
 */
export async function rollbackLast(runner: SqlRunner, folder = MIGRATIONS_FOLDER): Promise<string | null> {
  const applied = await runner.query(
    'SELECT id, created_at FROM drizzle.__drizzle_migrations ORDER BY created_at DESC LIMIT 1',
  );
  const last = applied.rows[0] as { id: number; created_at: string | number } | undefined;
  if (!last) return null;

  const entry = (await readJournal(folder)).find((e) => e.when === Number(last.created_at));
  if (!entry) throw new Error(`Applied migration (created_at=${last.created_at}) is not in the journal`);

  const downSql = await readFile(path.join(folder, 'down', `${entry.tag}.down.sql`), 'utf8');
  await runner.exec(
    `BEGIN;\n${downSql}\nDELETE FROM drizzle.__drizzle_migrations WHERE id = ${Number(last.id)};\nCOMMIT;`,
  );
  return entry.tag;
}
