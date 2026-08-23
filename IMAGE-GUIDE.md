# Regnum Personia website — image guide

Every picture slot on the site currently shows a **dashed placeholder** describing what
belongs there. Drop a file with the matching name into `assets/img/` and the placeholder
disappears automatically — no code changes, no rebuild.

Names must match exactly, including the extension.

---

## 1. Screenshots you take yourself (6 files)

These are the most persuasive images on the whole site, and nobody else can supply them.
Take them from the running app.

**How to capture them well**

- Run the app maximised at **1920×1080**, in **light mode**, with sample data loaded.
- Use `Win + Shift + S` or the Snipping Tool and crop out the Windows title bar and taskbar.
- Save as **PNG** (screenshots go blurry as JPG).
- Check every visible figure and name before publishing — replace anything real with sample values.

| File | Screen to capture | Where it appears |
|---|---|---|
| `screen-dashboard.png` | Dashboard with KPI tiles and a chart visible | Features → Operations |
| `screen-ai.png` | AI Insights — forecast chart plus a couple of insight cards | Features → Intelligence |
| `screen-finance.png` | Finances — charts plus one table | Features → Money |
| `screen-upload.png` | Data Upload, ideally mid column-mapping | Features → Data & imports |
| `screen-setup.png` | First-run setup wizard, a few fields filled in | How it works |
| `screen-import.png` | Import column-mapping with the preview table showing | How it works |

---

## 2. Photography to download (9 files)

Search terms below work on **Unsplash**, **Pexels** and **Burst** — all free for commercial
use, no attribution required. **Pixabay** is a decent fourth. Avoid anything watermarked,
and avoid classic stock-photo clichés (people in lab coats pointing at nothing, stethoscope
on a laptop keyboard, glowing blue "AI" brains).

**What to look for across all of them:** real rooms, natural daylight, slightly imperfect.
Warm neutrals and clean whites suit this palette. Skip images with heavy blue or teal colour
grading — they'll fight the brand blue.

| File | Size | Subject | Search terms |
|---|---|---|---|
| `home-dispensary.jpg` | 1600×1200 | A tidy dispensary or storeroom — shelving, labelled bins, a hand reaching for stock. No faces needed. | *pharmacy shelves*, *medicine storage*, *dispensary interior* |
| `about-hero.jpg` | 2100×900 | Wide banner. Two or three health workers around a laptop or counter. Candid, room at the sides for cropping. | *clinic staff meeting*, *healthcare team laptop*, *nurses working together* |
| `about-story.jpg` | 1400×1050 | Someone counting stock with a clipboard or tablet in front of shelving. | *inventory count*, *stocktaking clipboard*, *pharmacist checking stock* |
| `solution-clinic.jpg` | 1400×1050 | A modest consulting room or reception — clearly a clinic, not a hospital. A nurse or receptionist at work is ideal. | *small clinic reception*, *doctors office interior*, *community health clinic* |
| `solution-pharmacy.jpg` | 1400×1050 | Rows of labelled medicine shelving, pharmacist mid-task. Depth along the aisle looks great here. | *pharmacist dispensing*, *pharmacy aisle*, *chemist shop interior* |
| `solution-group.jpg` | 1400×1050 | Head-office setting: a small group around a screen or whiteboard reviewing numbers. Office, not clinical. | *team reviewing data*, *business meeting dashboard*, *office whiteboard planning* |
| `security.jpg` | 1400×1050 | A small server, NAS or desktop PC in an office. The message is "this lives in your building". Cooler tones fine here. | *small office server*, *network cabinet*, *desktop computer office* |
| `vision.jpg` | 1050×1400 | **Portrait crop.** A modest clinic building, or a health worker arriving for the day. This is the emotional anchor of the roadmap page — pick something real over something glossy. | *rural clinic building*, *community health centre exterior*, *nurse walking clinic* |
| `contact-team.jpg` | 1600×900 | Candid shot of the people behind the product — desks, laptops, a whiteboard. Puts a face to the inbox. | *small startup team*, *developers working office*, *team candid workspace* |

---

## 3. Team portraits (3 files, optional)

| File | Size | Notes |
|---|---|---|
| `team-1.jpg` `team-2.jpg` `team-3.jpg` | 800×800 square | Real people, please — never stock photos of invented staff. Head and shoulders, plain or softly blurred background, same lighting across all three so they sit together. Phone portrait mode against a plain wall works fine. |

If you'd rather not show the team yet, delete that whole block from `about.html`
(search for `<!-- ======================= TEAM` and remove the section) rather than
filling it with strangers.

---

## 4. Two things worth adding later

- **`favicon`** — already handled: the site uses your existing `logo.png`.
- **`og-cover.jpg` (1200×630)** — the preview card when someone shares a link on WhatsApp or
  LinkedIn. Once you have the dashboard screenshot, put it on a coloured background with the
  logo and a one-line strapline, save it as `assets/img/og-cover.jpg`, and add this to the
  `<head>` of every page:
  `<meta property="og:image" content="assets/img/og-cover.jpg">`

---

## Preparing the files

Resize and compress before uploading — a 6 MB photo will make the page crawl.
[Squoosh](https://squoosh.app) does both in a browser, free:

1. Drop the image in.
2. Set the width to the size in the table above.
3. Choose **MozJPEG, quality ~78** for photos (or keep PNG for screenshots).
4. Aim for **under 300 KB** per photo.
5. Save into `Website/assets/img/` with the exact filename.

Then just refresh the page.
