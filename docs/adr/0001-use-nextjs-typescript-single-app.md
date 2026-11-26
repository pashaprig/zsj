---
status: Accepted
owner: "Pavlo"
reviewers: []
updated_at: "2026-11-26"
feature_size: "n/a (foundation)"
ticket: ""
---

# 0001 — Build the site as one Next.js (App Router) + TypeScript app, deployed standalone on cPanel Node

- **Status:** Accepted
- **Date:** 2026-11-25
- **Deciders:** Pavlo (owner), survey foundation session

## Context

zsj is a new bilingual (UA/RU) site for the ЗСЖ newspaper. It has a public cover archive, info pages, semantic article search and a password-protected admin area for adding issues (`docs/idea-brief.md` §7). It must run on the existing webcraft.ua shared hosting (cPanel, tariff HS-300M), and the owner wants a Node.js backend. Whether the tariff runs Node is unverified. The owner decided to design as if it does and to move hosting if it doesn't.

## Decision drivers

- Owner constraint: a Node.js backend (Express or Next.js), which the owner practices (brief §5).
- Keep the current domain and hosting, with a small memory budget on shared hosting.
- One person maintains the whole thing, so there should be as few moving parts as possible.
- A workshop/learning project on SDD: typed contracts between modules help agents and reviewers.

## Considered options

1. **Express + server-rendered templates (Eta/EJS, optionally htmx)** — the lightest runtime and plain Express, but a rich admin UI is hand-built.
2. **Next.js (App Router)** — one framework for pages, the admin UI and server logic, React for interactive admin screens, and built-in locale routing via next-intl.
3. **Express JSON API + separate React SPA (Vite)** — a clean front/back split, but two projects and weaker indexing of public pages.

Language: **TypeScript** (chosen) vs plain JavaScript.

## Decision outcome

**Chosen:** Option 2, Next.js App Router in TypeScript (strict), as a single app built with `output: 'standalone'` and run by cPanel «Setup Node.js App» (Passenger). The owner picked it for one codebase covering public pages and the React-based admin. TypeScript was picked because types act as contracts between modules for agent-driven TDD.

## Consequences

**Positive**
- A single deployable, one language, and one routing model for public and admin pages.
- Server components render public pages server-side, so search engines can index them.
- The admin UI can use React components for the interactive steps of adding an issue.

**Negative**
- Heavier than Express: `next build` needs 1–2 GB RAM, so builds must run in GitHub Actions and only the standalone output is uploaded to the hosting.
- Passenger + Next standalone needs a small `server.js` entry and care with `PORT` / base path, which is more deploy-config work than plain Express.
- The owner practises Next.js conventions rather than raw Express routing.

**Neutral**
- If the tariff can't run Node, the same app deploys unchanged to any Node host (a VPS or a Node PaaS) pointed at `zoj.com.ua`. Only the deploy workflow changes.
- A move away from Next.js later would be a rewrite of `src/app/`, while `src/modules/` (ADR-0004) would survive.

## Amendment 2026-11-26 — runtime host moves to a VPS

webcraft.ua support answered that shared tariff HS-300M has a 300 MB disk quota, too small for a Node.js/PostgreSQL site, and recommended a VPS. This triggers the fallback already recorded under *Neutral* above and the owner decision of 2026-11-25: the same standalone build runs on a VPS (Node 22 LTS as a systemd service behind nginx with TLS) instead of cPanel «Setup Node.js App» / Passenger. The framework choice is unchanged. The Passenger-specific negative consequence (a `server.js` entry, `PORT` / base-path care) no longer applies; the VPS adds OS updates and nginx/TLS upkeep for the owner instead. The tariff is still to be chosen (roadmap D2).

## Links

- Idea brief: [[../idea-brief.md]] §5, §6 risk 1, §7
- Architecture map: [[../architecture-map.md]] §Stack, §C4
- Related ADR: [[0004-organize-code-as-feature-modules]], [[0005-prefix-every-public-url-with-locale]]
