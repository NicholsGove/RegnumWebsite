# Regnum Personia website: design record

## 1. Brief

- **Subject:** Regnum Personia (RP), inventory, finance and forecasting software for healthcare
  facilities and pharmacies in Botswana. It runs on the facility's own hardware, sits on top of
  the records the facility already keeps, and is being proven in a working clinic pilot.
- **Audience:** facility owners, pharmacists, health-group managers, and public-sector buyers
  (the eLMIS conversation). They are careful people who have been sold "AI" before.
- **Job of the site:** earn a walkthrough or pilot conversation by being believable.
- **Owner's standing constraints:**
  - It should look like an official, government-grade page, not AI-made (owner's request,
    Oct 2026).
  - Typeface: Public Sans. Normal letter-spacing on headings (the owner asked for less AI tells).
  - "Healthcare facilities" in copy, except on the Pilot page, where the pilot really is in a
    clinic.
  - Anomaly copy says "review recommended" and never alleges theft.
  - Credibility comes from measured results, never from "our AI predicts".
- **Stack:** the existing one. Static HTML assembled by `_src/build.py`, one stylesheet and one
  dependency-free script. No GSAP, Lenis or WebGL: an official register should load instantly
  on a clinic PC over a slow line, and nothing in this brief needs a scroll engine. Page
  continuity comes from cross-document View Transitions, which are pure CSS.
- **Assumptions:** the production domain is the one in `CNAME` (`www.regnumpecuniae.com`). The
  hero record panel shows illustrative sample data and says so. Money is shown in Pula (P).

## 2. Concepts

| | Idea | Anchor | Signature | O / F / Fe / P |
|---|---|---|---|---|
| **A. The evidence register** (process) | The site is an official public register. Every claim carries its evidence status, stamped in ink: *In use*, *Capturing*, *Not yet*, *Planned*. | RP's own rule, "We would rather be measured than believed", and a scorecard that publishes "Capturing" instead of numbers | Status stamps press onto records as they come into view; the scorecard is the centrepiece | 4 / 5 / 5 / 2 |
| B. The bin card (material) | The site is set like the paper stock control card in a dispensary, with sections as dated entries | The card every dispensary still keeps | Entries are written into the card on scroll | 3 / 4 / 4 / 3 (too close to a running-balance idea) |
| C. First expiry, first out (process) | Content is ordered and coloured by how soon it "expires" | FEFO dispensing | Sections age as you scroll | 3 / 3 / 3 / 3 |

**Pick: A.** It is the owner's own method turned into a visual system. It also answers the
"government official" request honestly: it borrows how official registers *behave* (status,
evidence, plain language), without borrowing any state symbol. **Steal from B:** the 404 is a
record that does not exist, stamped *No record*.

> Note: the site deliberately uses **no national flag, coat of arms or "gov" wording**.
> Regnum is a private company. Looking official must never read as being the government.

## 3. Concept card

```
Idea:        Regnum is a register of evidence: every claim on the site wears its status.
Metaphor:    an official public register (ledger rules, reference numbers, ink stamps, phase tags)
Signature:   the evidence stamp. It presses onto a record when it enters view (scale 1.5 > 0.97 > 1,
             rotation settling to -3deg, ink opacity 0 > 0.92). Used on the hero record, the pilot
             hero, the scorecard and the 404.
Emotion:     calm, accountable, "these people will show their working"
Motion verb: press and file: stamps press down, buttons press 2px into the page,
             underlines are ruled in from the left
Screenshot:  the hero, a plain black-and-white register with a blue "PILOT IN PROGRESS" stamp
             landing on a sample stock record
```

## 4. Art direction system

**Palette** (named from a register office: paper, carbon, rule, stamp ink)

| Role | Light | Dark | Use |
|---|---|---|---|
| ground (paper) | `#ffffff` | `#0f1114` | page |
| ground-2 (file grey) | `#f3f2f1` | `#181b20` | bands, panels |
| ink (carbon) | `#0b0c0c` | `#f3f2f1` | text, header bar |
| muted | `#505a5f` | `#b1b4b6` | secondary text (AA on both grounds) |
| line (rule) | `#b1b4b6` | `#3a3f45` | table rules, borders |
| accent (stamp ink) | `#2133f2` (the logo blue) | `#8f9cff` | stamps, links, primary buttons, header rule |
| focus | `#ffdd00` + ink underline | same | every focus state |
| status | green `#00703c`, amber `#8a4b00` on `#fff4e5`, grey `#505a5f` | lighter twins | tags |

**Type:** Public Sans, self-hosted variable woff2 (one file, weights 400 to 800).

| Role | Size | Weight | Leading |
|---|---|---|---|
| h1 | clamp(2.4rem, 1.5rem + 3.4vw, 4.4rem) | 800 | 1.04 |
| h2 | clamp(1.75rem, 1.3rem + 1.8vw, 2.75rem) | 750 | 1.1 |
| h3 | 1.25 to 1.5rem | 700 | 1.25 |
| body | 18px (16px phone) | 400 | 1.55 |
| caption, meta | 0.875 to 1rem | 400 to 600 | 1.4 |

Tracking stays at 0 (owner's preference). Numbers use tabular figures. Reference numbers use
the system monospace.

**Grid:** 12 columns in a 1200px wrap, 32px gutter. Reading text sits in a two-thirds column
(max 66ch), aligned left, never centred. The hero is 7/5 columns.

**Rhythm:** three moods: tight (48px), normal (80 to 96px), and a band (grey ground, 96px).

**Shape:** radius 0 everywhere. The only round things are status dots and the radio of the
theme toggle. Shadows are replaced by 1px rules. The one exception is the button's 3px bottom
"edge", which collapses when pressed.

**Motion:** one ease, `cubic-bezier(.2,.7,.2,1)`. Stamps take 420ms. Hovers take 160 to 220ms.
Page transitions: the header stays still, and the old page files up and away while the new one
settles in (240ms out, 320ms in).

**Interaction roles** (one treatment each)

| Role | Treatment |
|---|---|
| Primary and secondary buttons | press: move 2px down and lose the edge, and the arrow travels 4px |
| Header nav | an underline is ruled in from the left |
| Inline links | the underline thickens (utility treatment) |
| Linked record rows (pilot builds, cards with links) | a 6px stamp-ink bar is ruled down the left edge and the title shifts 6px right |
| Tabs, filter chips | an underline is ruled in; the active tab gets a stamp-ink bar |

**Idle state: a decision.** The page holds still at rest. An official register that fidgets
would undercut the "calm, accountable" emotion. The life is in the stamps landing, the press
feedback on every primary target, and the live demos (ask-a-question typing, the cover
simulator). The shoot report's `idleMotion: false` is expected.

**Composition plan** (home)

```
[header bar: logo | Request a demo | theme]      service nav: Home About Features ... Contact
[phase banner: PILOT  tag + one sentence]
HERO        | caption / h1 (7 cols)                | record panel + stamp (5 cols)
            | lede, start button, secondary link   |
PROBLEM     grey band: h2 left 8 cols; three findings as a ruled register (no cards)
MODULES     table-like register of 6 modules, 3 x 2 cells with shared rules
ASK         two-thirds column, form-like demo panel
SIMULATOR   split: copy left, instrument right
CLIPBOARD   image left 7 cols, text right
PILOT       six builds as numbered register rows (a real sequence)
NUMBERS     ink band, tabular figures
CTA         ink panel with stamp-ink left rule
[footer: grey, rule on top, link columns, "Page built <date>"]
```

**Genericness test:** "Would a generic model land here?" A generic model would make a GOV.UK
clone, or keep the SaaS cards. What I changed:
1. The status stamp, which is not a GOV.UK element, carries the concept and the motion.
2. The phase banner says something true (a working pilot) instead of decorating.
3. The logo blue is used as stamp ink, not as a gradient.
4. The scorecard is treated as the hero of the Pilot page, not as a table at the bottom.
