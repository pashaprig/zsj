---
status: Accepted
owner: "Pavlo"
reviewers: ["Pavlo"]
updated_at: "2026-11-28"
feature_size: "S"
ticket: "roadmap step 4 — cover-archive"
---

# 0002 — Serve public Covers through an app route with a 60-second cache

- **Status:** Accepted
- **Date:** 2026-11-28
- **Deciders:** Pavlo (Admin, site owner), during the design walk

## Context

Cover pictures are files under `COVERS_DIR` on the VPS disk, made by issue-create (a full Cover ≤ 300 KB and a thumbnail ≤ 60 KB per Language variant). Readers fetch them from archive tiles, Issue pages and link previews. The Cover of an unpublished variant must be «page not found» at any address, exactly like a missing one (spec AC-07, issue-create AC-11); after a replacement the new Cover must show within one minute, and the old address must lead to the new Cover (issue-create AC-08). Whatever serves the bytes has to apply the publication rule on every request.

## Decision drivers

- sad.md §1 quality goal 1 (visibility correctness) — no unpublished Cover leaks, whatever address is guessed (spec §6.1 abuse cases).
- Spec §6: replaced Cover visible ≤ 1 min; archive year page ≤ 1.6 MB for 24 tiles; Issue page ≤ 450 KB.
- One publication rule, owned by the `issues` module (sad.md §4), checked identically for pages and pictures.
- Dev, tests and the VPS should behave the same — nginx runs only on the VPS (architecture map §Constraints, Hosting).

## Considered options

1. **App route checks publication and streams the file, `Cache-Control: public, max-age=60` + ETag** — one stable address per variant and size.
2. **App route checks publication, nginx sends the bytes via `X-Accel-Redirect`** — the app authorizes, nginx serves the file from an internal location.
3. **Copy the Cover into a public static directory on publish** — nginx serves it directly; publish, re-publish and replacement keep the copy in sync.

## Decision outcome

**Chosen:** Option 1. A Next.js route handler outside the locale prefix (e.g. `/covers/<language>/<issue key>/<size>`, excluded from the locale middleware matcher in `src/proxy.ts`) asks the `issues` module whether that variant is Published, then streams the file with `Cache-Control: public, max-age=60` and an ETag, or answers 404. The stable address per variant and size satisfies «the old address leads to the new Cover»; the 60-second cache bounds staleness inside the one-minute freshness target; the same code runs in dev, tests and production. Option 2 saves Node work but needs nginx config that exists only on the VPS and can, if misconfigured, expose the directory past the check. Option 3 keeps the publication state in two places (database and file presence), so a failure mid-publish either leaks a Cover or loses one, and it makes the publish action in article-search responsible for files.

## Consequences

**Positive**
- The publication rule lives once in `issues` — defined in `domain`, executed by one SQL condition in `infra` — used by pages and pictures alike; an unpublished and a missing Cover both give the same 404.
- A replaced Cover reaches Readers within 60 s without any cache purge; repeat views get `304 Not Modified` via the ETag.
- Pages stay light: the thumbnail is sent as issue-create made it, with no resizing at request time.

**Negative**
- Every Cover request goes through the Node process: a first view of a year page is up to 24 picture requests plus a database check each.
- Readers may see the old Cover for up to 60 s after a replacement (inside the spec target).
- Requires issue-create to keep Covers findable by (language, issue key, size) — a constraint on a feature not yet designed (sad.md §11).

**Neutral**
- Moving the byte transfer to nginx (option 2) later only changes the route's response, not its addresses (a few hours plus the nginx config at deploy).

## Links

- Spec: [[../spec.md]] AC-07, AC-11, §6, §6.1
- SAD: [[../sad.md]] §4
- Related ADR: [[0001-render-archive-pages-per-request-without-page-cache]]
