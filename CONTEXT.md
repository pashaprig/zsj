---
status: Living
updated_at: "2026-11-26"
---

# Domain Context — zsj

## Glossary

- Admin — the single owner of the site who signs in with the admin password and adds issues. NOT a role among many: there are no other accounts, usernames or permission levels.
- Admin area — every page and every content-changing action meant for the Admin, in Ukrainian only, outside the public language versions of the site. NOT the public site, which Readers use without signing in.
- Admin password — the one secret that opens the Admin area, set by the Admin in the server configuration. NOT a user account: there is no username, no sign-up and no self-service reset.
- Admin session — the state of being signed in to the Admin area in one browser; it lasts a fixed time and ends earlier on sign-out or when the Admin password changes. NOT a Reader preference such as the chosen language.
- Reader — anyone who uses the public site (archive, search, info pages) without signing in. NOT a subscriber account: the site keeps no reader accounts.
- Visitor — anyone who reaches the Admin area without a valid Admin session, including a Reader who typed the address and an automated scanner. NOT the Admin with an expired session — though the site treats both the same until they sign in.

## Invariants

- Nothing in the Admin area can be seen or changed without a valid Admin session — this holds for every page and every action, not only for what a browser shows.
