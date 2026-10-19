# Regnum Personia: website

A static, self-contained marketing site. No framework, no npm install.
Double-click `index.html` and it runs; a small Python script assembles the pages from `_src/`.

**Design:** "the evidence register". The site is set like an official public record, and claims
carry their evidence status as blue ink stamps (*Pilot in progress*, *Baseline: capturing*,
*Built and running*). The full system (palette, type, motion, interaction rules) is in
`DESIGN.md`. Read it before changing the look.

## Pages

| File | Purpose |
|---|---|
| `index.html` | Home: hero, the problem, the modules, two live interactive demos, honest stats |
| `about.html` | Story, goal for the app, five principles, team |
| `features.html` | All modules, in five tabbed groups |
| `how-it-works.html` | Five-step interactive setup walkthrough + FAQ |
| `pilot.html` | The clinic pilot: six builds, worked examples and the pilot scorecard |
| `solutions.html` | Clinic / pharmacy / multi-site group, plus a fit matrix |
| `roadmap.html` | Filterable timeline (shipped / building / planned / exploring) + vision |
| `contact.html` | Validated contact form, direct emails, quick answers |
| `404.html` | Designed "page not found" (GitHub Pages serves it automatically) |

## Files

```
Website/
├── index.html … contact.html      the built pages: edit these directly
├── assets/
│   ├── css/style.css              one stylesheet, tokens at the top
│   ├── fonts/public-sans.woff2    the only typeface, self-hosted (OFL licence)
│   ├── js/main.js                 all interactions, no dependencies
│   └── img/                       drop your images here (see IMAGE-GUIDE.md)
├── _src/                          page bodies + build.py (the source of truth)
├── sitemap.xml, robots.txt        written by build.py / static
├── DESIGN.md                      the design system and the reasons behind it
├── IMAGE-GUIDE.md                 what to photograph or download, and what to name it
└── README.md
```

### Editing

**Edit in `_src/`, then run `python _src/build.py`.** Each `*.part.html` holds one page's
body; `build.py` wraps them all in the shared nav, footer and modal and writes the eight
flat pages in the root. As of the pilot-page update, `_src/` and the built pages are in
sync, so this is the single source: editing a built `.html` directly will be overwritten
the next time anyone builds. Nav and footer changes go in `_src/build.py`.

Adding a page: drop a new `*.part.html` in `_src/` (first line must be the
`<!-- title:… |desc:… -->` comment) and add it to the `NAV` list in `build.py`.

## Interactions

Everything works without a server: theme toggle (remembered), the mobile "Menu" button,
evidence stamps that press in as they come into view, count-up stats, tabs, accordions,
the step walkthrough, the roadmap filter, the "ask your stock a question" demo, the cover
simulator, the demo-request modal (focus is kept inside it, Escape closes it) and inline
form validation. Page-to-page transitions use the browser's built-in View Transitions
(Chrome, Edge and Safari 18.2+); other browsers simply load the next page. Everything
respects "reduce motion" in the operating system.

## Before it goes live

1. **Images**: follow `IMAGE-GUIDE.md`. Until then every slot shows a dashed brief.
2. **Forms backend (done).** Both forms post to the `submit` function in the
   "Regnum Personia" Supabase project, which checks each submission, blocks bots and
   bulk sending, and saves it in the `submissions` table. Read and manage them at
   `/inbox.html` (staff only). See "Forms backend" below.
3. **Confirm the contact address is live.** `kevin.lengwadibe@regnumpesonia.com` is the only
   address on the site: it appears in every footer, on the contact page, and in `main.js`.
   Formspree will not forward anything until that mailbox has confirmed the sign-up.
4. **Review the claims.** Numbers on the home page ("9 modules", "35+ tables", "4 roles")
   and every roadmap status were written from the current state of the app. Update them
   when the app moves.
5. **Social preview card** is done: `assets/img/og.png` (1200×630). Replace it if you want a
   photo instead.
6. **Domain.** `build.py` uses `https://www.regnumpecuniae.com` (from `CNAME`) for canonical
   links, the sitemap and social cards. Change `SITE_URL` at the top of `build.py` if the
   domain changes, then rebuild.

## Hosting

It's plain static files, so almost anything works:

- **Netlify / Cloudflare Pages / Vercel**: drag the `Website` folder onto the dashboard. Free.
- **GitHub Pages**: push the folder, enable Pages in repo settings.
- **Any web host**: upload by FTP into the public folder.

There is no server-side code, so nothing needs configuring.

## Forms backend

| Part | Where |
|---|---|
| Database tables `submissions`, `website_admins` | Supabase project "Regnum Personia" (`supabase/migrations/`) |
| Intake function `submit` | `supabase/functions/submit/index.ts`, deployed to the same project |
| Website side | `assets/js/main.js`, section "Forms" (`FORMS_ENDPOINT`) |
| Staff inbox | `inbox.html` (not linked from the site, hidden from search engines) |

**Signing in to the inbox.** The first time, open `/inbox.html`, type your email and a
password of at least 8 characters, and press "First time? Create your password". Open the
confirmation link Supabase emails you, then come back and sign in. Only addresses in the
`website_admins` table can see submissions. To add someone, insert their email (lower case)
into that table from the Supabase dashboard (Table Editor).

**Email alerts (optional).** Every submission is already saved. To also get an email for
each one, create a free Resend account, verify a sending domain, and add three secrets in
Supabase (Edge Functions, Secrets): `RESEND_API_KEY`, `NOTIFY_EMAIL` (where alerts go) and
`NOTIFY_FROM` (for example `Regnum website <forms@yourdomain>`). No code change is needed.

**Free plan note.** Supabase pauses free projects after about a week without activity.
While paused the forms fall back to opening the visitor's email app, so nothing is lost,
but restore the project from the dashboard when that happens.
