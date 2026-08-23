#!/usr/bin/env python3
"""Assembles the Regnum Personia site from _src/*.part.html into flat static pages."""
import os, re, sys

SRC = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.dirname(SRC)

NAV = [
    ("index.html",        "Home"),
    ("about.html",        "About"),
    ("features.html",     "Features"),
    ("how-it-works.html", "How it works"),
    ("solutions.html",    "Solutions"),
    ("roadmap.html",      "Roadmap"),
    ("contact.html",      "Contact"),
]

ICON = {
 "sun":'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4.2"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
 "moon":'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>',
 "burger":'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg>',
 "up":'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>',
}

SHELL = """<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:type" content="website">
<link rel="icon" type="image/png" href="assets/img/logo.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Sora:wght@600;700&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/css/style.css">
</head>
<body>
<div class="scrollbar" aria-hidden="true"></div>

<header class="nav">
  <div class="wrap">
    <a class="brand" href="index.html" aria-label="Regnum Personia home">
      <img src="assets/img/logo.png" alt="">
      <span>Regnum Personia<small>Clinical Operations</small></span>
    </a>
    <nav>
      <ul class="nav-links" id="navLinks">
        {navitems}
      </ul>
    </nav>
    <div class="nav-actions">
      <button class="icon-btn theme-toggle" type="button" aria-label="Switch between light and dark mode">
        <span class="sun">{sun}</span><span class="moon">{moon}</span>
      </button>
      <a class="btn btn-primary btn-sm" href="#" data-open-waitlist>Request a demo</a>
      <button class="icon-btn burger" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="navLinks">{burger}</button>
    </div>
  </div>
</header>

<main>
{body}
</main>

<footer class="foot">
  <div class="wrap">
    <div class="foot-grid">
      <div>
        <a class="brand" href="index.html"><img src="assets/img/logo.png" alt=""><span>Regnum Personia<small>Clinical Operations</small></span></a>
        <p>Inventory, finance and forecasting for clinics and pharmacies — built to run on the hardware you already own.</p>
      </div>
      <div>
        <h4>Product</h4>
        <ul>
          <li><a href="features.html">Features</a></li>
          <li><a href="how-it-works.html">How it works</a></li>
          <li><a href="solutions.html">Solutions</a></li>
          <li><a href="roadmap.html">Roadmap</a></li>
        </ul>
      </div>
      <div>
        <h4>Company</h4>
        <ul>
          <li><a href="about.html">About us</a></li>
          <li><a href="about.html#values">Our principles</a></li>
          <li><a href="contact.html">Contact</a></li>
          <li><a href="#" data-open-waitlist>Join the beta</a></li>
        </ul>
      </div>
      <div>
        <h4>Get in touch</h4>
        <ul>
          <li><a href="mailto:hello@regnum.co">hello@regnum.co</a></li>
          <li><a href="mailto:support@regnum.co">support@regnum.co</a></li>
          <li><a href="mailto:legal@regnum.co">legal@regnum.co</a></li>
        </ul>
      </div>
    </div>
    <div class="foot-bot">
      <span>&copy; <span data-year>2026</span> Regnum Personia. All rights reserved.</span>
      <span>Built for clinics that would rather not fight their software.</span>
    </div>
  </div>
</footer>

<!-- Demo request / beta modal -->
<div class="modal" id="waitlist" role="dialog" aria-modal="true" aria-labelledby="wlTitle">
  <div class="modal-box" style="position:relative">
    <button class="icon-btn modal-x" type="button" data-close-modal aria-label="Close">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
    </button>
    <span class="eyebrow">Early access</span>
    <h3 id="wlTitle" style="font-size:1.55rem">See it on your own numbers</h3>
    <p style="font-size:.96rem">Tell us a little about your site and we'll set up a walkthrough with a copy loaded from your own data — not a canned demo.</p>
    <form data-validate data-done="Request received — we'll reply within two working days.">
      <div class="form-grid">
        <div class="field field--full">
          <label for="wlName">Your name</label>
          <input id="wlName" name="name" type="text" required autocomplete="name" placeholder="Jane Mokoena">
          <span class="msg"></span>
        </div>
        <div class="field field--full">
          <label for="wlEmail">Work email</label>
          <input id="wlEmail" name="email" type="email" required autocomplete="email" placeholder="jane@clinic.co.za">
          <span class="msg"></span>
        </div>
        <div class="field">
          <label for="wlOrg">Practice or pharmacy</label>
          <input id="wlOrg" name="org" type="text" required placeholder="Riverside Clinic">
          <span class="msg"></span>
        </div>
        <div class="field">
          <label for="wlSize">Sites</label>
          <select id="wlSize" name="sites">
            <option>One site</option>
            <option>2–5 sites</option>
            <option>6–20 sites</option>
            <option>More than 20</option>
          </select>
          <span class="msg"></span>
        </div>
      </div>
      <div class="btn-row" style="margin-top:20px">
        <button class="btn btn-primary" type="submit">Request the walkthrough</button>
        <span class="form-note">No card, no commitment.</span>
      </div>
    </form>
  </div>
</div>

<button class="totop" type="button" aria-label="Back to top">{up}</button>
<script src="assets/js/main.js"></script>
</body>
</html>
"""

def nav_items(current):
    out = []
    for href, label in NAV:
        cls = ' class="active" aria-current="page"' if href == current else ''
        out.append('<li><a href="%s"%s>%s</a></li>' % (href, cls, label))
    return "\n        ".join(out)

def build():
    parts = sorted(f for f in os.listdir(SRC) if f.endswith(".part.html"))
    if not parts:
        print("no parts found"); return 1
    for p in parts:
        raw = open(os.path.join(SRC, p), encoding="utf-8").read()
        m = re.match(r"<!--\s*title:(.*?)\|desc:(.*?)\s*-->\s*", raw, re.S)
        if not m:
            print("!! missing header comment in", p); return 1
        title, desc = m.group(1).strip(), m.group(2).strip()
        body = raw[m.end():]
        name = p.replace(".part.html", ".html")
        html = SHELL.format(title=title, desc=desc, navitems=nav_items(name),
                            body=body, sun=ICON["sun"], moon=ICON["moon"],
                            burger=ICON["burger"], up=ICON["up"])
        open(os.path.join(OUT, name), "w", encoding="utf-8").write(html)
        print("built", name, "(%d KB)" % (len(html) // 1024))
    return 0

if __name__ == "__main__":
    sys.exit(build())
