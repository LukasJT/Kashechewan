# Kashechewan First Nation — community website

A static website for **Kashechewan First Nation**, an Omushkego (Swampy Cree)
community on the north shore of the Albany River, near the west coast of James
Bay, in Treaty 9 territory, Northern Ontario.

The site is built with plain HTML, CSS, and a small amount of JavaScript — no
build step and no external dependencies — so it can be hosted anywhere,
including **GitHub Pages** at `kashechewanfirstnation.ca`.

---

## Pages

| File | Page |
|------|------|
| `index.html` | Home |
| `about.html` | Our Community (history, name, geography, timeline) |
| `governance.html` | Governance (Chief & Council, Treaty 9, affiliations) |
| `community.html` | Community Services (health, education, housing, emergency, relocation) |
| `culture.html` | Culture & Language (Omushkego, the goose hunt, Cree language) |
| `news.html` | News & Notices (template layout) |
| `contact.html` | Contact |
| `404.html` | Not-found page |

Shared assets live in `assets/`:

- `assets/css/style.css` — the full design system (colours, type, layout)
- `assets/js/main.js` — mobile menu + footer year
- `assets/img/` — hand-drawn SVG artwork (`logo.svg`, `landscape.svg`, `pattern.svg`)

---

## About the content and images

**Every factual claim is cited.** Each content page ends with a
"Sources & citations" section, and statements link to it with small numbered
references. Sources include Wikipedia, the Government of Canada (Indigenous
Services Canada), CBC News, Queen's University Library, and a peer-reviewed
article on the goose harvest. Please verify anything before relying on it.

**No third-party photographs are embedded.** Pulling images off a web search
would risk copyright infringement, and a community's imagery should belong to
the community. Instead, the site uses original SVG artwork plus clearly-marked
**photo placeholders**. To add real, community-owned photos:

1. Put image files in `assets/img/` (e.g. `assets/img/river.jpg`).
2. Find a placeholder block in the HTML — it looks like:
   ```html
   <div class="photo ph ratio-4-3" aria-label="Photo placeholder"> ... </div>
   ```
3. Replace the whole `<div class="photo ph ...">…</div>` with:
   ```html
   <div class="photo ratio-4-3"><img src="assets/img/river.jpg" alt="Describe the photo"></div>
   ```
   Keep the `ratio-*` class so the framing stays consistent.

Only use photos the community owns or is licensed to use, and always write
meaningful `alt` text.

## Things to fill in before going live

The site deliberately leaves some fields blank rather than guessing:

- **Contact details** (`contact.html`) — Band Office phone, email, address,
  hours.
- **Chief & Council** (`governance.html`) — current officeholders' names and
  portfolios.
- **News** (`news.html`) — replace the template cards with real notices.
- **Emergency information** (`community.html#emergency`) — official evacuation
  contacts and instructions.

Search the files for the word **"Add"**, **"to be added"**, or **"template"**
to find every spot that needs community input.

---

## Publishing with GitHub Pages

1. In the repository, go to **Settings → Pages**.
2. Under **Build and deployment**, set **Source** to *Deploy from a branch*.
3. Choose the branch you want to publish and the `/ (root)` folder, then save.
4. The `CNAME` file in this repo already points the site at
   `kashechewanfirstnation.ca`. In your domain registrar's DNS, add the records
   GitHub Pages asks for (four `A` records for the apex domain, or a `CNAME`
   for `www`), then enable **Enforce HTTPS** once the certificate is issued.

The `.nojekyll` file tells GitHub Pages to serve the files as-is.

---

*This community website was scaffolded as a starting point. Content, images,
and details should be reviewed and approved by Kashechewan First Nation before
publication.*
