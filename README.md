# QA x DEV M — Mohammad Munna's Portfolio

A minimalist, typography-driven portfolio (React + Framer Motion) for an SQA Engineer with a front-end and full-stack background, with a secure admin panel: every piece of content — profile, SQA and development projects, experience, education, certifications, achievements, skills, stats, FAQs, testimonials, social links, the order of homepage sections and the **colour palette** — is managed from `/admin` and stored in MongoDB.

## Features

### Public site

- Oversized condensed headings, light Geist body text and a warm-grey palette, following the reeves.webflow.io references
- One portrait, set into the hero headline; restrained motion (masked heading reveals, gentle fades, slight card tilt) — no glow effects
- **Explore My Work** — one section for all projects (`src/Components/Projects.jsx`). Two category cards, **SQA & Test Automation** (current focus) and **Software Development** (previous experience), grow and give way with a light spring on hover (on press on touch screens); choosing one opens its projects in a Bento showcase (`projects/bento.js`) with the category's filter tabs beside the heading, detail dialogs, and compact GitHub / Live buttons only where a link exists. The cards take their wording from the SQA projects and Development sections in Admin → Sections; the menu links to them open the matching category
- Project previews: a screenshot, a code excerpt from the repository, or the main tools; development screenshots sit in a slim browser frame with nothing overlaid
- Experience with the current role highlighted, CV skill groups (QA first), education with certifications and achievements
- Cards that stack as you scroll (`src/hooks/useCardStack.js`, `.stack` in `src/index.css`): Experience on every screen size, the project and Skills cards on phones — ordinary lists with "reduce motion" and while tabbing with the keyboard
- Contact form: messages are saved to the admin inbox **and** forwarded by email via Web3Forms
- `/projects` lists everything in two groups (`?view=sqa` / `?view=dev`); the old `/ProjectsDetails` URL still works
- Fully responsive, keyboard accessible, honours "reduce motion"; falls back to bundled content if the API is down

### Admin panel (`/admin`)

- Add, edit, delete, hide/show and drag-to-reorder any content; image uploads (resized to WebP in the browser)
- **Theme & colours:** presets (the reference palette is the default), colour pickers with HEX inputs, a live preview, “Preview on site”, publish / discard / reset to default, and WCAG contrast checks that block unreadable palettes (enforced by the API too)
- Profile & SEO editor, section manager, messages inbox, password change, JSON backup export

## Tech stack

React 18 · Vite · Tailwind CSS · Framer Motion · React Router · Express · MongoDB (Mongoose) · JWT (httpOnly cookie) · bcrypt

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

- Defaults (the “Reeves Dark” palette from the design references) are declared in `shared/theme.js` and mirrored in `src/index.css` for the first paint.
- A palette published in **Admin → Theme & colours** is stored in the `theme` collection, returned by `/api/content`, and applied at runtime (`src/lib/theme.js`) — no rebuild needed.
- Contrast rules for every text/background pairing live in `shared/theme.js`; the admin editor and the API both refuse palettes that fail them. Error text picks a readable red automatically for dark or light palettes.
- The admin panel itself always uses the default palette, so a custom palette can never make it hard to use.

### Typography

The condensed display face is used only where it's set huge — the hero headline, section titles, the footer line and page titles. Everything inside sections uses Geist, through shared classes in `src/index.css`:

| Class | Use | Style |
| --- | --- | --- |
| `.title-item` | role, degree and skill-group names | Geist 400, 24 → 32px, tight tracking |
| `.title-card` | project names on cards (three to a row on large screens) | Geist 400, 20 → 22px |
| `.copy` | paragraphs, descriptions, bullet points, answers | Geist 300, 16 → 17px, 1.7 line height |
| `.copy-card` | taglines and summaries on project cards | Geist 300, 15px, 1.6 line height |
| `.meta` | dates, places, field labels, counters | Geist 400, 13px uppercase, spaced |
| `.tag` | project type / category badge | Geist 400, 12px uppercase pill |
| `.chip`, `.chip-line` | tools, technologies, skills (`.chip-sm`: compact, for cards) | Geist 300, 14px (13px), original casing |
| `.capsule` | About: current focus and previous experience items | numbered `.chip-line`, side by side; fills from the bottom on hover |

- **Geist** (body, 16px / 22px, weight 300 for body copy; 400 for titles and labels) — bundled from `@fontsource-variable/geist` (SIL Open Font License).
- **Humane** (display headings) — not openly licensed, so it is **not** bundled. Get the files from the foundry with a licence covering web use and drop the `.woff2`/`.woff` files into `src/assets/fonts/humane/` — they are registered automatically (`src/lib/fonts.js`). Until then headings use **Six Caps** (`@fontsource/six-caps`, SIL OFL), which has the same ultra-condensed proportions.
- Fonts are self-hosted; the Content-Security-Policy allows no external font hosts.

## Content migrations

Databases created by an older version are upgraded by `server/migrations/` (run on API start, or with `npm run migrate`). Each migration runs once (tracked in the `meta` collection) and never overwrites content edited in the admin: a value is replaced only while it still holds the original text, and retired items are hidden rather than deleted when in doubt. New databases are seeded with the current content and skip existing migrations. To change content for existing databases, add a new migration — don't edit one that may already have run.

## Backup & fallback

The site never depends on the database alone — it keeps working when the database is unavailable. `shared/fallback-content.json`, committed with the code, is a copy of everything the site publishes: the sections in the reference screenshot — hero, About, stats, SQA projects, experience, development projects, skills, education with certifications and achievements, contact and footer — with their text, links (GitHub, LinkedIn, email, résumé, project repositories and live sites), image paths and the published palette. It holds public content only (the same data `/api/content` serves every visitor), never credentials. The rules live in `shared/content-backup.js`.

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

1. In Vercel → Settings → Environment Variables, add `MONGODB_URI`, `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`.
2. In MongoDB Atlas → Network Access, allow Vercel to connect (e.g. `0.0.0.0/0`, protected by your database password).
3. Deploy. Visit `/admin` to sign in.

**Any Node host (Render, Railway, a VPS):** set the same variables plus `NODE_ENV=production`, then run `npm run build && npm start`.

Content changes are live immediately: browsers always revalidate `/api/content` (cheap `304`s). Vercel's CDN answers from its own copy straight away and refreshes it in the background (`CDN-Cache-Control: max-age=10, stale-while-revalidate`), so visitors don't wait for a cold function or the database. Saving in the deployed admin panel deletes that copy (cache tag `content`, `server/lib/cdn.js`), so the edit shows on the next page load. Changes made any other way — scripts, the admin panel on `localhost`, Atlas directly — can show the previous version on the first page load after them, and the change from the next one on.

The built `index.html` also preloads `/api/content` and the two fonts the first screen uses (`vite.config.js`), so they download alongside the scripts instead of after them.

## Project structure

```text
├── api/index.js            # Vercel serverless entry → Express app
├── server.js               # Node entry: API (+ built site with --serve-client)
├── server/
│   ├── app.js              # Express app: security headers, routes, errors
│   ├── models/             # Mongoose models, generated from shared/schema.js
│   ├── routes/             # public (content, contact, images), auth, admin CRUD
│   ├── middleware/         # auth/session, CSRF header check, rate limits, errors
│   ├── migrations/         # one-off content upgrades for existing databases
│   ├── bootstrap.js        # first-run seeding (from the backup), migrations, admin creation
│   ├── lib/                # content loading (+ filling from the backup), backup/restore, uploads, mail, CDN refresh
│   └── scripts/            # seed / migrate / admin / backup / restore CLI
├── shared/
│   ├── schema.js           # ★ single source of truth for every editable field
│   ├── theme.js            # colour tokens, presets and contrast rules
│   ├── fallback-content.json # backup copy of the published content (npm run backup)
│   ├── content-backup.js   # when and how the backup is used
│   └── default-content.js  # the original default content (last-resort fallback)
├── src/
│   ├── Components/         # public sections (Hero, SqaProjects, DevProjects, Experience, …) and ui/ primitives
│   ├── admin/              # admin panel (lazy-loaded bundle), incl. pages/ThemePage.jsx
│   ├── assets/fonts/humane # drop licensed Humane files here
│   ├── context/            # content loading + caching
│   ├── Layouts/, Routes/   # page shell, homepage section order, routing
│   └── lib/                # API client, theme runtime, font loader, icons, motion presets
└── public/images/          # optimised WebP project screenshots and the portrait
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
- LinkedIn: <https://www.linkedin.com/in/md-munna-mia-340225219/>
