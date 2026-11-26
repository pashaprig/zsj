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

**Committed approach.** One Admin password opens the whole Admin area; there is no username and no second account. The Admin stays signed in for 7 days in the same browser, signs out at will, and recovers or rotates access by changing the Admin password in the server configuration — which also ends every existing Admin session. After 5 wrong attempts from one address the sign-in pauses for 15 minutes for that address only. Every page **and every content-changing action** of the Admin area checks the Admin session on its own; the sharpest failure found in the failure-mode review was a lock placed only on the pages, which leaves the actions of later steps callable directly. No competitive research was run: an internal single-password sign-in has no market alternatives worth comparing, and the direction is settled by the brief.

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
**So that** a leaked password or a stolen session stops working the moment I rotate it

### US-07: Use the public site without a password

**As a** Reader
**I want** to browse the archive and info pages in my language without ever meeting a password or a link to the Admin area
**So that** the site stays a plain newspaper archive for me

> **Visitor** (CONTEXT glossary) is a non-actor role here: it has no goals of its own — it is whoever the system refuses. AC-04, AC-05 and AC-07 describe what a Visitor experiences.

## 5. Acceptance criteria

### AC-01 (US-01) — happy path

**Given** the Admin is not signed in and opened the sign-in form
**When** the Admin enters the correct Admin password
**Then** the Admin lands in the Admin area — on the page they originally asked for, or its start page — and sees that they are signed in

### AC-02 (US-01) — error

**Given** the Admin is not signed in
**When** the Admin submits an empty or wrong password
**Then** the system keeps them on the sign-in form, shows «Неправильний пароль» (or «Введіть пароль» when empty) without hinting what was wrong with it, and nothing in the Admin area opens

### AC-03 (US-01) — error

**Given** the Admin password is missing or unreadable in the server configuration
**When** anyone tries to sign in
**Then** the sign-in form says that sign-in is temporarily unavailable, nobody is let in with any password, and the public site keeps working as usual

### AC-04 (US-04) — authorization

**Given** a Visitor without a valid Admin session
**When** the Visitor opens any page of the Admin area
**Then** the Visitor sees the sign-in form instead of that page and none of its content; after entering the correct password they land on the page they asked for

### AC-05 (US-04) — domain invariant

**Given** a Visitor without a valid Admin session
**When** the Visitor triggers a content-changing Admin area action directly, without going through its page
**Then** the system refuses the action, nothing on the site changes, and the Visitor learns nothing about what the action would have done — the rule «nothing in the Admin area can be seen or changed without a valid Admin session» holds for actions as well as pages

### AC-06 (US-07) — cross-context

**Given** a Reader on the public site in either language
**When** the Reader browses the archive and info pages
**Then** no public page links to the Admin area or asks for a password, and the Admin area appears in no public language version of the site

### AC-07 (US-05) — domain invariant

**Given** 5 wrong password attempts came from one address within 15 minutes
**When** a 6th attempt comes from that address — even with the correct password
**Then** the system refuses it without checking the password and tells the person how many minutes to wait; attempts from other addresses are unaffected, and after 15 minutes the address may try again

### AC-08 (US-02) — happy path

**Given** the Admin signed in less than 7 days ago in this browser and has not signed out
**When** the Admin opens any Admin area page
**Then** the page opens without asking for the password

### AC-09 (US-02) — error

**Given** the Admin signed in more than 7 days ago in this browser — however recently they used the Admin area since; the 7 days count from sign-in, not from the last activity
**When** the Admin opens an Admin area page
**Then** the system shows the sign-in form with a note that the session has expired; after signing in the Admin lands on that page

### AC-10 (US-03) — happy path

**Given** the Admin is signed in
**When** the Admin chooses «Вийти»
**Then** the Admin sees the sign-in form, and opening any Admin area page in that browser asks for the password again

### AC-11 (US-06) — cross-context

**Given** one or more Admin sessions were opened before the Admin password changed in the server configuration
**When** any of those sessions is used after the change
**Then** the system treats it as signed out and asks for the password; the old password is refused and the new one lets the Admin in

### AC-12 (US-06) — error

**Given** the Admin prepares a new Admin password for the server configuration with the site's own command
**When** the password is shorter than 12 characters
**Then** the command refuses to produce the stored value and tells the Admin the password must be at least 12 characters long

## 6. Non-functional requirements

| Aspect | Target | Measurement |
|---|---|---|
| Latency p95 of a sign-in attempt | ≤ 1 s | server timing in the application log, last 7 days |
| Latency p95 added by the Admin session check to an Admin area page or action | ≤ 20 ms | server timing of the check alone, integration test + application log |
| Password-guessing rate per address | ≤ 5 wrong attempts per 15 min (≤ 480 per day) | integration test of the pause; count of refused attempts in the application log |
| Public site under a sign-in flood | public page latency p95 ≤ 1 s while sign-in receives 10 attempts/s for 60 s | load test in this feature's test suite, run before release |
| Admin password strength | ≥ 12 characters | unit test of the command that produces the stored value (AC-12) |

## 6.1 Security / privacy

- **Data classification:** confidential — the stored password hash and the session secret open the whole Admin area.
- **Personal data touched:** the address of a failed sign-in attempt. The pause holds it only for its 15 minutes; the application log records it with the time of each refused attempt and each started pause and keeps it for 30 days, readable only by the Admin through the hosting account, so the Admin can see where guessing came from. No other personal data — there are no accounts.
- **AuthZ/AuthN impact:** one new capability, «Admin session». Every Admin area page and every content-changing action checks it on its own, regardless of how it was reached. Admin area responses are always produced fresh for the requester — never pre-built or kept by a shared cache.
- **Abuse cases:**
  - Password guessing: pause after 5 wrong attempts per address for 15 minutes; paused attempts are refused before the password is checked, so a flood cannot burn the server's capacity.
  - Direct call of an admin action without a session: refused, nothing changes, no hint about the action (AC-05).
  - Stolen session: lasts at most 7 days; changing the Admin password ends it at once (AC-11).
  - Cross-site forgery: a content-changing admin action is accepted only when it comes from the site's own Admin area, not from a page on another site the Admin happens to visit while signed in.
  - Cached or pre-built admin page served to a Visitor: Admin area pages are never prepared ahead of time or stored by a cache; each request is checked.
- **Security review:** Required — this feature creates the site's only authorization boundary.

## 7. Metrics / KPIs

- **Admin area changes the Admin did not make** — baseline: 0 (new feature), target: 0, checked by the Admin against the archive after each publication during the first 3 months after launch.
- **Sign-ins the Admin needs per week on their own browser** — baseline: 0 (no admin yet), target: ≤ 1 per week over the first month after launch.
- **Times the Admin could not sign in with the correct password outside a pause** — baseline: 0, target: 0 in the first 3 months after launch, reported by the Admin; refusals during a pause triggered from the Admin's own address are expected behaviour (AC-07) and not counted.

## 8. Open questions

- [ ] Does the app on the HS-300M host see each Visitor's real address, or only the host proxy's? Default now: count attempts per address as the app sees it; if every request shows the same address, the pause would hit the Admin too and `design` must pick a different key. — owner: Pavlo, due: before `/sdd:design admin-login` (tied to roadmap D2)
- [ ] Should the Admin be notified when sign-in attempts are being paused (someone is guessing)? Default now: no notification, only an application-log entry (address + time, kept 30 days). — owner: Pavlo, due: before `/sdd:tasks admin-login`
