---
status: Draft
owner: "Pavlo"
reviewers: ["Tech Lead", "Security Lead"]
updated_at: "2026-11-26"
feature_size: "S"
---

# Spec — admin-login

> **Glossary:** [CONTEXT](../../../CONTEXT.md)
> **Reference module / docs / channels used:** None — only the interview, [`docs/idea-brief.md`](../../idea-brief.md) §3, §5, §6, [`docs/roadmap.md`](../../roadmap.md) step 2, [`docs/architecture-map.md`](../../architecture-map.md) §Stack and the skeleton code under `src/app/admin/` and `src/proxy.ts`.

## 1. Context

The ЗСЖ site needs an Admin area where its single owner, the Admin, adds new issues, covers and article texts (idea brief §3). Every later step of the roadmap that changes content — creating an issue, uploading a cover, indexing articles — lives in that area. Without a lock on it, any Visitor who guesses the address could publish, overwrite or delete issues and spend the paid search budget.

The brief makes a password-protected Admin area a hard constraint (§5), and the roadmap puts this step right after the skeleton because steps 3–5 all build behind it. The skeleton already has an empty Admin area with no protection, so nothing can be added to it safely until this step ships.

**Committed approach.** One Admin password opens the whole Admin area; there is no username and no second account. The Admin stays signed in for 7 days in the same browser, signs out at will, and recovers or rotates access by changing the Admin password in the server configuration — which also ends every existing Admin session. After 5 wrong attempts from one address the sign-in pauses for 15 minutes for that address only. Every page **and every action** of the Admin area — showing admin data, changing content or spending the paid search budget — checks the Admin session on its own; the sharpest failure found in the failure-mode review was a lock placed only on the pages, which leaves the actions of later steps callable directly. No competitive research was run: an internal single-password sign-in has no market alternatives worth comparing, and the direction is settled by the brief.

Traceability:
- Idea brief §3 (one Admin), §5 (password-protected admin, one admin), §6 risk 6 (one Admin is a single point of failure).
- Architecture map line 118 and the CONTEXT glossary «Admin area»: the Admin area is Ukrainian-only and outside the public language versions.
- Owner decision in this spec, derived from brief §6 risk 6: recovering access must not depend on the site itself, so the server configuration is the only recovery path.
- Architecture map §Stack: the password is kept as a one-way hash in server configuration, not in the content store; the session is held by the browser.
- Failure-mode review (devils-advocate, 2026-11-26): guard on pages only (high), password guessing (high), a session that survives a password change (high), sign-in floods exhausting the shared host (med-high), the only Admin locked out by configuration (med-high), pre-built or cached admin pages (med), cross-site forgery of admin actions (med).

## 2. Goals

- Only the Admin can see or change anything in the Admin area — through pages or by calling an action directly.
- Signing in costs the Admin almost nothing: once a week on their own browser, one field, no username.
- The Admin keeps full control without anyone's help: changing the password ends every session, and a forgotten password is recovered the same way.

## 3. Non-goals

- **Several admins, roles or usernames.** The site has one owner (idea brief §3); accounts would add a whole user-management surface for nobody.
- **Self-service «forgot password» reset.** There is no email channel and no second person to confirm identity; the server configuration is the recovery path.
- **Changing the password inside the Admin area.** It would move the secret into the content store and a stolen session could then lock the Admin out; changing it in the configuration is enough at 12–24 issues a year.
- **Two-factor sign-in.** A low-traffic newspaper archive with one owner does not justify it now; it can be added later without changing anything here.
- **Reader accounts.** The public site has no sign-in at all (idea brief §3); this feature touches only the Admin area.

## 4. User stories

### US-01: Sign in with the password

**As a** Admin
**I want** to enter the Admin password on a sign-in form and get into the Admin area
**So that** I can manage issues

### US-02: Stay signed in for a week

**As a** Admin
**I want** my Admin session to last 7 days in the browser where I signed in
**So that** I don't type the password every time I add an issue

### US-03: Sign out

**As a** Admin
**I want** to end my Admin session with one click
**So that** nobody else can use the Admin area from this browser

### US-04: Keep Visitors out of the Admin area

**As a** Admin
**I want** every page and every action of the Admin area refused to a Visitor
**So that** nobody but me can see or change the site's content

### US-05: Slow down password guessing

**As a** Admin
**I want** repeated wrong attempts from one address paused for a while
**So that** guessing the password takes impractically long while I can still sign in from my own address

### US-06: End all sessions by changing the password

**As a** Admin
**I want** a new Admin password set in the server configuration to end every existing Admin session
**So that** a leaked password or a stolen session stops working as soon as the site restarts with the new value

### US-07: Use the public site without a password

**As a** Reader
**I want** to browse the archive and info pages in my language without ever meeting a password or a link to the Admin area
**So that** the site stays a plain newspaper archive for me

> **Visitor** (CONTEXT glossary) is a non-actor role here: it has no goals of its own — it is whoever the system refuses. AC-04, AC-05 and AC-07 describe what a Visitor experiences.

## 5. Acceptance criteria

### AC-01 (US-01) — happy path

**Given** the Admin is not signed in and opened the sign-in form
**When** the Admin enters the correct Admin password
**Then** the Admin lands in the Admin area — on the page they originally asked for, or its start page — and sees that they are signed in; the place they return to is always an Admin area page, and any other destination (another site, a public page, an unknown address) sends them to the Admin area start page instead

### AC-02 (US-01) — error

**Given** the Admin is not signed in
**When** the Admin submits an empty or wrong password
**Then** the system keeps them on the sign-in form, shows «Неправильний пароль» (or «Введіть пароль» when empty) without hinting what was wrong with it, and nothing in the Admin area opens

### AC-03 (US-01) — error

**Given** the stored Admin password value or the session secret is missing, unreadable or too short in the server configuration
**When** the site starts and anyone tries to sign in or uses an existing Admin session
**Then** the site still starts and the public site keeps working as usual; the sign-in form says that sign-in is temporarily unavailable, nobody is let in with any password, no existing Admin session is accepted, and no built-in or default substitute value is ever used in their place

### AC-04 (US-04) — authorization

**Given** a Visitor without a valid Admin session
**When** the Visitor opens any page of the Admin area
**Then** the Visitor sees the sign-in form instead of that page and none of its content; after entering the correct password they land on the page they asked for. The Visitor sees the same sign-in form for every Admin area address, whether or not such a page exists — only a signed-in Admin is ever told a page was not found

### AC-05 (US-04) — domain invariant

**Given** a Visitor without a valid Admin session
**When** the Visitor triggers any Admin area action directly, without going through its page — one that shows admin data (drafts, previews, article lists), changes content, or spends the paid search budget
**Then** the system refuses the action, nothing on the site changes, no admin data is shown, no paid work is started, and the Visitor learns nothing about what the action would have done — the rule «nothing in the Admin area can be seen or changed without a valid Admin session» holds for actions as well as pages

### AC-06 (US-07) — cross-context

**Given** a Reader on the public site in either language
**When** the Reader browses the archive and info pages
**Then** no public page links to the Admin area or asks for a password, and the Admin area appears in no public language version of the site

### AC-07 (US-05) — domain invariant

**Given** 5 wrong password attempts came from one address within 15 minutes
**When** a 6th attempt comes from that address — even with the correct password
**Then** the system refuses it without checking the password and tells the person how many minutes to wait; attempts from other addresses are unaffected, and after 15 minutes the address may try again

Counting rules: only wrong attempts made in the last 15 minutes count (a rolling window); the pause starts at the 5th of them and lasts 15 minutes from that moment; attempts refused during a pause do not count and do not extend it; a successful sign-in clears that address's count; an empty submission («Введіть пароль») is not an attempt; once a pause ends the address has 5 fresh attempts. «One address» means one IPv4 address, or one IPv6 home-network block (/64) — all addresses in that block count together. A pause affects only new sign-in attempts: a valid Admin session used from a paused address keeps working.

### AC-08 (US-02) — happy path

**Given** the Admin signed in less than 7 days ago in this browser and has not signed out
**When** the Admin opens any Admin area page
**Then** the page opens without asking for the password

### AC-09 (US-02) — error

**Given** the Admin signed in more than 7 days ago in this browser — however recently they used the Admin area since; the 7 days count from sign-in, not from the last activity
**When** the Admin opens an Admin area page
**Then** the system shows the sign-in form with a note that the session has expired; after signing in the Admin lands on that page. If the session expired while the Admin was submitting a form (e.g. a new article or cover), nothing is saved, but what the Admin entered is not lost: after signing in they can send it again without retyping it

### AC-10 (US-03) — happy path

**Given** the Admin is signed in
**When** the Admin chooses «Вийти»
**Then** the Admin sees the sign-in form, opening any Admin area page in that browser asks for the password again, and that session no longer opens the Admin area from any browser — a copy of it taken earlier stops working too; other Admin sessions (other browsers) are unaffected

### AC-11 (US-06) — cross-context

**Given** one or more Admin sessions were opened before a new stored password value was put into the server configuration — whether for a new password or a freshly produced value for the same password — and the Admin restarted the site through the hosting account
**When** any of those sessions is used after the restart
**Then** the system treats it as signed out and asks for the password; an old password is refused and the new one lets the Admin in. Until the restart the previous value stays in force.

### AC-12 (US-06) — error

**Given** the Admin prepares a new Admin password for the server configuration with the site's own command
**When** the password is shorter than 12 characters
**Then** the command refuses to produce the stored value and tells the Admin the password must be at least 12 characters long. Length is counted in letters and symbols as typed — a Cyrillic letter counts the same as a Latin one. A password longer than 128 characters is refused the same way, with the upper limit named; no part of an accepted password is ever silently ignored.

## 6. Non-functional requirements

| Aspect | Target | Measurement |
|---|---|---|
| Latency p95 of a sign-in attempt | ≤ 1 s | server timing in the application log, last 7 days |
| Latency p95 added by the Admin session check to an Admin area page or action | ≤ 20 ms | server timing of the check alone, integration test + application log |
| Password-guessing rate per address | ≤ 5 wrong attempts per 15 min (≤ 480 per day) | integration test of the pause; count of refused attempts in the application log |
| Public site under a sign-in flood | public page latency p95 ≤ 1 s while sign-in receives 10 attempts/s for 60 s, each attempt from a different address and with a wrong password (so none hits a pause) | load test in this feature's test suite, run before release |
| Admin password strength | 12–128 characters as typed (Cyrillic = Latin) | unit test of the command that produces the stored value (AC-12) |

## 6.1 Security / privacy

- **Data classification:** confidential — the stored password hash and the session secret open the whole Admin area.
- **Personal data touched:** the address of a failed sign-in attempt. The pause holds it only for its 15 minutes; the application log records it with the time of each refused attempt and each started pause and keeps it for 30 days, readable only by the Admin through the hosting account, so the Admin can see where guessing came from. No other personal data — there are no accounts.
- **AuthZ/AuthN impact:** one new capability, «Admin session». Every Admin area page and every Admin area action — whether it shows admin data, changes content or spends the paid search budget — checks it on its own, regardless of how it was reached. Admin area responses are always produced fresh for the requester — never pre-built or kept by a shared cache.
- **Abuse cases:**
  - Password guessing: pause after 5 wrong attempts per address for 15 minutes; paused attempts are refused before the password is checked, so a flood cannot burn the server's capacity. Accepted risk: there is no overall limit across all addresses — guessing spread over many addresses (a botnet) is held back only by the password's strength (≥ 12 characters); the «≤ 480 per day» figure in §6 is per address, not for the whole site.
  - Direct call of an admin action without a session: refused, nothing changes, no hint about the action (AC-05).
  - Stolen session: lasts at most 7 days; the Admin's «Вийти» ends it for every copy (AC-10), and a new stored password value ends every session once the site restarts (AC-11).
  - Cross-site forgery: sign-in, sign-out and every Admin area action are accepted only when they come from the site's own pages, not from a page on another site the Admin happens to visit — so another site cannot sign the Admin out, push wrong attempts from the Admin's browser to trigger a pause, or change content.
  - Framing (clickjacking): Admin area pages and the sign-in form cannot be shown inside another site's page.
  - Cached or pre-built admin page served to a Visitor: Admin area pages are never prepared ahead of time or stored by a cache; each request is checked.
- **Security review:** Required — this feature creates the site's only authorization boundary.

## 7. Metrics / KPIs

- **Admin area changes the Admin did not make** — baseline: 0 (new feature), target: 0, checked by the Admin against the archive after each publication during the first 3 months after launch.
- **Sign-ins the Admin needs per week on their own browser** — baseline: 0 (no admin yet), target: ≤ 1 per week over the first month after launch.
- **Times the Admin could not sign in with the correct password outside a pause** — baseline: 0, target: 0 in the first 3 months after launch, reported by the Admin; refusals during a pause triggered from the Admin's own address are expected behaviour (AC-07) and not counted.

## 8. Open questions

- [ ] Does the app on the chosen VPS see each Visitor's real address? (The shared HS-300M host was ruled out on 2026-11-26; on a VPS our own nginx sits in front of the app.) Default now: nginx passes the real address and overwrites any address the visitor claims, and the app counts attempts only by that; confirm once the VPS tariff is chosen, in particular that the provider puts no extra proxy in front. — owner: Pavlo, due: before `/sdd:design admin-login` (tied to roadmap D2)
- [ ] Should the Admin be notified when sign-in attempts are being paused (someone is guessing)? Default now: no notification, only an application-log entry (address + time, kept 30 days). — owner: Pavlo, due: before `/sdd:tasks admin-login`
