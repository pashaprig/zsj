---
status: Living
updated_at: "2026-11-28"
---

# Domain Context — zsj

## Glossary

- Admin — the single owner of the site who signs in with the admin password and adds issues. NOT a role among many: there are no other accounts, usernames or permission levels.
- Admin area — every page and every action meant for the Admin (showing admin data, changing content or spending the paid search budget), in Ukrainian only, outside the public language versions of the site. NOT the public site, which Readers use without signing in.
- Admin password — the one secret that opens the Admin area, set by the Admin in the server configuration. NOT a user account: there is no username, no sign-up and no self-service reset.
- Admin session — the state of being signed in to the Admin area in one browser; it lasts a fixed time and ends earlier on sign-out or when the Admin password changes. NOT a Reader preference such as the chosen language.
- Article — one complete piece of the newspaper with its own title, as it appears in a Language variant; a newspaper consists of a number of articles, each starting at its title in the variant's Word file. NOT the Issue or a page of the paper, and NOT an Excerpt (only a fragment of an article).
- Cover — the image of the front page of one Language variant, uploaded by the Admin as a picture; the only image the site keeps for a variant. NOT the issue PDF (never kept) and NOT a picture inside an Article.
- Issue — one regular release of a Publication (for now only the newspaper), identified by its year and its number within that year (numbering restarts at №1 every year; up to two issues may come out in one month, e.g. №21 of 2026; a double issue is named by two consecutive numbers, e.g. №7–8 of 2026, and holds both); the site keeps no month for an Issue. It has up to two Language variants with identical layout and articles, which the Admin may add one at a time; an Issue with one variant is complete (before 2022 the paper came out in Russian only). NOT a single file or a single language: «Issue №11 of 2026» means both its Ukrainian and Russian variants.
- Language variant — the Ukrainian or the Russian version of an Issue: the same front page and the same articles in the same places, only the language differs; each variant has its own Cover and its own Word file. NOT a Publication («видання» in Ukrainian means the newspaper or a magazine, never a language variant), and NOT the UI locale of the site — a Reader may browse the site in Ukrainian and still read a Russian variant.
- Publication — the newspaper «Здоровий спосіб життя», or one of the two magazines that came out alongside it until certain years (in Russian only); every Issue belongs to one Publication, and its numbering runs within that Publication. NOT a Language variant. For now the site covers only the newspaper; the magazines are added later.
- Published variant — a Language variant whose Articles the Admin has published; only published variants (their Cover, number and articles) are visible to Readers. NOT a variant that merely exists with a Cover: until its articles are published, Readers never see it.
- Reader — anyone who uses the public site (archive, search, info pages) without signing in. NOT a subscriber account: the site keeps no reader accounts.
- Subscribe call — the link placed at the end of every Article (and wherever the site invites to subscribe) that leads to the external subscription service the Admin names — or, until the Admin names one, to the site's «Subscription» info page. NOT a purchase on the site: the site sells nothing and does not know whether a Reader subscribed.
- Visitor — anyone who reaches the Admin area without a valid Admin session, including a Reader who typed the address and an automated scanner. NOT the Admin with an expired session — though the site treats both the same until they sign in.

## Invariants

- Nothing in the Admin area can be seen or changed without a valid Admin session — this holds for every page and every action, not only for what a browser shows.
- An Issue is unique by its Publication, year and number — a double issue holds both its numbers — and has at most one Language variant per language.
