---
status: Living
updated_at: "2026-11-27"
---

# Domain Context — zsj

## Glossary

- Admin — the single owner of the site who signs in with the admin password and adds issues. NOT a role among many: there are no other accounts, usernames or permission levels.
- Admin area — every page and every action meant for the Admin (showing admin data, changing content or spending the paid search budget), in Ukrainian only, outside the public language versions of the site. NOT the public site, which Readers use without signing in.
- Admin password — the one secret that opens the Admin area, set by the Admin in the server configuration. NOT a user account: there is no username, no sign-up and no self-service reset.
- Admin session — the state of being signed in to the Admin area in one browser; it lasts a fixed time and ends earlier on sign-out or when the Admin password changes. NOT a Reader preference such as the chosen language.
- Article — one complete piece of the newspaper with its own title, as it appears in a Language edition; a newspaper consists of a number of articles, each starting at its title in the edition's Word file. NOT the Issue or a page of the paper, and NOT an Excerpt (only a fragment of an article).
- Issue — one regular release of the newspaper, identified by its number and month (e.g. №11, November 2026); it is published in two Language editions with identical layout and articles. NOT a single file or a single language: «Issue №11» means both its Ukrainian and Russian editions.
- Language edition — the Ukrainian or the Russian version of an Issue: the same front page and the same articles in the same places, only the language differs; each edition has its own cover image and its own Word file. NOT the UI locale of the site — a Reader may browse the site in Ukrainian and still read a Russian edition.
- Reader — anyone who uses the public site (archive, search, info pages) without signing in. NOT a subscriber account: the site keeps no reader accounts.
- Subscribe call — the link placed at the end of every Article (and wherever the site invites to subscribe) that leads to the external subscription service the Admin names — or, until the Admin names one, to the site's «Subscription» info page. NOT a purchase on the site: the site sells nothing and does not know whether a Reader subscribed.
- Visitor — anyone who reaches the Admin area without a valid Admin session, including a Reader who typed the address and an automated scanner. NOT the Admin with an expired session — though the site treats both the same until they sign in.

## Invariants

- Nothing in the Admin area can be seen or changed without a valid Admin session — this holds for every page and every action, not only for what a browser shows.
