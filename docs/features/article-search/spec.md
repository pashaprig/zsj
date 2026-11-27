---
status: Draft
owner: "Pavlo"
reviewers: ["Tech Lead", "Security Lead"]
updated_at: "2026-11-27"
feature_size: "L"
---

# Spec — article-search

> **Glossary:** [CONTEXT (project)](../../../CONTEXT.md) · [CONTEXT (feature)](./CONTEXT.md)
> **Reference module / docs / channels used:** the interview of 2026-11-27; [`docs/idea-brief.md`](../../idea-brief.md) §2, §3, §5, §7; [`docs/roadmap.md`](../../roadmap.md) step 5 and decisions D1, D3, D4; [`docs/architecture-map.md`](../../architecture-map.md) §Stack, §Constraints; [`../admin-login/spec.md`](../admin-login/spec.md) (Admin area rules); a sample Language edition file `newspappers/11.2026/11 rus 2026.docx` (Issue №11, November 2026, Russian edition), inspected for its structure.

## 1. Context

Readers of «Здоровий спосіб життя» (ЗСЖ) cannot find the articles they need by what the articles are about: the current site at zoj.com.ua has no search by meaning and no admin, and new issues are hard to add (brief §2). A Reader with a health question («як знизити тиск без ліків») should find the articles of the newspaper that answer it — and, having read one, want more of the paper and subscribe to the print edition. The paper is monthly, every Issue comes out in two identical Language editions (Ukrainian and Russian), and one Admin adds them.

Why now: this is the core of the new site — the archive and info pages exist only to lead here (roadmap step 5). The launch carries the 2026 issues; older issues follow through the same flow. Nothing is deployed yet, so the reading and publishing model can still be set freely; the feature is also the workshop's main practice piece.

Committed approach: **search by meaning plus a light reading funnel.** A Reader's natural-language query returns up to ten cards (title, the best-matching Excerpt, the edition's cover, issue number and month); weak matches are cut and an honest «nothing found» points to the archive; the search page carries a Subscribe call. Each card opens a public, shareable, search-engine-visible article page with the full text, a «More from this issue» block, a «Similar articles» block (articles from other issues sharing a tag), and a Subscribe call — all within one language. The Admin uploads one Word file per Language edition; the site proposes the split into articles, the Admin corrects it, gives every article at least one tag, and publishes the edition in one step. Grounds: the analyst rated the «search + light funnel» approach positive on all three lenses (engineer, executive, UX) where plain search had «article dead-ends» and the full funnel cost L effort plus a forced embargo; the researcher found no reader-facing product that answers a plain-language health question in Ukrainian or Russian with an excerpt tied to an issue and its cover (only one semantic archive, internal to its newsroom); the sharpest failure mode the adversary found — a public search that costs money on every query — is met by usage limits and a graceful «search unavailable» state (§5, §6). RICE: Reach ≈1000 Readers/quarter (assumption — no traffic data) × Impact 2 × Confidence 50% ÷ Effort 2 person-months = **500** (A ≈400, B ≈400). Feasibility: tech ☑ foundation only (the project skeleton is built; no code of this feature yet) · skills ◐ the owner is learning, mitigated by building test-first · time ☑ no launch deadline.

Traceability and owner decisions recorded during this specify run:
- **Decision override: full article text is public** — rationale: owner correction 2026-11-27; supersedes brief §5 «public full text — excluded» and the brief §7 trade-off. The freshest-issue delay is handled by the Admin publishing an issue later, not by the site (owner decision 2026-11-27).
- **Decision refinement: the split is proposed by the site and confirmed by the Admin** — rationale: the sample edition file has no generated table of contents and no standard headings; titles are marked by ~15 layout styles, some titles span two paragraphs, short letters and poems sit between long articles. Refines roadmap D3 («the Word file is already divided into articles … the system does not propose a split»): the file *is* divided by its titles, but the site must read those titles and the Admin must check the result.
- **Decision: tags.** Every article carries at least one tag (e.g. «Панкреатит», «ЖКТ»); «Similar articles» are found by shared tags (owner decision 2026-11-27).
- **Decision: tags are free text with suggestions** — same-language suggestions, letter case and extra spaces ignored, the paper's rubric labels offered as tags, no issue-number tags (owner decision 2026-11-27).
- **Decision: the search language is the site version's language** — not guessed from the question's letters, because short health queries («тиск», «диабет») are shared by both languages (owner decision 2026-11-27; refines brief §5 «Ukrainian query»).
- **Decision: letters' personal details** — the Admin may edit an article's text in the preview (e.g. drop a street address) and is responsible for what is published (owner decision 2026-11-27).
- **Decision: search-engine descriptions per article** — prefilled, editable by the Admin before publishing (owner decision 2026-11-27).
- **Decision: a Subscribe call on the search page too** — once on the results and «nothing found» pages, not on every card (owner decision 2026-11-27, keeps brief §7 / roadmap D4).
- **Decision: Word only.** PDF stays out (owner decision 2026-11-27; D1 — PDFs do carry a text layer, but are not needed).

## 2. Goals

- A Reader who asks the newspaper a question in their own words gets the paper's own articles that answer it — or an honest «nothing found» — in the language they read.
- Every article page keeps the Reader reading the paper (more from this issue, similar articles) and ends with a clear Subscribe call, so the site builds the wish to subscribe to the print edition.
- The Admin turns a Language edition's Word file into published, searchable, tagged articles in one sitting, without hand-copying articles one by one and without publishing a wrong split.

## 3. Non-goals

- **PDF upload** — Word files exist for the issues being published; reading articles out of a page layout is a separate, harder problem (owner decision 2026-11-27).
- **Links between the two Language editions** (the same article in the other language, a «read in Russian» switch on an article) — the owner wants each language to stand on its own.
- **An embargo or paywall on the freshest issue** — the Admin controls timing by publishing an issue when they choose; the site does not gate any published article.
- **On-site analytics or tracking of searches and clicks** — the owner adds web analytics to the site later (roadmap D4); this feature stores no reader behaviour.
- **Editing an article's text or tags one by one after publishing** — corrections go through re-uploading the edition (US-08); a per-article editor can be a later feature.
- **Images inside articles** — the Word files carry text only; each edition has one cover image, uploaded when the Issue is created (roadmap step 3).
- **Pages listing all articles with a given tag** — tags drive «Similar articles» only; tag browsing can come later.

## 4. User stories

### US-01: Search articles by meaning

**As a** Reader
**I want** to type a question or a topic in my own words and get the newspaper's articles that are about it
**So that** I find what the paper wrote on my problem without knowing the exact title or issue

### US-02: Know honestly when nothing matches

**As a** Reader
**I want** to be told plainly when the paper has nothing on my question, and where to look instead
**So that** I don't waste time on articles that only look related

### US-03: Get Russian articles when no Ukrainian ones match

**As a** Reader searching on the Ukrainian version of the site
**I want** to see matching Russian-edition articles, clearly marked as such, when no Ukrainian article matches
**So that** I still get an answer the paper published, knowing it is in Russian

### US-04: Read the full article

**As a** Reader
**I want** to open a search result and read the whole article with the issue it came from and its cover
**So that** I get the full answer and see which issue of the newspaper it belongs to

### US-05: Keep reading the newspaper

**As a** Reader
**I want** to see, under an article, the other articles of the same issue and similar articles from other issues, and an invitation to subscribe
**So that** I discover more of the paper and can subscribe to the print edition when I want more

### US-06: Upload a Language edition and check its split

**As an** Admin
**I want** to upload the Word file of one Language edition and see the articles the site found in it before anything is published
**So that** I can correct a wrong split instead of publishing broken articles

### US-07: Tag the articles and publish the edition at once

**As an** Admin
**I want** to give each article its tags and publish all of the edition's articles together
**So that** the whole edition becomes readable and searchable in one step, with «Similar articles» working from day one

### US-08: Replace an edition's articles after a fix

**As an** Admin
**I want** to upload a corrected Word file for an edition that is already published and replace its articles after confirming
**So that** fixing a typo doesn't leave duplicates in search or break the links Readers already shared

### US-09: Share and find articles from outside the site

**As a** Reader
**I want** each article to have a stable, readable address that I can share and that search engines can show
**So that** I and others can come back to the article later or arrive at it straight from a search engine

### US-10: Describe each article for search engines

**As an** Admin
**I want** every article to carry the descriptions search engines and link previews use — a page title and a short description — filled in for me and editable before publishing
**So that** each article shows up well in search engines and when shared, and brings new Readers to the paper

## 5. Acceptance criteria

### AC-01 (US-01) — happy path

**Given** the Ukrainian and the Russian editions of several Issues are published, and a Reader is on the Ukrainian version of the site
**When** the Reader searches for «як знизити тиск без ліків»
**Then** the Reader sees at most 10 results, closest first, each showing the article title, the Excerpt that best matches the question, the cover of the article's Language edition, the issue number and month; the results page also shows one Subscribe call

### AC-02 (US-01) — error

**Given** a Reader is on the search
**When** the Reader submits an empty query, a query of only spaces or punctuation, or a query longer than 200 characters
**Then** the site does not search and tells the Reader that the question must contain from 1 to 200 characters of text, keeping what they typed

### AC-03 (US-01) — error (search unavailable)

**Given** search is temporarily unavailable (the paid search service fails or the site's search usage limit is reached)
**When** a Reader searches
**Then** the Reader is told that search is temporarily unavailable and is offered the issue archive; every other page of the site keeps working

### AC-03b (US-01) — error (too many searches)

**Given** a Reader has made 20 searches within the last minute from the same address
**When** the Reader searches again
**Then** the site does not search and asks the Reader to try again in a minute, while other Readers' searches keep working; the site keeps no record of the Reader's queries

### AC-04 (US-02) — happy path (nothing matches)

**Given** no published article matches the question closely enough in the language of the site version the Reader searches on — and, on the Ukrainian version, none in the Russian editions either (AC-05)
**When** a Reader searches for «ремонт автомобіля»
**Then** the Reader sees «nothing found» with a link to the issue archive and the Subscribe call, and no loosely related articles are shown

### AC-05 (US-03) — cross-context (language rule)

**Given** a Reader searches on the Ukrainian version of the site, and no Ukrainian-edition article matches closely enough, but Russian-edition articles do
**When** the search completes
**Then** the Reader sees the matching Russian-edition articles under a notice that nothing was found in Ukrainian and these articles are in Russian; a Reader searching on the Russian version of the site only ever gets Russian-edition articles. The language of a search is the language of the site version the Reader searches on, whatever alphabet the question is typed in

### AC-06 (US-04) — happy path

**Given** an article of a published Language edition
**When** a Reader opens it from a search result
**Then** the Reader sees the article title, its full text with its paragraphs and sub-headings, the cover of its Language edition, the issue number and month, and the Subscribe call at the end of the text

### AC-07 (US-04) — error

**Given** an article address that never existed or whose article was removed by a re-upload
**When** a Reader opens it
**Then** the Reader sees a «page not found» page in the site's language that offers search and the issue archive

### AC-08 (US-05) — happy path

**Given** a Reader reads an article of the Russian edition of Issue №11 that is tagged «Бронхит»
**When** the Reader reaches the end of the article
**Then** the Reader sees the Subscribe call, a «More from this issue» list of the other articles of the same Language edition in the order they appear in the paper, and a «Similar articles» list of up to 5 Russian-edition articles from other issues that share at least one tag, those sharing the most tags first; a list with nothing to show is not displayed

### AC-09 (US-05) — domain invariant (one language per page)

**Given** an article of the Ukrainian edition
**When** the Reader sees «More from this issue» and «Similar articles»
**Then** every article listed belongs to a Ukrainian edition — the site never mixes Language editions in these lists, and an article never lists itself

### AC-10 (US-06) — happy path

**Given** the Admin is signed in and Issue №11 exists with its Russian Language edition and cover
**When** the Admin uploads the Russian edition's Word file
**Then** the Admin sees a preview of the articles the site found — for each its title, the beginning of its text and its length — in the order of the paper, and nothing is visible to Readers yet

### AC-11 (US-06) — happy path (correct the split)

**Given** the Admin sees the preview of a Language edition
**When** the Admin joins an article to the previous one, splits an article at a paragraph, edits a title or the text of an article (for example removes a letter writer's street address), or excludes a fragment that is not an article (for example the cover teaser lines)
**Then** the preview shows the corrected articles, and only the corrected list, with the edited titles and texts, will be published

### AC-12 (US-06) — error

**Given** the Admin is signed in
**When** the Admin uploads a file that is not a Word document, cannot be read, is larger than 10 MB, or in which the site finds no article titles
**Then** the site rejects it, tells the Admin which of these is the reason, and nothing changes in the edition

### AC-13 (US-07) — domain invariant (every article has a tag)

**Given** the Admin's preview has articles, and some of them have no tag
**When** the Admin tries to publish the edition
**Then** the site blocks publishing, names the articles that still need a tag, and explains that every article must have at least one tag

### AC-13b (US-07) — happy path (tagging)

**Given** the Admin's preview of a Russian edition, where an article carries the rubric label «БРОНХИТ» in the Word file
**When** the Admin adds tags to the articles
**Then** the rubric label is already offered as that article's tag to confirm, typing a tag suggests tags already used on Russian-edition articles, and «Бронхит», «БРОНХИТ» and « бронхит » count as the same tag; the issue number is never a tag

### AC-14 (US-07) — happy path (publish)

**Given** every article in the preview has at least one tag
**When** the Admin publishes the edition
**Then** all its articles become readable, appear in search and in the edition's «More from this issue» lists at the same time, and the Admin sees how many articles were published; if publishing cannot complete, no article of this upload becomes public and the Admin's preview with its corrections and tags is kept to retry

### AC-15 (US-08) — domain invariant (one set of articles per edition)

**Given** the Russian edition of Issue №11 already has 78 published articles
**When** the Admin uploads a new Word file for the same edition
**Then** the site warns that publishing will replace those 78 articles, and replaces them only after the Admin confirms at publishing; in the preview each new article is matched to its earlier version (by title and place in the paper) and the Admin can correct the match; a matched article keeps its tags, and if its title — and so its address — changed, its old address forever leads Readers to the new one; old articles with no match are removed (AC-07); no article of the old upload stays in search

### AC-15b (US-08, US-09) — domain invariant (unique addresses)

**Given** two articles of one Language edition have the same title (for example two «БРОНХИТ» letters in the same issue)
**When** the Admin publishes the edition
**Then** each article gets its own address, and no address ever leads to two articles or silently switches to a different article

### AC-16 (US-06, US-07, US-08) — authorization

**Given** a Visitor without an Admin session
**When** they try to upload a Word file, see a preview, or publish or replace an edition
**Then** the site refuses as for any Admin area action (admin-login AC-05), and nothing changes; articles in an unpublished preview are never visible to Readers — not in search, not on article pages, not in any list

### AC-17 (US-06) — cross-context (an Issue must exist first)

**Given** the Admin is signed in, and Issue №12 or its Ukrainian Language edition has not been created yet
**When** the Admin tries to upload articles for that edition
**Then** the site does not accept the upload and tells the Admin to create the Issue and its edition with a cover first (roadmap step 3)

### AC-18 (US-09) — happy path

**Given** a published article
**When** a Reader copies its address, or a search engine visits the site
**Then** the address is readable (made of the issue and the article title, never an internal number), opens the same article for anyone who follows it, and article pages are open to search engines while search result pages ask search engines not to list them

### AC-19 (US-10) — happy path (search-engine description)

**Given** the Admin's preview of a Language edition
**When** the Admin opens an article in the preview
**Then** the article already has a search-engine title (from its title and the paper's name) and a description (from its first sentences), the Admin can edit both, and once published they are what search engines and link previews show for the article page

### AC-20 (US-10) — error (description limits)

**Given** the Admin edits an article's search-engine title or description
**When** the title is empty or longer than 70 characters, or the description is empty or longer than 160 characters
**Then** the site blocks publishing and shows the Admin which article and which field must be from 1 to 70 (title) or 1 to 160 (description) characters

## 6. Non-functional requirements

| Aspect | Target | Measurement |
|---|---|---|
| Latency p95 — search, from submit to results shown | ≤ 1.5 s | server timing on search requests, checked at launch on the VPS |
| Latency p95 — article page | ≤ 500 ms | server timing on article page requests |
| Preview of a Language edition after upload | ≤ 30 s for a Word file up to 10 MB | timed on the sample edition file in the integration environment |
| Publishing an edition (≈80 articles) | ≤ 2 min, without slowing public pages | timed on the sample edition; public page p95 stays within target during it |
| Search usage limit per address | ≤ 20 searches per minute; beyond it that Reader sees «too many searches — try again in a minute» (AC-03b) | rule checked in tests; the count lives for one minute only and is never stored; the log records only that the limit was hit, without the query |
| Site-wide search spend | stays within the owner's monthly budget (all services ≤ 1000 UAH/month); when the monthly search limit is reached, search turns «temporarily unavailable» (AC-03) and the rest of the site keeps working | provider usage dashboard, monthly |
| Split accuracy | on the sample Russian edition of Issue №11, the site's proposed split matches ≥ 90% of the article titles before Admin corrections | fixture test on the sample file |
| Search relevance | on an owner-written set of 20 test questions, ≥ 16 have a relevant article among the first 3 results | owner spot-check before launch and after each tuning |
| Availability | 99% monthly for public pages | uptime check on the VPS |

## 6.1 Security / privacy

- **Data classification:** public — published articles, tags and covers are meant for everyone; unpublished previews are internal (Admin area only).
- **Personal data touched:** article texts include what the paper already prints — readers' and authors' full names, towns, sometimes a full postal address and health details in readers' letters; they become public web pages. The Admin is responsible for what is published and can remove such details from an article's text in the preview before publishing (AC-11). Reader search queries are sensitive (health questions) and are sent to an external service to be understood; the site does not store them with the Reader's address.
- **AuthZ/AuthN impact:** upload, preview, split corrections, tagging, publishing and replacing are Admin area actions — each is checked for a valid Admin session (admin-login AC-05, CONTEXT invariant). Search and article pages need no sign-in. Unpublished preview content is never served to Readers.
- **Abuse cases:**
  - Flooding public search to burn the paid budget or the shared database: a per-address limit (that Reader is asked to try again in a minute, AC-03b) and a site-wide monthly limit (search goes «temporarily unavailable» for everyone, AC-03); the archive and articles keep working.
  - Search-spam pages (others linking to the site's search with junk queries so search engines index them): search result pages ask search engines not to list them (AC-18), and «nothing found» pages do not repeat the query as a page title.
  - Injection through an uploaded Word file or a query (scripts, markup): article text and queries are shown as plain text with the paper's paragraphs and sub-headings only — nothing from a file or query runs in the Reader's browser.
  - A forged or replayed upload/publish request without an Admin session: refused like any Admin area action (AC-16).
  - Oversized or malicious upload exhausting the small server: 10 MB file limit (AC-12), and the work of preparing an edition must not stop public pages from responding (§6).
- **Security review:** Required — L feature, new public input surface with a paid dependency, new Admin write actions, and personal data of letter writers becomes public.

## 7. Metrics / KPIs

The owner decided not to measure Reader behaviour on the site (roadmap D4); the KPIs below are measured by the owner or by tests, plus one that waits for the owner's web analytics.

- **Published coverage** — baseline: 0 of the 2026 Language editions searchable; target: every 2026 edition with a Word file published within 1 month after launch.
- **Search relevance** — baseline: none (no search by meaning today); target: ≥ 16 of 20 owner test questions with a relevant article in the first 3 results at launch, re-checked after each new issue for the first 3 months.
- **Admin publishing time** — baseline: TBD — timed by the owner on the first edition; target: one Language edition from upload to published in ≤ 30 minutes, including split corrections and tagging.
- **Subscribe call clicks** — baseline: TBD — measured with the web analytics the owner adds to the site after launch (D4); target: set by the owner once the first month of data exists.

## 8. Open questions

- [ ] Where does the Subscribe call lead — which subscription service address(es), the same for both languages? Default now: the site's «Subscription» info page until the Admin names the service (CONTEXT: Subscribe call). — owner: Pavlo, due: before `/sdd:implement article-search`
- [ ] The «close enough» bar for search results is not known until it is tried on real articles. Default now: tuned on the owner's 20 test questions (§6 Search relevance). — owner: Pavlo, due: before `/sdd:tasks article-search`
