---
status: Accepted
owner: "Pavlo"
reviewers: ["Pavlo"]
updated_at: "2026-11-28"
feature_size: "S"
ticket: "roadmap step 4 — cover-archive"
---

# 0003 — Switch language through a year hint on the archive

- **Status:** Accepted
- **Date:** 2026-11-28
- **Deciders:** Pavlo (Admin, site owner), during the design walk

## Context

The current `LanguageSwitcher` (in the site header, rendered by the locale layout) keeps the page path when switching. Spec AC-09 needs something else: from an Issue page or an article page the switch leads to the other language's Archive at the same year when that language has a Published variant in it, otherwise at its newest year (or its empty archive) — never to the other variant of the same Issue, whether or not it exists. On an archive year page it keeps the year under the same rule. The switch must not reveal whether an Issue has a variant in the other language (spec §6.1). The layout does not know the page's route parameters.

## Decision drivers

- Spec AC-09 and §6.1 abuse case «probing which Issues have a variant in the other language».
- sad.md §1 quality goal 2: no extra database work on the Issue page and article page just to draw the header.
- One mechanism for this feature and article-search's article pages (roadmap step 5).

## Considered options

1. **Year hint + archive redirect** — the header switcher maps the current path to the other language by a pure function: Issue, article and archive year paths become `<other>/archive?year=YYYY`; every other path keeps its path. The archive root resolves the hint and redirects (307) to that year if it has a Published variant in that language, else to the newest year, else shows the empty archive.
2. **Each page computes the exact destination** — the page queries the database for the other language's matching year and hands the link to the switcher (moved into the page or fed through a context).
3. **A dedicated switch route** — the switcher always links to `/switch?to=<lang>&from=<path>`, which resolves the destination on the server and redirects.

## Decision outcome

**Chosen:** Option 1. The link is built from the year in the current address only, so it carries no knowledge of the other language's data and cannot leak it; the one database lookup happens in the other language's archive, which needs it anyway. The switcher stays a self-contained header component, and the path mapping is a pure function covered by unit tests. Option 2 adds a query to every Issue and article page and breaks whenever a new page forgets to pass the link; option 3 adds a service route that crawlers follow and that needs open-redirect protection because it takes a path from the query.

## Consequences

**Positive**
- No database work on the source page; the header stays in the layout.
- Article pages (article-search) get AC-09 for free as long as their addresses carry the issue key (planned «2026-11/…», article-search AC-18).
- The hint only ever lands on the archive, so a wrong or crafted hint degrades to the newest year — never to «page not found» and never to another site.

**Negative**
- One extra round trip (the 307 redirect) on a language switch from those pages.
- The archive root gains an optional `year` query parameter — a second way into the same views; the redirect keeps each view at its one address.
- The switcher must recognise the shapes of Issue, article and archive year paths; a new page type under the archive needs a mapping rule.

**Neutral**
- The alternate-language hints for search engines (spec AC-11) are separate: only archive year pages declare their counterpart, computed on the server; the switcher is not involved.

## Links

- Spec: [[../spec.md]] AC-09, AC-11, §6.1
- SAD: [[../sad.md]] §4
- Related ADR: [[0001-render-archive-pages-per-request-without-page-cache]]
