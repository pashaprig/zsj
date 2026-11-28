---
status: Draft
owner: "Pavlo"
reviewers: ["Tech Lead", "Security Lead"]
updated_at: "2026-11-28"
feature_size: "M"
---

# Spec — issue-create

> **Glossary:** [CONTEXT (project)](../../../CONTEXT.md)
> **Reference module / docs / channels used:** the interview of 2026-11-27; [`docs/idea-brief.md`](../../idea-brief.md) §3, §5, §6, §7; [`docs/roadmap.md`](../../roadmap.md) step 3; [`docs/architecture-map.md`](../../architecture-map.md) §Datastores, §Constraints; [`../admin-login/spec.md`](../admin-login/spec.md) (Admin area rules, AC-05, AC-09); [`../article-search/spec.md`](../article-search/spec.md) (AC-10, AC-14, AC-15b, AC-17, AC-18 — the consumers of an Issue and its Language variants).

## 1. Context

Every reading feature of the new ЗСЖ site hangs off an Issue: the cover archive lists Issues, search results and article pages show an Issue's number, year and cover, and the Admin can upload articles only into a Language variant that already exists (article-search AC-17). Today there is no way to create one. The Admin — the single owner of the site (brief §3) — needs to register each new Issue of the paper, 12 to 24 a year, in Ukrainian and Russian, and later back-fill the issues before 2026 the same way (roadmap, Out of scope).

Why now: roadmap step 3 sits right after Admin sign-in and blocks both the cover archive (step 4) and article publishing (step 5). The Admin area is locked now (admin-login), so content actions can be built behind it.

**Committed approach.** The Admin creates an Issue by its year and its number within that year (numbering restarts at №1 every year; a double issue carries two consecutive numbers, «№7–8»), and adds one or both Language variants, each with its Cover uploaded as a picture. Variants are independent: the second one can be added later, and an Issue with one variant is complete (before 2022 the paper came out in Russian only). Nothing the Admin creates here is visible to Readers until the variant's articles are published (article-search AC-14) — there is no separate «publish issue» step. After creating, the Admin can replace a Cover at any time and delete a variant or an Issue only while none of its articles are published; year, number and month cannot be edited — a mistake is fixed by deleting and recreating while still unpublished. The direction is settled by the brief (§7: «the Admin adds a new issue — cover and articles») and needs no market comparison; the failure-mode review drove the safeguards: every new action checks the Admin session on its own, covers are limited in size and type and never reachable before publishing, and an Issue's identity cannot be duplicated.

Traceability and owner decisions recorded during this specify run:
- **Decision: an Issue is identified by year + number only** — up to two issues may come out in one month (brief §3: «12 or 24 issues a year»); numbering restarts at №1 every year; the site neither asks for nor shows a month (owner, 2026-11-27; month dropped entirely 2026-11-28). Public addresses use the year and the zero-padded number(s): «2026-03», «2026-07-08»; an address with only one number of a double issue («2026-07», «2026-08») is «page not found» (owner, 2026-11-28, clarify). Consequence applied in the same run: article-search AC-18 now builds article addresses from the year and number (e.g. «2026-11» for №11 of 2026), and the project glossary defines Issue, Cover and Published variant accordingly.
- **Decision override: the Cover is uploaded as a picture — closes architecture map §Constraints («how the admin's PDF yields its text and cover … is a `design` decision») for the cover and brief §7 «обкладинка + PDF»** — the Admin exports the front page from the issue PDF; the site never receives or keeps a PDF (owner, 2026-11-27; keeps the architecture map's «text and cover only» and the article-search «Word only» decision).
- **Decision: a variant becomes visible only when its articles are published** — no separate publish step for an Issue; an Issue without articles never shows in the archive (owner, 2026-11-27).
- **Decision override: variants are independent — supersedes brief §3 / §5 «Один номер = 2 окремі файли (UA і RU)»** — an Issue may be created with one variant and get the other later; each language's archive shows only its own published variants (owner, 2026-11-27). An Issue with a single variant is complete: the paper came out in Russian only before 2022; the public site never tells a Reader whether the other language exists (owner, 2026-11-28).
- **Decision: double issues** — an Issue may be a double issue named by two consecutive numbers («№7–8»); it holds both numbers, so neither can be used by another Issue of that year (owner, 2026-11-28).
- **Decision: year range** — the paper has come out since 2002; the Admin fills new issues on schedule and back-fills older ones from 2026 backwards (owner, 2026-11-28).
- **Decision: a file sent without a session is never kept** — after an expired session the Admin re-chooses the Cover picture; admin-login AC-09 is refined accordingly (owner, 2026-11-28).
- **Decision: terms** — an Issue (one release, «номер») has up to two Language variants («мовні варіанти»); «видання» (Publication) means the newspaper or a magazine, never a language variant (owner, 2026-11-28; CONTEXT glossary).
- **Decision: after creation only the Cover can be changed; delete only while unpublished** — editing year or number is out of scope (owner, 2026-11-27).
- **Decision: this spec's Issue model supersedes older descriptions** — an Issue is year + number(s) with up to two Language variants, each with its own Cover; this replaces architecture map §Target modules («Issues (number, date, language, cover)»), its cover-store note and CLAUDE.md §Storage («one cover image per issue»). Updating those documents and choosing the module that owns creating an Issue and keeping Covers is left to `design` (§8) (owner, 2026-11-28, clarify).
- Failure-mode review (devils-advocate, 2026-11-27): address collision of two issues in one month (high, resolved by the decision above), new write actions reachable without a session and a cover held for «resend after sign-in» (high), an oversized cover exhausting the small server (high), an irreversible wrong year/number after publishing (high, accepted — see §3), cover files and Issue records drifting apart or lost on a server rebuild (med-high), delete racing a publish (med-high), a double submit creating a duplicate (med), a pre-release cover reachable at a guessable address (med), an active or non-image file stored as a cover (med), combined issues that do not fit «one year + one number» (med-low — resolved: a double issue is named by two consecutive numbers, «№7–8», and holds both).

## 2. Goals

- The Admin registers a new Issue and its Language variants with their Covers in a couple of minutes, without help and without a developer.
- Every Issue, variant and Cover on the site is correct and unique — no duplicate numbers, no broken covers, nothing visible to Readers before the Admin publishes its articles. The site does not check what a Cover shows: a blurred or wrong-language Cover is fixed by the Admin replacing it (US-04).
- The Admin can fix the mistakes that are cheap to fix (a bad Cover, a mistakenly created unpublished Issue) on their own, while what Readers already see and share stays stable.

## 3. Non-goals

- **Editing year or number after creation** — the Admin deletes and recreates an unpublished Issue instead; once articles are published the identity is permanent because article addresses are built from it (article-search AC-15b). Accepted risk: a wrong identity noticed only after publishing needs a developer.
- **Deleting or unpublishing a published variant** — article-search has no unpublish, and public addresses must never break; this can come with a later content-management feature.
- **Taking the Cover from a PDF** — the Admin exports the picture themselves; reading a whole-issue PDF on the small server is a cost and a memory risk the paper does not need (decision override in §1).
- **Showing an Issue in the archive without its articles** (cover-only issues, e.g. old issues without a Word file) — an archive tile should always lead to articles; this can be revisited when back-filling starts.
- **The two magazines** that came out alongside the newspaper until certain years (Russian only) — they are separate Publications (CONTEXT glossary) with their own numbering; the owner will add them later, and nothing is built for them now.
- **Bulk import of back issues** — the Admin adds old issues one by one through the same flow (roadmap, Out of scope); at 12–24 issues a year a bulk tool does not pay for itself.

## 4. User stories

### US-01: Create an Issue

**As an** Admin
**I want** to enter an Issue's year and its number within the year and add one or both of its Language variants, each with its Cover
**So that** I can then upload the articles of those variants

### US-02: Add the other variant later

**As an** Admin
**I want** to add a Language variant with its Cover to an Issue that already has the other one
**So that** I can start with the language whose files are ready and not wait for the second

### US-03: See all Issues and their state

**As an** Admin
**I want** a list of all Issues, newest first, with each one's Language variants with their Covers, and whether each variant has no articles yet or is published (and with how many articles)
**So that** I can find the variant I need to work on and see what is still unfinished

### US-04: Replace a Cover

**As an** Admin
**I want** to upload a new Cover in place of a variant's current one, also after its articles are published
**So that** I can fix a blurred or wrong Cover, and Readers see the corrected one everywhere

### US-05: Delete a mistaken variant or Issue

**As an** Admin
**I want** to delete a Language variant or a whole Issue, after confirming, as long as none of its articles are published
**So that** I can fix a wrong year, number or language by recreating it before anything goes public

### US-06: See only finished variants

**As a** Reader
**I want** the site to show me an Issue's variant — its Cover, number and articles — only once its articles are published
**So that** every Cover I see leads to articles, and I never stumble on an empty or unfinished issue

> **Visitor** (CONTEXT glossary) is a non-actor role here, as in admin-login: it is whoever the site refuses. AC-12 describes what a Visitor experiences.

## 5. Acceptance criteria

### AC-01 (US-01) — happy path

**Given** the Admin is signed in and no Issue №11 of 2026 exists
**When** the Admin creates Issue №11 of 2026 with its Russian Language variant and a Cover that meets AC-03
**Then** the Admin sees Issue №11 of 2026 in the list of Issues with its Russian variant, its Cover and the state «no articles yet», and can go straight from there to uploading that variant's articles (article-search AC-10); Readers see nothing of it (AC-11)

### AC-02 (US-01) — error (identity fields)

**Given** the Admin is creating an Issue
**When** the year is missing or outside 2002 (the paper's first year) to the next calendar year, the number is missing or is neither a whole number from 1 to 24 nor a double issue of two consecutive numbers within 1 to 24 (e.g. «7–8»), or no Language variant is chosen
**Then** nothing is created; the site shows the Admin which field is wrong and its rule, and keeps everything the Admin entered, including the Cover pictures already chosen — the Admin does not choose them again, and the site keeps none of them until the Issue is created. Readers see an Issue as its number and year («№11, 2026», «№7–8, 2026»); the site has no month field

### AC-03 (US-01, US-02, US-04) — error (Cover file)

**Given** the Admin is creating an Issue, adding a Language variant, or replacing a Cover
**When** the chosen Cover is not a JPEG, PNG or WebP picture (judged by what the file contains, not by its name; a JPEG in print colours, CMYK, is accepted), cannot be read, is larger than 10 MB, or its longer side is shorter than 600 or longer than 6 000 pixels
**Then** the site rejects it and tells the Admin which of these is the reason; nothing is created or changed, and on a replacement the current Cover stays; the rest of the form, and any other Cover picture that meets AC-03, stays as the Admin entered or chose it

### AC-04 (US-01) — domain invariant (one Issue per year and number)

**Given** Issue №11 of 2026 already exists
**When** the Admin creates Issue №11 of 2026 again — including by sending the same form twice in a row or resending it after a slow response
**Then** exactly one Issue №11 of 2026 exists; the site tells the Admin that this Issue already exists and offers to open it, to add its missing variant or replace a Cover there; the Cover picture chosen in the rejected form is applied nowhere — the Admin chooses it again in the existing Issue. A double issue takes both its numbers: while №7–8 of 2026 exists, neither №7 nor №8 of 2026 can be created, and the other way round — the site names the existing Issue that already holds the number

### AC-05 (US-02) — happy path (add the other variant; single-language Issues)

**Given** Issue №11 of 2026 has only its Russian Language variant
**When** the Admin adds its Ukrainian variant with a Cover that meets AC-03
**Then** the list shows Issue №11 of 2026 with both variants; the Russian variant's state does not change, and the Ukrainian one is in the state «no articles yet», ready for its articles. An Issue with a single variant is a complete Issue — for example any issue before 2022, when the paper came out in Russian only: its variant is published and shown to Readers without waiting for the other language, the list shows the missing language neutrally as «no variant» (not as an error or unfinished work), and the public site never tells a Reader whether an Issue has, or lacks, a variant in the other language. The site does not restrict which languages an Issue of any year may have

### AC-06 (US-02) — domain invariant (one variant per language)

**Given** Issue №11 of 2026 already has a Russian Language variant
**When** the Admin tries to add another Russian variant to it
**Then** the site blocks it, explains that an Issue has only one variant per language, and offers to replace that variant's Cover instead

### AC-07 (US-03) — happy path (list of Issues)

**Given** the Admin is signed in and several Issues exist
**When** the Admin opens the list of Issues
**Then** the Issues are grouped by year, newest year first, with the newest year open and every other year closed until the Admin opens it (Covers of a closed year are not loaded); within a year they are ordered by number, newest first; a double issue sorts by its higher number (№7–8 sits where №8 would); each row shows «№11, 2026» and, for each language, one of: «no variant» with an action to add it; the Cover thumbnail with «no articles yet» and actions to upload articles, replace the Cover or delete the variant; or the Cover thumbnail with «published, 78 articles» and actions to replace the articles (article-search AC-15) or replace the Cover — never to delete it. An open preview of a variant's articles (article-search AC-10) does not change the variant's state in the list

### AC-08 (US-04) — happy path (replace a Cover)

**Given** the Russian variant of Issue №11 of 2026 is published
**When** the Admin replaces its Cover with a picture that meets AC-03
**Then** within one minute Readers see the new Cover everywhere the variant's Cover appears (archive, search results, article pages; link previews on other sites refresh by those sites' own rules); the old Cover is no longer kept, and its old address now leads to the new Cover, so links and previews already shared keep showing a Cover; the variant's articles and their addresses do not change

### AC-09 (US-05) — happy path (delete an unpublished variant or Issue)

**Given** Issue №12 of 2026 has only a Ukrainian variant, and none of its articles are published
**When** the Admin deletes that variant and confirms the warning that the Issue is deleted together with its last variant
**Then** the Issue and its Cover are gone, Issue №12 of 2026 can be created again, and an unfinished preview of that variant's articles is discarded; if the Admin cancels the confirmation, nothing changes. An unpublished variant can likewise be deleted while the Issue's other variant is published: after confirming, only that variant and its Cover are gone, and the Issue stays with its published variant unchanged (the whole Issue still cannot be deleted, AC-10)

### AC-10 (US-05) — domain invariant (published variants stay)

**Given** the Russian variant of Issue №11 of 2026 has published articles, or its articles are being published at this moment
**When** the Admin tries to delete that variant or the whole Issue
**Then** the site refuses, explains that a variant with published articles cannot be deleted because Readers' links to its articles must keep working, and nothing changes

### AC-10b (US-05) — cross-context (a preview of a deleted variant)

**Given** the Admin has a preview of a variant's articles open (article-search AC-10), and that variant is deleted meanwhile — for example from another browser tab
**When** the Admin tries to publish that preview
**Then** the site refuses and tells the Admin that the variant no longer exists; no article of that preview becomes public, even if an Issue with the same year and number has been created again since

### AC-11 (US-06) — cross-context (nothing public before the articles)

**Given** Issue №12 of 2026 has a Ukrainian variant with its Cover, and none of its articles are published
**When** a Reader browses the archive, searches, or opens an address that would belong to that Issue, variant or Cover picture
**Then** the Reader sees nothing of it — no archive tile, no Cover, and «page not found» for its addresses; its Cover and number appear only together with its articles, at the moment they are published (article-search AC-14). Each language stands on its own: one variant being published reveals nothing about the other

### AC-12 (US-01, US-02, US-03, US-04, US-05) — authorization

**Given** a Visitor without an Admin session
**When** they try to create an Issue, add a Language variant, replace a Cover, delete a variant or an Issue, or see the list of Issues
**Then** the site refuses as for any Admin area action (admin-login AC-05): nothing changes, no Admin data is shown, and a picture they sent is not kept anywhere

### AC-13 (US-01) — error (session expired while sending a Cover)

**Given** the Admin session expired while the Admin was sending the form to create an Issue with a Cover
**When** the Admin signs in again
**Then** nothing was created; the form opens again with the year, number and chosen languages as the Admin entered them, and the Admin chooses the Cover picture again — the site never keeps a file sent without a valid Admin session (refines admin-login AC-09 for files)

## 6. Non-functional requirements

| Aspect | Target | Measurement |
|---|---|---|
| Latency p95 — create an Issue or add a variant with a Cover up to 10 MB, from sending to the Issue shown in the list | ≤ 5 s | timed in the integration environment on a 10 MB sample picture; server timing on the VPS at launch |
| Latency p95 — list of Issues | ≤ 1 s from opening the list to the newest year shown with its Covers, with 600 Issues (every issue since 2002) | timed in the browser on the integration environment with 600 Issues; server timing on the VPS |
| Processing the largest allowed Cover | public pages keep their own targets (article page p95 ≤ 500 ms, article-search §6) and the app never restarts or runs out of memory on the 1 GB server | timed on the VPS while the worst allowed Cover is processed: a PNG of 6 000 × 6 000 pixels, up to 10 MB |
| Cover size delivered to Readers | ≤ 300 KB for the full Cover, ≤ 60 KB for a thumbnail; the uploaded original is never sent to Readers and is not kept — it is discarded right after the site makes its copies, so the whole archive since 2002 stays under 0.5 GB of Covers; the copies carry no picture metadata, but look as the original does in a picture viewer — the site first turns the picture the way its metadata says and converts print colours (CMYK) and other colour profiles to standard screen colours (sRGB); pixel sizes of the copies per §8 | checked in tests on the sample pictures, including a phone photo stored sideways and a CMYK JPEG |
| Cover durability | 0 Covers lost across deploys — after every deploy 100% of published variants' Covers open; backup at least once a day (at most 24 h of Cover changes lost on a server failure), mechanism per §8 | post-deploy smoke check; backup restore tested once before launch |
| Cover replacement reaching Readers | ≤ 1 min (AC-08) | test plus a manual check on the VPS |
| Availability — Admin area | 99% monthly | uptime check on the VPS |

## 6.1 Security / privacy

- **Data classification:** public once published — Covers and Issue numbers are meant for everyone; before publishing they are internal (Admin area only), because the Admin times the release of an issue (article-search §1).
- **Personal data touched:** none new. The picture file the Admin uploads may carry metadata (device, software, date, sometimes location); the copies Readers get carry none (§6).
- **AuthZ/AuthN impact:** five new Admin area actions — create an Issue, add a Language variant, replace a Cover, delete a variant or Issue, see the list of Issues — each checks the Admin session on its own, not only the page that offers it (admin-login AC-05, CONTEXT invariant). A file sent without a valid Admin session is never kept (AC-12, AC-13). Unpublished Covers are never served to Readers, whatever address is tried (AC-11).
- **Abuse cases:**
  - A forged or replayed create, replace or delete request without an Admin session (e.g. to deface a published Cover or delete an Issue in preparation): refused like any Admin area action, nothing changes, nothing is stored (AC-12).
  - A malicious «Cover» — a scripted vector picture, a web page or document renamed as a picture, a name that tries to place the file outside the Covers' place: only JPEG, PNG and WebP judged by content are accepted (AC-03), Readers get copies the site made itself, and the file name the Admin used plays no part in where it is kept.
  - An oversized picture exhausting the small server's memory or disk (also by mistake — a high-resolution export): 10 MB and 6 000-pixel limits (AC-03) and the processing target in §6.
  - Leaking the next issue's front page before the Admin publishes it, by guessing a Cover's address: unpublished Covers are «page not found» for Readers (AC-11).
  - A duplicate Issue from a double submit or a replay: exactly one Issue per year and number (AC-04).
- **Security review:** Required — M feature with a new file-upload surface into the Admin area and files served on the site's own address.

## 7. Metrics / KPIs

The owner decided not to measure Reader behaviour on the site (roadmap D4); these KPIs are measured by the owner or by tests.

- **Time to create an Issue with both variants** — baseline: not possible today (no Admin area); target: ≤ 3 minutes from ready Cover pictures, timed by the owner on the first Issue after launch.
- **2026 coverage** — baseline: 0 Issues on the site; target: every 2026 Issue created with its Covers within 1 month after launch.
- **Broken or wrong Covers on public pages** — baseline: 0 (nothing published yet); target: 0 at the owner's monthly check of the archive.
- **Developer help needed for Issue mistakes** (a wrong year or number noticed after publishing) — baseline: 0; target: 0 in the first 6 months after launch.

## 8. Open questions

- [ ] How are Covers backed up at least once a day (§6 Cover durability)? Default now: the VPS provider's daily snapshots, if the chosen tariff has them. — owner: Pavlo, due: before roadmap step 6 (deploy), together with D2
- [ ] Which module owns creating an Issue and keeping its Covers (`issues` or `ingest`), and the matching update of the architecture map and CLAUDE.md §Storage to this spec's Issue model (§1)? Default now: the spec's model wins wherever they differ. — owner: Tech Lead, due: sdd:design issue-create
- [ ] What pixel sizes do the full Cover and the thumbnail copies have (§6 Cover size delivered to Readers)? The choice is hard to undo: the original is not kept, so new sizes later mean re-uploading every Cover. Default now: the full Cover at most 1 600 pixels on its longer side, the thumbnail at most 400. — owner: Pavlo, due: sdd:design issue-create (before the first real Cover is uploaded)
- [x] Do the public language switch and the pages' alternate-language hints for search engines ever lead from one Language variant of an Issue to the other (AC-05, AC-11: the site never tells a Reader whether the other variant exists)? **Resolved 2026-11-28 in [cover-archive](../cover-archive/spec.md) AC-09, AC-11:** no — on an Issue or article page the switch leads to the other language's Archive (same year if it has a published variant there, else its newest year); alternate-language hints link archive year pages only. — owner: Pavlo

Resolved during this run: double issues do occur and are named by both numbers, «№7–8» (owner, 2026-11-28) — see AC-02, AC-04.
