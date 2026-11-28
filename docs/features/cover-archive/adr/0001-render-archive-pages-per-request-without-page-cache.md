---
status: Accepted
owner: "Pavlo"
reviewers: ["Pavlo"]
updated_at: "2026-11-28"
feature_size: "S"
ticket: "roadmap step 4 — cover-archive"
---

# 0001 — Render archive pages per request without a page cache

- **Status:** Accepted
- **Date:** 2026-11-28
- **Deciders:** Pavlo (Admin, site owner), during the design walk

## Context

The archive year pages and Issue pages show only Published variants of the page's language (spec AC-07, AC-08), and a variant must appear «at the same moment its articles become readable — never before» (spec AC-10), with a replaced Cover visible within one minute (spec §6). The writes that change what these pages show live in other features: publishing and replacing articles (article-search, `ingest` module) and replacing a Cover (issue-create). Next.js can serve these pages from a page or data cache, but any cache needs a rule for when it goes stale, and that rule must be honoured by every one of those writes.

## Decision drivers

- Spec §2 goal: «the archive always tells the truth about what is published» — sad.md §1 quality goal 1.
- Spec §6: archive year page p95 ≤ 500 ms with 600 Issues; Issue page p95 ≤ 500 ms for a variant with 100 articles.
- Spec §6: replaced Cover visible ≤ 1 min; AC-10 «at the same moment».
- Small VPS (1 GB RAM), one process (sad.md §2); 12–24 issues a year, so the data is small and the read queries are cheap.

## Considered options

1. **Render per request, no page or data cache** — every request runs the `issues` read use cases against the database; the routes explicitly opt out of Next.js static rendering.
2. **Cache pages with time-based revalidation (ISR, ~60 s)** — Next.js keeps the rendered page and rebuilds it in the background at most once per interval.
3. **Cache pages and data with tags, invalidated on write** — publish, re-publish and Cover replacement call `revalidateTag` for the affected archive year and Issue page.

## Decision outcome

**Chosen:** Option 1. It makes the visibility rule true by construction — a page can only show what the database says right now — and needs nothing from the write side, so issue-create and article-search stay unaware of the archive. The data volume (≤ 24 tiles per year page, ≤ ~100 titles per Issue page) keeps each render to a few indexed queries, well inside the 500 ms budget on a warm connection. Option 2 lets a tile lag up to the interval behind an already readable article (breaks AC-10's «same moment»); option 3 makes every future write action responsible for cache keys, and one forgotten key shows Readers a stale archive.

## Consequences

**Positive**
- Publishing, re-publishing and replacing a Cover show up on the next request with no invalidation hooks in `ingest` or issue-create.
- Integration tests check visibility by seeding rows and rendering — no cache state to reset.
- No page cache held in memory or on disk on the 1 GB VPS.

**Negative**
- Every page view reads the database (2–4 queries); crawlers walking every year and Issue page add database load.
- After the Neon free tier has suspended for idleness, the first request pays a 0.5–1 s cold start and can exceed the p95 target (sad.md §11).
- Next.js renders a dynamic segment statically when it sees no dynamic API; each archive route must opt out explicitly, or pages would silently freeze (sad.md §11).

**Neutral**
- Switching to option 3 later is contained: add `"use cache"`/cache tags in the `issues` read path and one invalidation call in each write action (≈ 1–2 days), with this ADR superseded.

## Links

- Spec: [[../spec.md]] §2, §6, AC-07, AC-10
- SAD: [[../sad.md]] §4
- Related ADR: [[0002-serve-public-covers-through-an-app-route-with-60-second-cache]]
