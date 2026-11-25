---
status: Accepted
owner: "Pavlo"
reviewers: []
updated_at: "2026-11-25"
feature_size: "n/a (foundation)"
ticket: ""
---

# 0003 — Compute embeddings with an external multilingual API behind an `Embedder` port

- **Status:** Accepted
- **Date:** 2026-11-25
- **Deciders:** Pavlo (owner), survey foundation session

## Context

Semantic search needs text turned into vectors twice: when the admin indexes an article and when a reader submits a query. The model must handle Ukrainian and Russian well. The runtime is shared hosting with limited memory (ADR-0001), and the vectors live in pgvector (ADR-0002). Switching the model later means re-embedding the whole archive.

## Decision drivers

- Good multilingual (UA/RU) quality.
- No heavy ML runtime on shared hosting.
- Budget: negligible at 12–24 issues/year.
- Tests must not call the network.

## Considered options

1. **External embeddings API over HTTP (default candidate: OpenAI `text-embedding-3-small`)** — good quality, almost free at this volume, and no load on the hosting.
2. **Local model in Node via transformers.js (e.g. multilingual-e5-small)** — free and private, but ~120–450 MB of RAM/disk and slow cold starts, which almost certainly won't fit shared-hosting limits.

## Decision outcome

**Chosen:** Option 1. Callers depend only on an `Embedder` port (`embed(texts: string[]): Promise<number[][]>` plus the model id and dimension) in `src/shared/embeddings/`. The provider adapter lives next to it, and the API key is read through `src/shared/env/`. The choice is driven by quality, the hosting's memory limits and cost.

## Consequences

**Positive**
- Strong UA/RU quality with no ML runtime on the hosting.
- Swapping the provider is one adapter file plus a re-embed script.
- Tests use a deterministic fake `Embedder` and make no network calls.

**Negative**
- Needs an API key and outbound HTTPS from the hosting, and search depends on the provider being available.
- Reader queries are sent to a third-party provider (query text only, no personal data is collected by the site).

**Neutral**
- Each stored embedding records its model id, so a model change can be detected and re-embedded without guessing.
- The exact provider/model, dimension and chunking strategy are confirmed in `design` / `data-model` for the search and ingest features.

## Links

- Idea brief: [[../idea-brief.md]] §5, §6 risk 4
- Architecture map: [[../architecture-map.md]] §Stack, §Constraints
- Related ADR: [[0002-use-managed-postgres-with-pgvector]], [[0004-organize-code-as-feature-modules]]
