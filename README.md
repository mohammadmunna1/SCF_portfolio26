# Md Munna Mia — Supply Chain & Logistics Portfolio

A modern, minimal portfolio (React + Vite + Tailwind) that presents Md Munna Mia as a supply chain and logistics professional with a technology edge, with a secure admin panel: every piece of content — profile, projects, experience, education, courses and certifications (with their images), achievements, skills, stats, FAQs, testimonials, social links, the order of homepage sections and the **colour palette** — is managed from `/admin` and stored in MongoDB.

## Features

### Public site

- **Hero:** the positioning headline, a short introduction, *Explore my projects* / *View my background* / *Download CV* (shown when a CV link is set in Admin → Profile), and the portrait inside an animated field-to-consumer ring (11 stops, from field and factory through cargo, port, sea and air freight, rail, warehouse and road to retail and the consumer) with the current role and the degree in progress pinned to it
- **The supply chain journey, sketched behind the page:** a monochrome pencil drawing, fixed behind all the content, moves with the page's scroll — forwards and back — while the page scrolls normally over it. A car on a country road becomes a delivery truck at the logistics hub and delivers to the factory, where goods are pressed, packed and conveyed across to the warehouse; a forklift racks them; two channels leave the warehouse — a van climbs to the shop, whose shelves fill, while a container truck heads to the port, where a crane loads the container aboard a ship; the ship crosses the sea, a second crane lands it, and a truck delivers it to a distribution centre overseas just as the footer comes up. The world is drawn in just ahead of the camera, and rubbed out again on the way back
- **At a glance:** a ruled strip of key figures
- **About:** the story, the supply chain focus drawn as a shipment-tracking route, the technical edge and languages
- **Experience:** a timeline with focus tags (e.g. Supply Chain Finance, ERP) and the current role marked
- **Projects:** the supply chain systems as case studies (screenshot, or the project's workflow drawn as a route when there's no screenshot; what I did; stack; live demo and code). Everything else — automation & AI, quality & test automation, software & web — is on `/projects`, linked by *View more projects* (it opens at the first of those groups; `?view=supply-chain|automation|qa|software` picks one), with detail dialogs; the old `/ProjectsDetails` URL still works
- **Education:** the degrees as cards with an explicit *In progress* / *Completed* status, school results, activities
- **Courses & certifications:** every course with its real image — the certificate, the official course image or the provider's logo — in matching 4:3 frames, with status (*Completed*, *In progress*, *Planned*), provider, date and a link to the credential (e.g. the Coursera certificate for *GenAI for Supply Chain Optimization*); certificates open full size
- **Skills:** supply chain capabilities first, then the technical toolkit
- Contact form: messages are saved to the admin inbox **and** forwarded by email via Web3Forms
- Light by default ("Manifest"), with a dark preset ("Night Freight") and others in the admin; restrained motion (short fades as content scrolls into view, the field-to-consumer ring, the faint sketch behind the page); fully responsive, keyboard accessible, honours "reduce motion" (the sketch then changes between still frames, one per stage); falls back to bundled content if the API or database is down

### Admin panel (`/admin`)

- Add, edit, delete, hide/show and drag-to-reorder any content; image uploads (resized to WebP in the browser)
- **Theme & colours:** presets (Manifest is the default; light and dark ones including Port Blue, Cream & Navy, Maroon & Cream, Deep Sea and Maroon Night), colour pickers with HEX inputs, a live preview, “Preview on site”, publish / discard / reset to default, and WCAG contrast checks that block unreadable palettes (enforced by the API too). When a change leaves a pair hard to read, **Fix contrast** adjusts just the text colours involved — lighter or darker, same hue — until every pair passes
- **CV:** the Download CV buttons serve `public/cv/Md-Munna-Mia-CV.pdf`, the CV without its reference section (the referee's contact details stay private). Replace that file, or point Profile → CV link elsewhere
- Profile & SEO editor, section manager, messages inbox, password change, JSON backup export

## Tech stack

React 18 · Vite · Tailwind CSS · Framer Motion · React Router · Express · MongoDB (Mongoose) · JWT (httpOnly cookie) · bcrypt — the journey behind the page is SVG line art drawn in code, driven by Framer Motion's scroll tracking (no extra animation library)

## Getting started

**Prerequisites:** Node.js 18.18+ and a MongoDB database — a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster works, or a local `mongod`.

```bash
npm install
cp .env.example .env      # then fill it in (see below)
npm run dev:all           # API on :3001 + site on :5173 (Vite proxies /api)
```

Open <http://localhost:5173> for the site and <http://localhost:5173/admin> for the admin panel.

On first start the API seeds the database with the portfolio content and creates the admin account from `ADMIN_EMAIL` / `ADMIN_PASSWORD`. After that you can remove `ADMIN_PASSWORD` from `.env` and change the password under **Admin → Account**.

### Admin access

- **First admin.** When the database has no admin yet, the server creates one from `ADMIN_EMAIL` and `ADMIN_PASSWORD` (10+ characters; stored only as a bcrypt hash). Nothing is hard-coded — the values live in `.env` locally or in the host's environment variables.
- **Sign in** at `/admin` (e.g. `https://your-site/admin`). Sessions are httpOnly cookies; 5 wrong passwords lock the account for 15 minutes.
- **Change the password** under **Admin → Account** (this signs out every other session), then remove `ADMIN_PASSWORD` from `.env` and from the hosting environment — it is only used to create the first account.
- **Forgot it / new admin:** `npm run admin -- --email you@example.com` resets that account's password (or creates the account) and prints a strong generated one in your terminal. It uses the database in `.env`.

### Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `MONGODB_URI` | yes | MongoDB connection string |
| `JWT_SECRET` | yes in production | 32+ random characters for signing admin sessions. Generate: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | first run | Create the first admin account (password: 10+ characters) |
| `PORT` | no | API port (default `3001`) |
| `SESSION_DAYS` | no | How long admin sessions last (default 7) |
| `EMAIL_USER`, `EMAIL_PASS`, `CONTACT_RECEIVER`, `NOTIFY_EMAIL_ON_MESSAGE` | no | Optional Nodemailer notifications for new messages (Web3Forms already emails you) |
| `CORS_ORIGINS`, `COOKIE_SAMESITE` | no | Only if the site and API live on different domains |
| `VITE_API_URL` | no | API origin, if it isn't the same origin as the site |
| `VITE_WEB3FORMS_KEY` | no | Override the Web3Forms access key |

### Scripts

| Command | What it does |
| --- | --- |
| `npm run dev:all` | API (auto-restarting) + Vite dev server |
| `npm run dev` / `npm run dev:api` | Site only / API only |
| `npm run build` | Production build into `dist/` |
| `npm start` | Serve the API **and** the built site from one Node process |
| `npm run migrate` | Apply pending content migrations (they also run automatically when the API starts) |
| `npm run seed` | Seed an empty database (`-- --force` wipes content and the palette and restores the defaults) |
| `npm run admin -- --email you@example.com` | Create an admin or reset its password (prints a generated one if `--password` is omitted) |
| `npm run backup` | Update the backup copy the site falls back on, `shared/fallback-content.json` — see [Backup & fallback](#backup--fallback) |
| `npm run restore` | Put content back into the database from the backup (`-- --missing` or `-- --all`; a dry run without flags) |
| `npm run lint` | ESLint |

## Design system

### Colours

Every colour is a design token: a CSS custom property holding `R G B` channels (`--c-bg`, `--c-heading`, `--c-accent`, …), exposed to Tailwind as `bg-canvas`, `text-heading`, `border-line`, `bg-button`, etc. Components never hard-code colours.

- The default (“Manifest”: warm paper, ink and a container-orange accent) is declared in `shared/theme.js` and mirrored in `src/index.css` for the first paint.
- A palette published in **Admin → Theme & colours** is stored in the `theme` collection, returned by `/api/content`, and applied at runtime (`src/lib/theme.js`) — no rebuild needed.
- Contrast rules for every text/background pairing live in `shared/theme.js`; the admin editor and the API both refuse palettes that fail them. Error text picks a readable red automatically for dark or light palettes.
- The admin panel itself always uses the default palette, so a custom palette can never make it hard to use.

### Typography

Everything is set in **Geist** (`@fontsource-variable/geist`, SIL Open Font License, self-hosted): headlines semibold and tightly tracked (`.display` with the `text-display-*` sizes), text at 16–17px. Small labels — section numbers, dates, field names — use the system monospace face, like the fields of a shipping manifest. Shared classes in `src/index.css`:

| Class | Use | Style |
| --- | --- | --- |
| `.display` + `text-display-hero/lg/md` | hero headline, section titles, case-study titles | Geist 600, fluid sizes, tight tracking |
| `.eyebrow` | section numbers and labels ("03 — Projects"), small headings | monospace 12px uppercase, spaced |
| `.title-item` | role, degree and skill-group names | Geist 600, 20 → 22px |
| `.title-card` | names on cards | Geist 600, 18px |
| `.copy` / `.copy-card` | paragraphs, descriptions, bullet points | Geist 400, 16 → 17px / 15px |
| `.meta` | dates and counters | monospace 12px uppercase |
| `.tag`, `.chip`, `.chip-line` | badges, tools, technologies, skills | pills, original casing |

The ultra-condensed display face of the previous design (Humane / Six Caps, `src/lib/fonts.js`) is still installed but no longer used for headlines. The Content-Security-Policy allows no external font hosts.

### Illustrations

The supply chain visuals are line art drawn in code (`src/Components/illustrations/`), so they take the palette's colours and need no image files: the field-to-consumer ring around the portrait in the hero (`SupplyJourney.jsx` — a shipment travels field → factory → cargo → port → sea and air freight → rail → warehouse → road → retail → consumer, each stop lighting up as it's reached; it pauses off screen and stays still with "reduce motion") and the workflow route used for projects without a screenshot (`FlowDiagram.jsx`, fed by each project's **Workflow steps** in the admin). Icons come from `react-icons` (Lucide).

### The journey behind the page

`src/Components/JourneyBackdrop.jsx` is a fixed layer behind all the content (`z-index: -1`, over the page colour, which is set on `<html>`): it's `aria-hidden`, never takes a click or keyboard focus, and the page scrolls over it as normal. Framer Motion's `useScroll` turns the page's scroll position into the journey's progress (0–1) — the hero screen covers the first tenth (the car's drive across it), the rest of the page the remainder, reaching 1 as the footer arrives — smoothed by a spring. With "reduce motion" it's stepped to one still frame per stage instead.

- **Everything is a function of progress.** `journey/director.js` places the camera, every vehicle and every stroke from that one number — nothing is carried from frame to frame — so scrolling back plays the journey exactly in reverse, and any frame can be drawn on demand (a resize redraws it). The camera follows the shipment — the car, the goods down the line, the forklift, both channels at the fork, the container — along a smoothed path; moves use keyframe curves (`journey/keyframes.js`).
- **Drawn as it goes.** The art (`journey/art/`) is SVG line art made with a seeded pencil (`art/pen.js`): lines bow slightly and run past their corners, shade is hatched, and solid shapes have "paper" in the page colour behind them. Each drawing is revealed by sliding a dash along its strokes as the camera approaches — outlines first, then details and shade — and the car is redrawn, part by part, into the truck. Strokes use the heading colour at low opacity, so the sketch follows any palette, light or dark, and stays faint enough for text to read over it; it also fades towards the top of the screen, where most reading happens. Signs on the buildings name the stages (hub, factory, warehouse, market, port, customs, distribution centre).
- **Performance:** four depth layers (sky, far ranges, hills, the world), each its own SVG on a GPU layer moved by a CSS transform, so the camera's travel costs no repainting; parts off screen are skipped (`data-x` extents) and vehicles off screen aren't updated; on a device that is already dropping frames, the sketch is redrawn every other frame. It's its own chunk (about 18 KB gzipped), loaded in parallel with the page; if it can't load, the page simply goes without it. Measured in headless Edge on an integrated GPU, wheel-scrolling the whole page in about three seconds: 60 fps median, about 5% of frames late on desktop and 3% on a phone; with the phone's CPU slowed 4× the sketch updates at about 30 fps while the page itself keeps scrolling smoothly.
- **Editing:** where things are in `art/layout.js`; when they move, and the camera, in `director.js`; the hero's share of the journey and the reduced-motion stills in `stages.js`. In development, `/?journey=0.42` holds the journey at any point and `window.__journey(p)` moves it — handy for checking frames.

### Course and certificate images

Each course in **Admin → Courses & Certifications** has an **image** (the certificate itself or the official course image — shown whole in a 4:3 frame, and full size on click) and a **provider logo** (shown on a white tile, so it stays legible in dark palettes; used in place of the image when there isn't one). Upload them there, or point to files in `public/`: the current ones are in `public/images/courses/` and `public/images/logos/`. Use only genuine images — the certificate, the provider's own course image or its logo.

## Content migrations

Databases created by an older version are upgraded by `server/migrations/` (run on API start, or with `npm run migrate`). Each migration runs once (tracked in the `meta` collection) and never overwrites content edited in the admin: a value is replaced only while it still holds the original text, and retired items are hidden rather than deleted when in doubt. New databases are seeded with the current content and skip existing migrations. To change content for existing databases, add a new migration — don't edit one that may already have run.

The existing migrations upgraded the earlier SQA-profile versions (v1 → v2); they read frozen copies of that content (`server/migrations/snapshots/`), so they behave exactly as when they were written. The current supply chain content (v3, `shared/default-content.js`) reaches a database by seeding — this deployment uses a new, dedicated database.

## Backup & fallback

The site never depends on the database alone — it keeps working when the database is unavailable. `shared/fallback-content.json`, committed with the code, is a copy of everything the site publishes: the hero, At a glance, About, Experience, Projects (and QA projects), Education with achievements, Courses & certifications (with their image and logo paths and statuses), Skills, contact and footer — with their text, links (GitHub, LinkedIn, email, CV, certificates, project repositories and live sites), image paths and the published palette. The images themselves are files in `public/`, so they load during an outage too. It holds public content only (the same data `/api/content` serves every visitor), never credentials. The rules live in `shared/content-backup.js`.

### What happens automatically

| Situation | What visitors see |
| --- | --- |
| The database or API is down, unreachable or slow (no answer within 6 s) | The backup copy — or this browser's own newer copy of live content, if it has one. The site retries in the background (after 20 s, 1 min and 3 min) and switches to live content as soon as it answers. |
| The API answers with an error or broken data | The backup copy. Broken answers are never cached. |
| The database answers, but records are gone — a deleted profile, palette or homepage section, or an essential list with no items left | Live content, with just those parts filled in from the backup. Admin → Dashboard and Admin → Backup name them. |
| The database is empty — lost, wiped, or a new cluster | On the first request the API seeds it from the backup, so the site comes back as it was (newer content migrations still run). |

The contact form keeps working during an outage, because messages also go through Web3Forms.

Nothing overwrites newer data: the database is the source whenever it answers, and the backup is only written into a database that is empty, or when you run `npm run restore`. Deliberate changes are respected — hidden sections and items stay hidden, and deleting every item of a list in the admin is remembered, so that list isn't refilled. To remove an essential section on purpose, hide it in Admin → Sections.

### Keeping the backup up to date

After changing content, update the backup so it matches what visitors see (Admin → Backup says whether it is up to date):

1. Run `npm run backup` (reads the database in `.env`), or `npm run backup -- --url https://your-site.vercel.app` to copy the live site without any credentials — or use Admin → Backup → *Download backup file*.
2. Commit `shared/fallback-content.json` — and `public/backup-assets/` if it appears: copies of uploaded images, which otherwise live in the database — then deploy.

`npm run backup` refuses to swap the backup for a copy in which an essential list has become empty; add `--force` when that is intended.

### Restoring the database

| Problem | Fix |
| --- | --- |
| Some content was deleted by accident | `npm run restore` lists what is missing; `npm run restore -- --missing` puts it back without changing existing content. |
| Content is wrong or damaged | `npm run restore -- --all` replaces all portfolio content with the backup, after saving the current content to `backups/`. |
| The database is gone, or you're moving to a new cluster | Point `MONGODB_URI` (in `.env` and in Vercel) at the new database and redeploy — the empty database is seeded from the backup on the first request. Then create your admin account again with `npm run admin -- --email you@example.com`: accounts are never part of a backup. |
| You need hidden items back as well | Restore a full backup: Admin → Backup → *Download full backup* (or `npm run backup -- --full`), then `npm run restore -- --all --file <file>`. |

Full backups include hidden items and sections, so keep them private: `backups/` is git-ignored — store copies somewhere safe, never in the repository. No backup contains contact messages or admin accounts. If your Atlas cluster has no automatic backups (the free tier doesn't), download a full backup now and then.

## Deployment

**Vercel (recommended).** `vercel.json` routes `/api/*` to the Express app in `api/index.js` (a serverless function) and everything else to the SPA, with security headers. It also runs the function in Mumbai (`"regions": ["bom1"]`), next to the Atlas cluster (AWS `ap-south-1`): every database round trip from Vercel's default region (Washington, `iad1`) takes about 200 ms, and a cold start makes many of them. If the database moves to another region, set `regions` to the [Vercel region](https://vercel.com/docs/regions) closest to it.

1. Import the GitHub repository as a Vercel project (framework preset: Vite; build `npm run build`, output `dist` — detected automatically). The build itself needs no environment variables.
2. In Vercel → Settings → Environment Variables, add `MONGODB_URI` (with a database name, e.g. `…mongodb.net/scf-portfolio?retryWrites=true&w=majority`) and `JWT_SECRET`. Add `ADMIN_EMAIL` / `ADMIN_PASSWORD` only if that database has no admin account yet — or create the account once with `npm run admin -- --email you@example.com`.
3. In MongoDB Atlas → Network Access, allow Vercel to connect (e.g. `0.0.0.0/0`, protected by your database password).
4. Deploy. Visit `/admin` to sign in. Without `MONGODB_URI` the site still shows its backup copy; only the admin panel and the contact inbox need the database.

**Any Node host (Render, Railway, a VPS):** set the same variables plus `NODE_ENV=production`, then run `npm run build && npm start`.

Content changes are live immediately: browsers always revalidate `/api/content` (cheap `304`s). Vercel's CDN answers from its own copy straight away and refreshes it in the background (`CDN-Cache-Control: max-age=10, stale-while-revalidate`), so visitors don't wait for a cold function or the database. Saving in the deployed admin panel deletes that copy (cache tag `content`, `server/lib/cdn.js`), so the edit shows on the next page load. Changes made any other way — scripts, the admin panel on `localhost`, Atlas directly — can show the previous version on the first page load after them, and the change from the next one on.

The built `index.html` also preloads `/api/content` and the font the first screen uses (`vite.config.js`), so they download alongside the scripts instead of after them.

## Project structure

```text
├── api/index.js            # Vercel serverless entry → Express app
├── server.js               # Node entry: API (+ built site with --serve-client)
├── server/
│   ├── app.js              # Express app: security headers, routes, errors
│   ├── models/             # Mongoose models, generated from shared/schema.js
│   ├── routes/             # public (content, contact, images), auth, admin CRUD
│   ├── middleware/         # auth/session, CSRF header check, rate limits, errors
│   ├── migrations/         # one-off content upgrades for existing databases (+ frozen snapshots)
│   ├── bootstrap.js        # first-run seeding (from the backup), migrations, admin creation
│   ├── lib/                # content loading (+ filling from the backup), backup/restore, uploads, mail, CDN refresh
│   └── scripts/            # seed / migrate / admin / backup / restore CLI
├── shared/
│   ├── schema.js           # ★ single source of truth for every editable field
│   ├── theme.js            # colour tokens, presets and contrast rules
│   ├── fallback-content.json # backup copy of the published content (npm run backup)
│   ├── content-backup.js   # when and how the backup is used
│   └── default-content.js  # the default content from the CV (seeds a new database; last-resort fallback)
├── src/
│   ├── Components/         # public sections (Hero, About, Experience, Projects, Education, Courses, Skills, …)
│   │   ├── journey/        # the journey sketched behind the page (JourneyBackdrop.jsx): director, stages, art/
│   │   ├── projects/       # case studies, project cards and dialogs
│   │   ├── illustrations/  # line-art supply chain visuals drawn in code
│   │   └── ui/             # buttons, section header, status badge, filter tabs, modal, …
│   ├── admin/              # admin panel (lazy-loaded bundle), incl. pages/ThemePage.jsx
│   ├── context/            # content loading + caching
│   ├── Layouts/, Routes/   # page shell, homepage section order, routing
│   └── lib/                # API client, theme runtime, font loader, icons, motion presets
└── public/images/          # WebP project screenshots, course images and provider logos, the portrait
```

### Adding a new editable field

Add it to the collection in `shared/schema.js` — the API validation, database model and admin form all pick it up automatically — then render it in the matching component under `src/Components/`.

## Security

- Passwords hashed with bcrypt; sessions are signed JWTs in `httpOnly`, `SameSite=Strict` cookies scoped to `/api`
- Changing the password revokes every other session; 5 failed logins lock the account for 15 minutes, on top of per-IP rate limiting
- State-changing requests require a custom header (CSRF defence in depth); strict input validation; links restricted to `http(s)`, `mailto:`, `tel:` and site paths
- Uploads are checked by their actual bytes (JPEG, PNG, WebP, GIF, AVIF — no SVG), limited to 4 MB, and orphaned files are deleted automatically
- Only signed-in admins can change the palette; colours are validated as HEX and checked for contrast on the server
- Helmet security headers and a Content-Security-Policy; the admin panel is excluded from search engines
- Database errors reach visitors only as a generic message (details stay in the server log), and failures are never cached; the committed backup holds public content only

## Contact

- Email: <mohammadmunnamia0@gmail.com>
- GitHub: <https://github.com/mohammadmunnamia0>
- LinkedIn: <https://www.linkedin.com/in/mdmunnamia0/>
