# How it works — a guided tour

## 0. The front end in one minute

- **Data drives everything.** `public/js/data/projects.js` is a plain array. `components/project-card.js` turns one project into a card, and `components/mockup.js` draws its preview from `preview.kind` + `preview.theme`. The gallery (`pages/projects-page.js`), the home sections (`sections/home-sections.js`) and the detail page (`pages/project-detail.js`) just filter that array.
- **Mockups scale like images but are live HTML.** The frame is a CSS *container*; inside, `font-size` is a fraction of the container width (`cqw`) and every size is in `em`.
- **The hero is layers.** `sections/hero.js` writes `--px/--py` from the pointer; CSS moves each layer by its depth `--d`. The portrait sits between the 3D screen (behind) and the glass console (in front), which hides the photo's bottom edge.
- **Scroll effects** (`initScrollEffects`) set `--sp` on featured mockups and `--pp` on the process line from one throttled scroll handler.


This project is meant to be **read**. Follow the path below; each file has comments explaining the "why".

## 1. Follow one request end to end (Friesta checkout)

1. `public/friesta.html` — plain HTML. Note `<script type="module">`.
2. `public/js/pages/friesta.js` — loads the menu with `api.get('menu')`, renders cards, uses a cart store.
3. `public/js/lib/api.js` — the single doorway to the back end. Decides live vs demo mode.
4. `public/js/lib/cart-ui.js` — the checkout drawer. On submit it calls `api.post('orders', …)`.
5. `server/app.js` — the request lifecycle: security headers → CORS → rate limit → router.
6. `server/routes/orders.js` — a *thin* handler: read JSON, call the service, return a status code.
7. `public/js/shared/order-service.js` — the real rules: validate, check stock, price, save.
8. `server/db.js` — serialized, atomic writes to `server/data/db.json`.
9. `public/js/pages/dashboard.js` — the order now shows up in analytics.

## 2. Ideas worth understanding

| Idea | Where to look |
|---|---|
| Never trust the client | `order-service.js`, test "quote ignores client prices" |
| Isomorphic code (same logic in browser + server) | `public/js/shared/` |
| Separation of concerns | routes (HTTP) vs services (rules) vs db (storage) |
| Money as integers | `shared/money.js` |
| Centralised error handling | the `catch` block in `server/app.js` |
| Rate limiting, CORS, CSP | `server/middleware.js` |
| Path-traversal defence | `server/static.js`, test "path traversal is blocked" |
| Debounce + "latest request wins" | `pages/storefront.js`, `lib/cart-ui.js` |
| State → render | `pages/todo.js` |
| Data-driven UI | `data/projects.js` → `components/project-card.js` |
| Container-query scaling | `css/mockups.css` |
| Layered parallax | `sections/hero.js`, `.layer` in `css/home.css` |
| Recursive-descent parsing | `shared/calc-parser.js` |
| 3D projection (`x * focal / depth`) | `lib/engine3d.js` |
| CSS 3D (`perspective`, `preserve-3d`) | `.card` in `base.css`, `lib/tilt.js`, `.ring-track` |
| Accessible charts (table view, keyboard, text colours) | `lib/charts.js`, dashboard |

## 3. Exercises (easy → hard)

1. Add a new Friesta menu item in `scripts/generate-seed.js`, run `npm run seed`, and see it appear.
2. Add a new project to `data/projects.js` and watch it appear in the gallery, filters and its own detail page.
3. Change `--accent` in `base.css` to another colour. Watch the whole site (and charts) change.
4. Add a new promo code `SAVE50` (flat ₱50 off ₱500+) and write a test for it in `tests/api.test.js`.
5. Add a `GET /api/orders/:id` endpoint so customers can look up their order status. Think about what data it should *not* reveal.
6. Add `sqrt` to the keypad row of the calculator. Add a `factorial` function (`5!`) to the parser.
7. Give the 3D hero a new shape (try a cube using `boxMesh`) and make it react to scroll.
8. Replace `db.js` with SQLite (`node:sqlite` ships with recent Node versions). Only `db.js` should need to change. That is the point of separating storage.
9. Add user accounts: password hashing with `crypto.scrypt`, sessions in an HTTP-only cookie.

## 4. Testing

`npm test` runs `tests/*.test.js` with Node's built-in test runner. The API tests start the real server on a random port with an in-memory database and call it with `fetch`, the same way a browser would. One of those tests exists because it caught a real bug while building this: stock was checked per cart line, so the same product on three lines could oversell.
