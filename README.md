# Liorgio Ilanan — 3D UI/UX & Full-Stack Portfolio

A premium, dark "night studio" portfolio: a 3D hero built around a real transparent portrait, **34 projects** (UI/UX, web design, full-stack and interactive tools) generated from one data file, an interactive UI/UX showcase, and working full-stack demos on a **zero-dependency Node.js API**.

No framework, no npm packages, no build step. Plain HTML, CSS and JavaScript modules, so the code is easy to read and learn from, and it deploys to GitHub Pages as-is.

> **Honesty labels.** Every project says what it is. **Live Demo** = built and working in this repo. **Concept Project** / **UI/UX Exploration** = self-initiated design studies. Nothing is presented as client work, and no results or testimonials are invented.

## Quick start

```bash
node --version   # Node 20 or newer
npm start        # http://localhost:3000  (site + API, "live mode")
npm test         # automated tests (API + shared logic)
npm run dev      # restarts the server when files change
```

Open pages through a server (`npm start`, or any static server such as `npx serve public`). Browsers block ES modules on `file://`, so double-clicking the HTML files won't work.

## Deploy to GitHub Pages

1. Push the repo to GitHub (branch `main`).
2. Repo **Settings → Pages → Source: GitHub Actions**.
3. The included workflow (`.github/workflows/pages.yml`) publishes the `public/` folder. Your site appears at `https://<username>.github.io/<repo>/`.

Every path in the site is **relative**, so it works under a repository sub-path without a base-path setting. Project detail pages use a query string (`project.html?id=...`) on a real file, so refreshing any page never 404s. A custom `404.html` handles mistyped URLs.

### What works on GitHub Pages and what needs a server

GitHub Pages only serves static files. The site detects this automatically:

| Feature | On GitHub Pages ("demo mode") | With `npm start` / a Node host ("live mode") |
|---|---|---|
| Home, gallery, project pages, showcase | ✅ Fully works | ✅ |
| Friesta / Storefront checkout, Analytics | ✅ Emulated in the browser with the same business code. Data stays in that visitor's browser. | ✅ Real API, data saved in `server/data/db.json` |
| Quiz / Reaction leaderboards | Per-browser only | ✅ Shared by all visitors |
| Contact form | Opens the visitor's email app with the message pre-filled (it never pretends to send) | ✅ Saved by the API |

For the live mode online, host the whole repo on a Node host (Render, Railway, Fly.io…) with start command `npm start` and env `ADMIN_KEY=<secret>`. To keep the front end on Pages and the API elsewhere, add `<meta name="api-base" content="https://your-api.example.com">` to the pages and set `CORS_ORIGIN=https://<username>.github.io` on the server. No secrets live in the repo (`.env` is git-ignored; see `.env.example`).

## Folder structure

```
public/                         ← the website (what GitHub Pages serves)
  index.html                      home: hero, featured, showcase, websites, full-stack,
                                  skills, process, case studies, about, experience, FAQ, contact
  projects.html                   gallery with filters + search (?filter=uiux|web|mobile|fullstack|lab)
  project.html                    project detail page (?id=<project-id>)
  contact.html                    contact form + copy-email
  friesta.html, storefront.html,  live full-stack demos
  analytics-dashboard.html
  calculator.html, todo.html, quiz.html, color-lab.html, reaction-game.html   interactive lab
  case-study.html, research.html  long-form writing
  about.html                      redirect stub → index.html#about (keeps old links working)
  404.html
  assets/img/                     portrait.webp / .png (transparent cutout), portrait-bust.webp
  css/
    base.css        design system: tokens, type, buttons, glass cards, nav, motion
    components.css  toasts, drawer, tables, stats
    mockups.css     the generated project previews
    gallery.css     project cards, bento grid, filters, detail page
    home.css        hero + home sections
    pages.css       styles for the demo pages
  js/
    layout.js       shared header/footer, scroll-spy, reveal, tilt, copy-email (loaded on every page)
    data/           ✏️  CONTENT YOU EDIT
      site.js         name, email, socials, portrait paths, nav
      projects.js     all 34 projects
      home.js         skills, process, case studies, experience, FAQ, featured ids
    components/     reusable UI: project-card.js, mockup.js, copy-email.js
    sections/       home page sections: hero.js, showcase.js, home-sections.js
    pages/          one entry script per page (home.js, projects-page.js, project-detail.js, friesta.js…)
    lib/            infrastructure: dom helpers, 3D engine, tilt, API client, mock API, cart, charts
    shared/         pure business logic used by BOTH browser and server (pricing, validation, analytics)
    utils/          icons.js
  data/seed.json, data/quiz.json  demo data
server/                         ← zero-dependency Node API (router, db, security middleware, routes)
tests/                          ← node:test suites
scripts/generate-seed.js        ← regenerates demo orders
docs/HOW-IT-WORKS.md            ← guided tour for learning
```

## Customising

### Your email
Edit `email` in `public/js/data/site.js`. The nav button, hero, contact section, footer, contact page and every copy-email button read it from there. (The address also appears as plain fallback text in `index.html` for visitors without JavaScript; search for `mailto:` to update those three links.)

Your phone number has been removed from the whole site on purpose. Email is the only contact method.

### Social links
Fill in the `url` of GitHub / LinkedIn / Dribbble in `site.js`. Empty ones are hidden automatically.

### Your portrait
The hero uses a transparent cutout: `public/assets/img/portrait.webp` (plus `portrait.png` fallback) and `portrait-bust.webp` for About. To replace it:
1. Make a transparent PNG of yourself (remove.bg, Photoshop "Remove background", Figma, or `rembg`). Keep the top of your head inside the frame; the bottom edge is hidden behind the glass console.
2. Export a ~1400 px wide **WebP with transparency** as `portrait.webp` and a PNG as `portrait.png` (same names), plus a square head-and-shoulders crop as `portrait-bust.webp`.
3. If the proportions differ a lot, adjust `.portrait { left, width, bottom }` in `css/home.css` and update the `width`/`height` attributes on the `<img>` in `index.html`.

Update the `alt` text in `index.html` and `site.js` if the new photo looks different.

### Add / edit / remove a project
Open `public/js/data/projects.js` and copy an existing object:

```js
{
  id: 'my-new-app',                 // used in project.html?id=my-new-app
  title: 'My New App',
  category: 'uiux',                 // 'uiux' | 'web' | 'fullstack' | 'lab'
  platform: 'mobile',               // 'mobile' also appears under "Mobile Apps"
  status: 'concept',                // 'concept' | 'exploration' | 'live' (needs `demo`)
  size: '',                         // gallery card: '' | 'wide' | 'tall' | 'xl'
  demo: 'my-new-app.html',          // only for real, working demos
  summary: '…', problem: '…', approach: '…',
  features: ['…', '…'], tech: ['…'],
  preview: { kind: 'phone-bank', brand: 'MyApp', headline: 'Hello', theme: T.night, hue: 220 },
}
```

The gallery, filters, counts, home sections and detail page update automatically. `preview.kind` picks one of ~30 generated mockup layouts in `js/components/mockup.js` (e.g. `dashboard`, `kanban`, `calendar`, `auth`, `site-editorial`, `site-shop`, `phone-food`, `phone-feed`). To show a real screenshot instead, you can extend `mockup.js` with an `image` kind.

### Skills and experience
`public/js/data/home.js`. Skills marked `core` are the ones you listed yourself (HTML, CSS, JavaScript, UI Design). `demo` = used to build this repo. `placeholder` items (Figma, React, TypeScript, SQL) are clearly tagged. Change them only if true, or delete them. Experience has one real entry and two labelled placeholders; replace them, or set `showPlaceholders: false` in `site.js` to hide placeholders.

## API (live mode)

| Method | Path | Notes |
|---|---|---|
| GET | `/api/health` | |
| GET | `/api/menu` · `/api/products` | Friesta menu, Storefront catalogue (`?category=&q=&sort=`) |
| POST | `/api/orders/quote` · `/api/orders` | Server-side pricing, validation (422), stock (409) |
| PATCH | `/api/orders/:id` | Needs `X-Admin-Key` |
| GET | `/api/analytics?days=30&shop=all` | |
| POST | `/api/contact` | Honeypot spam trap |
| GET/POST | `/api/scores/:game` | `reaction` / `quiz` |

## Accessibility & performance

Semantic landmarks, skip link, keyboard-operable everything (gallery, phone fan, compare slider, tooltips, menu with Escape), visible focus rings, alt text, WCAG-checked colours, `prefers-reduced-motion` turns off parallax/3D motion, canvases pause when off-screen, gallery cards use `content-visibility`, the portrait is a 168 KB WebP, and there are zero third-party requests.

## License

MIT
