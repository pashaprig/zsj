---
status: Accepted
owner: "Pavlo"
reviewers: []
updated_at: "2026-11-26"
feature_size: "n/a (foundation)"
ticket: ""
---

# 0006 — Ukrainian URLs without a prefix, Russian under `/ru`, no browser-language redirect

- **Status:** Accepted — supersedes [[0005-prefix-every-public-url-with-locale]]
- **Date:** 2026-11-26
- **Deciders:** Pavlo (owner)

## Context

ADR-0005 put every public URL under its locale (`/uk/…`, `/ru/…`) with `/` redirecting to `/uk`. Before launch, and before any public feature beyond the skeleton exists, the owner revisited it: Ukrainian is the site's main language, so its addresses should be the plain ones (`zoj.com.ua/archive`), with Russian as the marked variant (`zoj.com.ua/ru/archive`). Nothing is deployed yet, so no shared link breaks.

## Decision drivers

- Ukrainian is the default and main audience (idea brief §5) — its URLs should be the shortest and carry no language marker.
- A link must open the same page for everyone who follows it, and search engines should see stable pages per language.
- Change it now, while only the skeleton exists; after launch it would break links in the wild.

## Considered options

1. **Keep ADR-0005** (`localePrefix: 'always'`) — symmetric, but the main language carries a redundant `/uk` and `/` costs a redirect.
2. **Ukrainian at the root, Russian under `/ru`, with browser-language detection** (next-intl default) — a visitor with a Russian browser (or an earlier Russian choice in a cookie) is redirected from an unprefixed URL to `/ru`.
3. **Ukrainian at the root, Russian under `/ru`, no detection** — an unprefixed URL always opens Ukrainian; readers switch with the language switcher.

## Decision outcome

**Chosen:** Option 3. `src/i18n/routing.ts` sets `localePrefix: 'as-needed'` and `localeDetection: false`. Pages stay under `src/app/[locale]/`; the proxy (`src/proxy.ts`) maps unprefixed paths to the `uk` locale internally. Old-style `/uk/…` addresses redirect to their unprefixed form. The Admin area (`/admin`) stays outside locale routing and Ukrainian-only, as before.

## Consequences

**Positive**
- Ukrainian URLs are short and language-free; `/` serves the home page without a redirect.
- The same link shows the same language to everyone; no redirects keyed on browser headers for search engines to second-guess.

**Negative**
- Routes are asymmetric: building a URL must go through next-intl (`Link` / `getPathname` from `@/i18n/navigation`), never by hand-prefixing a locale.
- A Russian-speaking reader landing on an unprefixed link sees Ukrainian first and switches by one click.
- The language switcher's link to Ukrainian is rendered as `/uk/…` by next-intl and costs one redirect to the unprefixed URL.
- A future public path whose first segment is `ru` would collide with the locale prefix — avoid such slugs.

**Neutral**
- UI locale and content language stay separate concepts: an article's `language` field drives search (the UA→RU fallback rule), not the URL.

## Links

- Supersedes: [[0005-prefix-every-public-url-with-locale]]
- Idea brief: [[../idea-brief.md]] §5 (bilingual UI, Ukrainian by default)
- Architecture map: [[../architecture-map.md]] §Stack (i18n), §Conventions (i18n)
