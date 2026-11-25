---
status: Accepted
owner: "Pavlo"
reviewers: []
updated_at: "2026-11-25"
feature_size: "n/a (foundation)"
ticket: ""
---

# 0005 — Prefix every public URL with its locale (`/uk/…`, `/ru/…`), with `/` redirecting to `/uk`

- **Status:** Accepted
- **Date:** 2026-11-25
- **Deciders:** Pavlo (owner), survey foundation session

## Context

The UI is bilingual with Ukrainian as the default (brief §5). Every public page exists in two locales. The URL scheme fixes the `src/app/` folder structure and every link shared after launch, so changing it later breaks links in the wild.

## Decision drivers

- Bilingual UI, Ukrainian by default (owner decision).
- Search engines should see the two language versions as separate pages.
- A simple, symmetric routing model for agents and reviewers.

## Considered options

1. **Ukrainian without a prefix, Russian under `/ru`** (`localePrefix: 'as-needed'`) — shorter URLs for the main audience, but asymmetric routes and more middleware logic.
2. **Both locales prefixed** (`localePrefix: 'always'`) — `/uk/archive`, `/ru/archive`, and `/` redirects to `/uk`.

## Decision outcome

**Chosen:** Option 2. The owner preferred the symmetric scheme in which the locale is always visible in the URL. It is implemented with `next-intl` routing in `src/i18n/` and pages under `src/app/[locale]/`. The admin area (`/admin`) is excluded from locale routing and is Ukrainian-only.

## Consequences

**Positive**
- One uniform route shape. `hreflang` alternates and the language switcher are trivial.
- Every URL states its language unambiguously.

**Negative**
- Every public URL is 3 characters longer, and `/` costs one redirect.

**Neutral**
- UI locale and content language are separate concepts: an article's `language` field drives search (the UA→RU fallback rule), not the URL prefix.

## Links

- Idea brief: [[../idea-brief.md]] §5 (bilingual UI, search language rule)
- Architecture map: [[../architecture-map.md]] §Stack (i18n), §Conventions (i18n)
- Related ADR: [[0001-use-nextjs-typescript-single-app]]
