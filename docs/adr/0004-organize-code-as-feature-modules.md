---
status: Accepted
owner: "Pavlo"
reviewers: []
updated_at: "2026-11-25"
feature_size: "n/a (foundation)"
ticket: ""
---

# 0004 — Organize code as feature modules with domain / application / infra layers behind a public `index.ts`

- **Status:** Accepted
- **Date:** 2026-11-25
- **Deciders:** Pavlo (owner), survey foundation session

## Context

In Next.js, `src/app/` defines routes, but where business logic lives is up to the project. zsj has distinct capabilities (archive, search, ingest, admin auth), external services that should stay swappable (embeddings, DB provider), and an SDD/TDD workflow that needs logic testable without a browser or Next.js runtime.

## Decision drivers

- Agent-driven TDD: use cases must be unit-testable in plain Vitest.
- Swappable adapters (ADR-0002, ADR-0003).
- New features should land in an obvious place, so `design` and `implement` slot in without re-deciding.

## Considered options

1. **Feature modules** — `src/modules/<module>/{domain,application,infra}` plus a public `index.ts`, with thin `src/app/` routes.
2. **Default Next.js layout** — `app/` pages and server actions with helpers in `lib/`, which tends to spread logic across pages and grow a catch-all `lib/`.

## Decision outcome

**Chosen:** Option 1. The initial modules are `issues`, `search`, `ingest` and `auth`, plus a shared kernel in `src/shared/` (`env`, `errors`, `ids`, `db`, `embeddings`). The rules:
- `domain/` is pure: no I/O, no `next/*`, no Drizzle.
- `application/` holds use cases that receive their ports as arguments.
- `infra/` holds the Drizzle repositories and external adapters.
- Everything outside a module imports only from its `index.ts`, enforced by an ESLint `no-restricted-imports` rule.
- Next.js APIs are used only in `src/app/`.

## Consequences

**Positive**
- Logic is tested without Next.js, and integration tests hit PGlite through the real repositories.
- Adapter swaps stay local to `infra/`.
- `architecture-map.md` gives every new feature a precise target path.

**Negative**
- More folders and a little wiring boilerplate (factory functions in `index.ts`) than a typical Next.js project.
- Developers must resist calling Drizzle from pages. The lint rule catches deep imports, but not every shortcut.

**Neutral**
- Modules communicate by direct calls. Events or queues are unnecessary at 12–24 issues/year, and adding them later would need a new ADR.

## Links

- Architecture map: [[../architecture-map.md]] §Module inventory, §Conventions
- Related ADR: [[0001-use-nextjs-typescript-single-app]], [[0003-use-external-embeddings-api-behind-port]]
