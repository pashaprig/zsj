---
status: Accepted
owner: "Pavlo"
reviewers: []
updated_at: "2026-11-25"
feature_size: "n/a (foundation)"
ticket: ""
---

# 0002 — Store all data and vectors in managed PostgreSQL with pgvector, accessed via Drizzle

- **Status:** Accepted
- **Date:** 2026-11-25
- **Deciders:** Pavlo (owner), survey foundation session

## Context

The site stores issues and articles in two languages and searches articles by meaning, which means storing an embedding vector per article chunk and finding the nearest vectors to a query. The volume is small but growing: about 1,000 articles a year, and tens of thousands once the older archive is back-filled. Shared hosting offers MySQL/PostgreSQL but almost certainly not the `vector` extension, and its memory is limited.

## Decision drivers

- Semantic search via a vector store (owner's wording: «векторна БД», brief §5).
- Budget ≤ 500–1000 UAH/month for extra services.
- Shared-hosting memory limits, so vectors must not be scanned in the Node process.
- Data should survive a possible hosting move (ADR-0001).
- No Docker locally, so tests need a DB that runs in-process.

## Considered options

1. **Managed PostgreSQL + pgvector (e.g. Neon)** — one database for relational data, vectors and full-text search, with backups by the provider.
2. **MySQL on the hosting + brute-force similarity in Node** — no external service, but all vectors would be held in process memory.
3. **SQLite + sqlite-vec on the hosting** — a single file with no external service, but native modules on shared hosting and a young extension.

DB access: **Drizzle ORM + drizzle-kit** (chosen) vs Prisma (no native `vector` type, engine binary) vs Kysely + hand-written migrations (the schema described twice).

## Decision outcome

**Chosen:** Option 1, managed PostgreSQL with `pgvector` (Neon as the default provider, free tier at launch). Access goes through Drizzle ORM, and drizzle-kit generates SQL migrations in `drizzle/`. It is the only option that is a real vector store, keeps vector math out of the hosting's memory, fits the budget and is independent of the hosting. Drizzle supports `vector(N)` and distance operators natively, is pure JS, and runs against both Neon and PGlite.

## Consequences

**Positive**
- One store for issues, articles, chunks and embeddings, so search can join vectors with metadata (language, issue) in one query.
- Tests run against PGlite (in-process WASM Postgres with pgvector) with the same schema and migrations.
- A hosting move doesn't touch the data.

**Negative**
- An external dependency: every request crosses the network to the provider (+30–50 ms from Ukraine to an EU region).
- The free tier suspends when idle, so the first query after a pause is ~0.5–1 s slower.
- drizzle-kit is forward-only, so rollbacks need hand-written `drizzle/down/*.down.sql` files and a small `db:down` script.

**Neutral**
- The provider can be swapped for any Postgres with pgvector (Supabase, RDS, a VPS) by changing `DATABASE_URL`.
- The vector dimension and index type (HNSW vs IVFFlat) are decided in `data-model`, not here.

## Links

- Idea brief: [[../idea-brief.md]] §5, §6 risks 1 and 4
- Architecture map: [[../architecture-map.md]] §Datastores, §Conventions (Migrations)
- Related ADR: [[0003-use-external-embeddings-api-behind-port]]
