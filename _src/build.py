#!/usr/bin/env python3
"""Assembles the Regnum Personia site from _src/*.part.html into flat static pages.

Run:  python _src/build.py
Writes the eight pages, 404.html and sitemap.xml into the site root.
"""
import datetime, hashlib, json, os, re, sys

SRC = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.dirname(SRC)

# Production address (matches CNAME). Used for canonical links, social cards and the sitemap.
SITE_URL = "https://www.regnumpecuniae.com"
CONTACT_EMAIL = "kevin.lengwadibe@regnumpesonia.com"

NAV = [
    ("index.html",        "Home"),
    ("about.html",        "About"),
    ("features.html",     "Features"),
    ("how-it-works.html", "How it works"),
    ("pilot.html",        "Pilot"),
    ("solutions.html",    "Solutions"),
    ("roadmap.html",      "Roadmap"),
    ("contact.html",      "Contact"),
]

ICON = {
 "sun":'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4.2"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
 "moon":'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>',
}

SHELL = """<!DOCTYPE html>
<html lang="en-BW" data-theme="light">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">
{base}<link rel="canonical" href="{url}">
<meta name="theme-color" content="#0b0c0c">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Regnum Personia">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{site}/assets/img/og.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Regnum Personia: a sample stock record stamped Pilot in progress">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{title}">
<meta name="twitter:description" content="{desc}">
<meta name="twitter:image" content="{site}/assets/img/og.png">
{robots}<link rel="icon" type="image/png" sizes="32x32" href="assets/img/favicon-32.png">
<link rel="apple-touch-icon" href="assets/img/apple-touch-icon.png">
<link rel="preload" href="assets/fonts/public-sans.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="assets/css/style.css?v={css_v}">
<script>document.documentElement.classList.add('js');try{{var t=localStorage.getItem('rp-theme');if(t)document.documentElement.setAttribute('data-theme',t);}}catch(e){{}}</script>
<script type="application/ld+json">{jsonld}</script>
</head>
<body>
<a class="skip" href="#main">Skip to main content</a>

<header class="masthead">
  <div class="wrap masthead__bar">
    <a class="brand" href="index.html">
      <img src="assets/img/logo.png" alt="" width="40" height="31">
      <span>Regnum Personia<small>Clinical operations software</small></span>
    </a>
    <div class="masthead__actions">
      <button class="icon-btn theme-toggle" type="button" aria-label="Switch between light and dark mode">
        <span class="sun">{sun}</span><span class="moon">{moon}</span>
      </button>
      <a class="btn btn-light btn-sm masthead__cta" href="contact.html">Request a demo</a>
      <button class="menu-btn" type="button" aria-expanded="false" aria-controls="navLinks">Menu</button>
    </div>
  </div>
</header>

<nav class="service-nav" aria-label="Main">
  <div class="wrap">
    <ul class="nav-links" id="navLinks">
      {navitems}
    </ul>
  </div>
</nav>

<div class="phase">
  <div class="wrap">
    <strong class="status status--ink">Pilot</strong>
    <p>Regnum Personia is in a working pilot in a healthcare facility. Results go on the <a href="pilot.html#scorecard">pilot scorecard</a> once they are measured.</p>
  </div>
</div>

<main id="main" tabindex="-1">
{body}
</main>

<footer class="foot">
  <div class="wrap">
    <div class="foot-grid">
      <div class="foot-about">
        <a class="brand brand--foot" href="index.html"><img src="assets/img/logo.png" alt="" width="40" height="31"><span>Regnum Personia<small>Clinical operations software</small></span></a>
        <p>Inventory, finance and forecasting for healthcare facilities and pharmacies, built to run on the hardware you already own.</p>
      </div>
      <div>
        <h2 class="foot-h">Product</h2>
        <ul>
          <li><a href="features.html">Features</a></li>
          <li><a href="how-it-works.html">How it works</a></li>
          <li><a href="pilot.html">The pilot</a></li>
          <li><a href="solutions.html">Solutions</a></li>
          <li><a href="roadmap.html">Roadmap</a></li>
        </ul>
      </div>
      <div>
        <h2 class="foot-h">Company</h2>
        <ul>
          <li><a href="about.html">About us</a></li>
          <li><a href="about.html#values">Our principles</a></li>
          <li><a href="contact.html">Contact</a></li>
        </ul>
      </div>
      <div>
        <h2 class="foot-h">Get in touch</h2>
        <ul>
          <li><a class="foot-mail" href="mailto:{email}">{email}</a></li>
          <li><a href="contact.html" data-open-waitlist>Request a demo</a></li>
        </ul>
      </div>
    </div>
    <div class="foot-bot">
      <span>&copy; <span data-year>{year}</span> Regnum Personia</span>
      <span>Page built {built}</span>
      <a href="#main">Back to top</a>
    </div>
  </div>
</footer>

<!-- Demo request modal -->
<div class="modal" id="waitlist" role="dialog" aria-modal="true" aria-labelledby="wlTitle" hidden>
  <div class="modal-box">
    <button class="icon-btn modal-x" type="button" data-close-modal aria-label="Close">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>
    </button>
    <span class="eyebrow">Request a demo</span>
    <h2 id="wlTitle" class="modal-title">See it on your own numbers</h2>
    <p>Tell us a little about your site and we will set up a walkthrough with a copy loaded from your own data, not a canned demo.</p>
    <form data-validate data-done="Request received. We will reply within two working days.">
      <div class="form-grid">
        <div class="field field--full">
          <label for="wlName">Your name</label>
          <input id="wlName" name="name" type="text" required autocomplete="name">
          <span class="msg"></span>
        </div>
        <div class="field field--full">
          <label for="wlEmail">Work email</label>
          <input id="wlEmail" name="email" type="email" required autocomplete="email">
          <span class="msg"></span>
        </div>
        <div class="field">
          <label for="wlOrg">Facility or pharmacy</label>
          <input id="wlOrg" name="org" type="text" required autocomplete="organization">
          <span class="msg"></span>
        </div>
        <div class="field">
          <label for="wlSize">Sites</label>
          <select id="wlSize" name="sites">
            <option>One site</option>
            <option>2 to 5 sites</option>
            <option>6 to 20 sites</option>
            <option>More than 20</option>
          </select>
          <span class="msg"></span>
        </div>
      </div>
      <div class="btn-row">
        <button class="btn btn-primary" type="submit">Request the walkthrough</button>
        <span class="form-note">No card, no commitment.</span>
      </div>
    </form>
  </div>
</div>

<script src="assets/js/main.js?v={js_v}" defer></script>
</body>
</html>
"""

def nav_items(current):
    out = []
    for href, label in NAV:
        if href == current:
            out.append('<li><a href="%s" class="active" aria-current="page">%s<span class="nav-ind" aria-hidden="true"></span></a></li>' % (href, label))
        else:
            out.append('<li><a href="%s">%s</a></li>' % (href, label))
    return "\n      ".join(out)

def page_url(name):
    return SITE_URL + "/" + ("" if name == "index.html" else name)

def jsonld(name, title, desc):
    data = [{
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "Regnum Personia",
        "url": SITE_URL + "/",
        "logo": SITE_URL + "/assets/img/logo.png",
        "email": CONTACT_EMAIL,
        "description": "Inventory, finance and forecasting software for healthcare facilities and pharmacies.",
    }, {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": title,
        "description": desc,
        "url": page_url(name),
    }]
    if name == "index.html":
        data.append({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Regnum Personia",
            "applicationCategory": "BusinessApplication",
            "operatingSystem": "Windows",
            "description": desc,
        })
    return json.dumps(data, ensure_ascii=False).replace("</", "<\\/")

def asset_version(rel):
    """Short content hash, so browsers fetch a changed file instead of a cached copy."""
    with open(os.path.join(OUT, rel), "rb") as f:
        return hashlib.sha256(f.read()).hexdigest()[:10]

def build():
    css_v, js_v = asset_version("assets/css/style.css"), asset_version("assets/js/main.js")
    parts = sorted(f for f in os.listdir(SRC) if f.endswith(".part.html"))
    if not parts:
        print("no parts found"); return 1
    today = datetime.date.today()
    built = "%d %s %d" % (today.day, today.strftime("%B"), today.year)
    pages = []
    for p in parts:
        raw = open(os.path.join(SRC, p), encoding="utf-8").read()
        m = re.match(r"<!--\s*title:(.*?)\|desc:(.*?)\s*-->\s*", raw, re.S)
        if not m:
            print("!! missing header comment in", p); return 1
        title, desc = m.group(1).strip(), m.group(2).strip()
        body = raw[m.end():]
        name = p.replace(".part.html", ".html")
        is404 = name == "404.html"
        html = SHELL.format(
            title=title, desc=desc, navitems=nav_items(name), body=body,
            url=page_url(name), site=SITE_URL, email=CONTACT_EMAIL,
            year=today.year, built=built,
            # The 404 is served from any path on GitHub Pages, so its links resolve from the root.
            base='<base href="/">\n' if is404 else "",
            robots='<meta name="robots" content="noindex">\n' if is404 else "",
            jsonld=jsonld(name, title, desc),
            sun=ICON["sun"], moon=ICON["moon"], css_v=css_v, js_v=js_v)
        open(os.path.join(OUT, name), "w", encoding="utf-8").write(html)
        if not is404:
            pages.append(name)
        print("built", name, "(%d KB)" % (len(html) // 1024))

    order = [h for h, _ in NAV if h in pages] + [h for h in pages if h not in dict(NAV)]
    sm = ['<?xml version="1.0" encoding="UTF-8"?>',
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for name in order:
        sm.append("  <url><loc>%s</loc><lastmod>%s</lastmod></url>" % (page_url(name), today.isoformat()))
    sm.append("</urlset>")
    open(os.path.join(OUT, "sitemap.xml"), "w", encoding="utf-8").write("\n".join(sm) + "\n")
    print("built sitemap.xml")
    return 0

if __name__ == "__main__":
    sys.exit(build())
