# Regnum Personia — website

A static, self-contained marketing site. No build step, no framework, no npm install.
Double-click `index.html` and it runs.

## Pages

| File | Purpose |
|---|---|
| `index.html` | Home — hero, the problem, the modules, two live interactive demos, honest stats |
| `about.html` | Story, goal for the app, five principles, team |
| `features.html` | All modules, in five tabbed groups |
| `how-it-works.html` | Five-step interactive setup walkthrough + FAQ |
| `solutions.html` | Clinic / pharmacy / multi-site group, plus a fit matrix |
| `roadmap.html` | Filterable timeline (shipped / building / planned / exploring) + vision |
| `contact.html` | Validated contact form, direct emails, quick answers |

## Files

```
Website/
├── index.html … contact.html      the built pages — edit these directly
├── assets/
│   ├── css/style.css              one stylesheet, tokens at the top
│   ├── js/main.js                 all interactions, no dependencies
│   └── img/                       drop your images here (see IMAGE-GUIDE.md)
├── _src/                          optional: page bodies + build.py
├── IMAGE-GUIDE.md                 what to photograph or download, and what to name it
└── README.md
```

### Editing

Edit the `.html` files directly — they are ordinary, readable HTML.

The `_src/` folder is how they were generated: each `*.part.html` holds one page's body,
and `build.py` wraps them all in the shared nav, footer and modal. If you change the nav or
footer, edit `_src/build.py` and run `python _src/build.py` to regenerate all seven pages —
otherwise you'd be editing the same header seven times. **If you edit the built `.html`
files directly, do not run `build.py` afterwards; it will overwrite them.** Either work in
`_src/` or delete it.

## Interactions

Everything works without a server: theme toggle (remembered), mobile menu, scroll progress
bar, scroll reveals, count-up stats, tabs, accordions, the step walkthrough, the roadmap
filter, the "ask your stock a question" demo, the cover simulator, the demo-request modal
and inline form validation.

## Before it goes live

1. **Images** — follow `IMAGE-GUIDE.md`. Until then every slot shows a dashed brief.
2. **Wire the forms.** Both forms currently validate and show a confirmation, but nothing is
   sent. The quickest fix is [Formspree](https://formspree.io) or
   [Netlify Forms](https://docs.netlify.com/forms/setup/): give the `<form>` an `action` and
   `method="POST"`, then delete the `data-validate` attribute (or keep it and remove the
   `e.preventDefault()` branch in `initForms` in `main.js`).
3. **Check the email addresses.** `hello@`, `support@` and `legal@regnum.co` appear in the
   footer and on the contact page — change them if they're not live.
4. **Review the claims.** Numbers on the home page ("9 modules", "35+ tables", "4 roles")
   and every roadmap status were written from the current state of the app. Update them
   when the app moves.
5. **Add social preview cards** — see section 4 of `IMAGE-GUIDE.md`.

## Hosting

It's plain static files, so almost anything works:

- **Netlify / Cloudflare Pages / Vercel** — drag the `Website` folder onto the dashboard. Free.
- **GitHub Pages** — push the folder, enable Pages in repo settings.
- **Any web host** — upload by FTP into the public folder.

There is no server-side code, so nothing needs configuring.
