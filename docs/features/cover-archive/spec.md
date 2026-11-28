---
status: Draft
owner: "Pavlo"
reviewers: ["Tech Lead", "Security Lead"]
updated_at: "2026-11-28"
feature_size: "S"
---

# Spec — cover-archive

> **Glossary:** [CONTEXT (project)](../../../CONTEXT.md)
> **Reference module / docs / channels used:** [`docs/idea-brief.md`](../../idea-brief.md) §3, §5, §7; [`docs/roadmap.md`](../../roadmap.md) step 4 and decision D4; [`docs/architecture-map.md`](../../architecture-map.md) §Conventions (IDs — readable addresses), §Constraints; [`../issue-create/spec.md`](../issue-create/spec.md) (AC-05, AC-07, AC-08, AC-11, §6 Cover sizes, §8 language-switch question); [`../article-search/spec.md`](../article-search/spec.md) (AC-06, AC-07, AC-14, AC-15, AC-18 — the article pages an Issue page leads to); the current language switcher `src/components/language-switcher.tsx` (keeps the page path when switching).

## 1. Context

A Reader of «Здоровий спосіб життя» who knows the paper by its front pages — or who has just read one article — has no way to see what the paper has published on the new site, which so far reaches articles only through search (article-search). The brief's public part starts with «the archive of issue covers» (brief §7): a Reader browses the covers of one language, opens an Issue, sees which articles it carries, and goes on to read them or to subscribe.

Why now: roadmap step 4 sits after Issue creation (step 3) and before article search (step 5), whose result cards reuse the archive's issue tile, and the home page of step 7 shows the latest issue from it. Nothing is published until article-search lets the Admin publish a variant's articles (issue-create AC-11, article-search AC-14), so the archive is built and checked at step 4 with sample published variants and goes live together with search — the site launches in one go (roadmap, Decisions so far). The parts that need article-search's own pages and actions — AC-09 on article pages and AC-10 — are checked at step 5.

**Committed approach.** Each language version of the site has its own Archive of Published variants, shown one year at a time — the newest year first, a year switcher listing only the years that have something to show — as Cover tiles with the issue number and year. A tile opens the variant's Issue page: its Cover, its number and year, the titles of all its Articles in the paper's order (each opening the article page), links to the previous and next issue of the same language, and the Subscribe call. Everything follows the rules already fixed for Issues: only published variants exist for Readers, each language stands on its own, addresses are the year and the two-digit number(s). The direction is settled by the brief (§7) and needs no market comparison; at the chosen interview depth (easy) no ideation analyses ran, and the reversible choices below were made by default and confirmed by the owner as a batch.

Traceability and decisions recorded during this specify run:
- **Decision: one year at a time** — the archive grows to about 600 Issues since 2002 (issue-create §6); showing every Cover on one page would make it heavy on a phone, so each year has its own page and address, and the archive opens on the newest year that has a published variant in this language.
- **Decision: the language switch never leads from one Language variant to the other** — closes issue-create §8 («Do the public language switch and the pages' alternate-language hints … ever lead from one Language variant of an Issue to the other?»). On an Issue page or an article page the switch leads to the other language's Archive, at the same year when that language has a published variant in it, otherwise at its newest year; archive year pages link to each other across languages, Issue and article pages carry no other-language counterpart for search engines. This also governs the article pages of article-search, whose non-goals already exclude links between variants. Consequence: the current switcher, which keeps the page path, must change for Issue and article pages.
- **Decision: the Issue page lists titles only** — no Excerpts, no tags (tags are never shown to Readers, article-search AC-13b), no reading of the printed pages (the site keeps no PDF).
- **Decision: the archive builds on issue-create's tile rules** — a double issue reads «№7–8, 2026» and sorts by its higher number, as in the Admin's list (issue-create AC-07).

## 2. Goals

- A Reader can see, in the language they read, every issue the paper has published on the site and open any of them in a couple of clicks.
- Every archive and Issue page leads the Reader further into the paper — to its articles, to neighbouring issues — and invites them to subscribe to the print edition.
- The archive always tells the truth about what is published: a variant appears there the moment its articles are published, and nothing unpublished, or from the other language, ever shows or leaks.

## 3. Non-goals

- **Reading the printed pages** (a page-by-page view or a PDF download) — the site keeps text and the Cover only, never the issue PDF (architecture map §Constraints).
- **Filtering or searching inside the archive** (by month, topic or number) — at 12–24 issues a year a year page is short enough to scan, and finding by topic is what search is for (article-search).
- **Showing Issues whose articles are not published** (cover-only back issues) — an archive tile must always lead to articles (issue-create §3).
- **The two magazines** — they are separate Publications added later (roadmap, Not yet specified); the archive covers the newspaper only.
- **The latest issue on the home page** — that is roadmap step 7, which reuses this feature's tile.

## 4. User stories

### US-01: Browse the covers of my language

**As a** Reader
**I want** to see the Covers of the published issues in the language of the site version I use, newest first
**So that** I recognise the issues I know and pick one to look into

### US-02: Move between years

**As a** Reader
**I want** to switch the archive to another year and come back to a year by its address
**So that** I can reach older issues without scrolling through the whole archive

### US-03: Open an issue and see its articles

**As a** Reader
**I want** to open an issue and see its Cover and the titles of all its articles in the order of the paper
**So that** I know what the issue carries and can open any article

### US-04: Keep going through the paper

**As a** Reader
**I want** to move from one issue to the previous or next one, and to find the Subscribe call on the archive and issue pages
**So that** I keep exploring the paper and can subscribe to the print edition when I want more

### US-05: Share an issue and find it from outside

**As a** Reader
**I want** each issue and each archive year to have a stable, readable address that shows the Cover when shared and that search engines can list
**So that** I and others can come back to an issue later or arrive at it straight from a search engine

### US-06: Switch language without losing my way

**As a** Reader
**I want** switching the site's language to take me to the archive in that language
**So that** I keep browsing the paper in the language I chose, without landing on a page that does not exist

### US-07: See a published issue appear in the archive

**As an** Admin
**I want** a variant to appear in the archive the moment I publish its articles, and its Cover to update when I replace it
**So that** I never need a separate step to show an issue to Readers

## 5. Acceptance criteria

### AC-01 (US-01) — happy path

**Given** the Russian variants of Issues №9, №10 and the double issue №7–8 of 2026 are published, and a Reader is on the Russian version of the site
**When** the Reader opens the archive
**Then** the Reader sees the newest year that has a published Russian variant (2026) and its tiles, newest first — №10, №9, №7–8 (a double issue sorts by its higher number) — each showing the variant's Cover thumbnail and its number and year («№7–8, 2026»); every tile opens that variant's Issue page; the page also shows one Subscribe call

### AC-02 (US-02) — happy path (years)

**Given** Russian variants are published for 2024, 2025 and 2026, and none for 2023
**When** a Reader on the Russian archive switches to 2025
**Then** the Reader sees the published Russian variants of 2025 in the same form as AC-01; the year switcher lists 2026, 2025 and 2024 only, newest first, with the shown year marked; the year page has its own address with the year, which opens the same view when bookmarked or shared, and the archive's own address always shows the newest year

### AC-03 (US-02) — error (a year with nothing to show)

**Given** no Russian variant of 2023 is published
**When** a Reader opens the Russian archive address for 2023, or for a year that is not a year of the paper (for example 1990, 3000 or a word)
**Then** the Reader sees the site's «page not found» page in the site's language, which offers the archive and search (article-search AC-07); the archive never shows an empty year

### AC-04 (US-01) — happy path (empty archive)

**Given** no variant in the language of the site version has been published yet
**When** a Reader opens the archive
**Then** the Reader sees that issues will appear here soon and the Subscribe call, with no year switcher and no empty tiles

### AC-05 (US-03, US-04) — happy path (Issue page)

**Given** the Russian variant of Issue №11 of 2026 is published with 78 articles, and the Russian variants of №10 and №12 of 2026 are published
**When** a Reader opens its tile in the archive
**Then** the Reader sees the variant's full Cover, «№11, 2026», the number of articles and the titles of all 78 articles in the order they appear in the paper, each opening its article page (article-search AC-06); a link to the previous issue (№10, 2026) and the next issue (№12, 2026) of the same language, crossing year boundaries, with a link left out when there is no such published issue; a way back to the archive at 2026; and the Subscribe call

### AC-06 (US-03) — error (an address that is not an Issue)

**Given** Issue №11 of 2026 has a published Russian variant and the double issue №7–8 of 2026 has one too
**When** a Reader opens a Russian Issue page address that does not match a published Russian variant — a number that was never created, a number without its two digits, only one number of a double issue («2026-07» or «2026-08», issue-create §1), or text that is not a year and number
**Then** the Reader sees the «page not found» page that offers the archive and search, and is never taken to a different Issue

### AC-07 (US-01, US-03) — authorization (unpublished variants stay hidden)

**Given** Issue №12 of 2026 has a Russian variant with its Cover, and none of its articles are published (issue-create AC-11)
**When** a Reader browses the Russian archive for 2026, opens the address that would be its Issue page or its Cover picture, or follows the «next issue» link from №11
**Then** the Reader sees nothing of it — no tile, no Cover, no year in the switcher that only it would fill, «page not found» for its addresses exactly as for an Issue that never existed, and the «next issue» link of №11 skips it; a Reader cannot tell an unpublished variant from a missing one

### AC-08 (US-01, US-03) — domain invariant (one language per page)

**Given** Issue №11 of 2026 has a published Russian variant and no published Ukrainian one, and Issue №3 of 2021 has only a Russian variant (the paper came out in Russian only before 2022)
**When** a Reader browses the Ukrainian archive or opens any Issue page
**Then** the Ukrainian archive shows neither №11 of 2026 nor any year before 2022 that has no Ukrainian variant, every tile, article title and previous/next link on a page belongs to the same language as that page, and no archive or Issue page tells the Reader whether an Issue has, or lacks, a variant in the other language (issue-create AC-05)

### AC-09 (US-06) — happy path (language switch)

**Given** a Reader is on the Ukrainian Issue page of №11 of 2026, and the Russian version has published variants in 2026
**When** the Reader switches the site to Russian
**Then** the Reader lands on the Russian archive at 2026 — never on the Russian variant of the same Issue, whether or not it exists; when the other language has no published variant in that year, the Reader lands on its archive at its newest year (or on its empty archive, AC-04); the same applies when switching from an article page (checked at roadmap step 5, when article pages exist); on an archive year page the switch keeps the year when the other language has a published variant in it, otherwise it shows that language's newest year

### AC-10 (US-07) — cross-context (publishing and Cover changes reach the archive)

*Checked at roadmap step 5 (article-search), which brings the publishing and replacing actions.*

**Given** the Admin publishes the Ukrainian variant of Issue №12 of 2026 (article-search AC-14), later replaces its Cover (issue-create AC-08), and later replaces its articles with a corrected set (article-search AC-15)
**When** a Reader browses the Ukrainian archive and opens that Issue page after each of these steps
**Then** the variant's tile and Issue page appear at the same moment its articles become readable — never before, and never while the Admin only has a preview; within one minute of the Cover replacement the archive and the Issue page show the new Cover; after the articles are replaced the Issue page lists only the new set of articles in the paper's order

### AC-11 (US-05) — happy path (addresses and sharing)

**Given** the Russian variant of Issue №11 of 2026 is published
**When** a Reader copies its Issue page address, shares it, or a search engine visits the archive
**Then** the Issue page has exactly one address on the Russian version of the site, built from the year and the two-digit number(s) — «2026-11», «2026-03», «2026-07-08» for a double issue, never an internal number — which opens the same page for anyone; a shared link previews with the variant's Cover, the paper's name and «№11, 2026» in the language of the variant; the archive year pages and Issue pages are open to search engines, and each archive year page names its counterpart year page in the other language for search engines when that year has a published variant there

## 6. Non-functional requirements

| Aspect | Target | Measurement |
|---|---|---|
| Latency p95 — archive year page | ≤ 500 ms with 600 Issues in the database | server timing on archive requests; integration test with 600 seeded Issues |
| Latency p95 — Issue page | ≤ 500 ms for a variant with 100 articles (same as the article page, article-search §6) | server timing on Issue page requests |
| Page weight — archive year page | ≤ 1.6 MB transferred for a year of 24 issues, Covers included (thumbnails ≤ 60 KB each, issue-create §6); tiles below the first screen load only when scrolled to | browser network panel on the integration environment, phone profile |
| Page weight — Issue page | ≤ 450 KB transferred, the full Cover included (≤ 300 KB, issue-create §6) | browser network panel on the integration environment |
| Phone width | every archive and Issue page usable at 360 px wide with no sideways scrolling; at least 2 tiles per row | e2e check at 360 px |
| Freshness — replaced Cover | ≤ 1 min until the archive and Issue page show the new Cover (issue-create AC-08; appearing on publish is a rule in AC-10) | integration test; manual check on the VPS |
| Availability | 99% monthly, as for all public pages | uptime check on the VPS |

## 6.1 Security / privacy

- **Data classification:** public — archive and Issue pages show only Published variants, whose Covers, numbers and article titles are meant for everyone; unpublished variants stay internal (issue-create §6.1).
- **Personal data touched:** none — the pages show Covers, numbers and article titles; no Reader data is asked for or kept.
- **AuthZ/AuthN impact:** no new capability or sign-in. One read rule, applied to every page and every Cover picture of this feature: only Published variants of the page's language are ever shown, and an unpublished or missing variant gives the same «page not found» (AC-07, AC-08).
- **Abuse cases:**
  - Guessing the address of the next issue or its Cover before the Admin publishes it: «page not found», indistinguishable from a number that never existed (AC-07).
  - Probing which Issues have a variant in the other language, through the language switch or alternate-language hints: the switch and the hints never point from one variant to the other (AC-09, AC-11).
  - Injection through the address (a year or number made of markup or script): such addresses are «page not found», and nothing from the address is shown back as markup (AC-03, AC-06).
  - Crawling every year and Issue page: everything served is public; pages stay within their own latency targets (§6).
- **Security review:** N/A — read-only public pages over data that is already public, no new sign-in boundary, no new input beyond the page address, no personal data; the Cover-serving rules are reviewed with issue-create.

## 7. Metrics / KPIs

The owner decided not to measure Reader behaviour on the site itself (roadmap D4); these KPIs are measured by the owner or by tests, plus one that waits for the owner's web analytics.

- **Archive completeness** — baseline: 0 published variants on the site; target: 100% of published variants shown in their language's archive and 0 unpublished ones, at the owner's monthly check for the first 6 months after launch.
- **Broken tiles and links** — baseline: 0 (nothing published yet); target: 0 missing Covers or dead previous/next/article links at the owner's monthly check.
- **Page speed at launch** — baseline: none (pages do not exist); target: both pages within their §6 latency targets in the first week on the VPS.
- **Readers reaching articles through the archive** — baseline: TBD — measured with the web analytics the owner adds after launch (D4); target: set by the owner once the first month of data exists.

## 8. Open questions

None — every decision of this spec was made by default and confirmed by the owner (§1). Resolved here: issue-create §8 «Do the public language switch and the pages' alternate-language hints ever lead from one Language variant of an Issue to the other?» — no (AC-09, AC-11).
