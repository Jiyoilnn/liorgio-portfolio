/**
 * mockup.js — draws a realistic-looking preview of a project from data alone.
 *
 * No screenshots needed: each `preview.kind` is a tiny layout made from boxes, text and
 * SVG charts, coloured by `preview.theme`. Because everything is sized in `em` and the
 * frame's font-size follows its width (CSS container query units), the same mockup looks
 * right as a small card, a big hero or on a phone.
 *
 * Want a new look? Add a function to KINDS below and use its name in data/projects.js.
 */
import { h } from '../lib/dom.js';
import { s } from '../lib/charts.js';

// ---- tiny helpers -----------------------------------------------------------------------
/** Deterministic random numbers from a string, so each project always looks the same. */
function rng(seedText) {
  let x = [...seedText].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 2166136261) || 1;
  return () => ((x = (x * 1664525 + 1013904223) >>> 0) / 4294967296);
}
const div = (cls, ...kids) => h('div', { class: cls }, ...kids);
const t = (text, cls = '') => h('span', { class: `m-t ${cls}` }, text);
const line = (w, cls = '') => h('i', { class: `m-line ${cls}`, style: { width: `${w}%` } });
const lines = (r, n, min = 40, max = 95) => Array.from({ length: n }, () => line(min + r() * (max - min)));
/** A fake "photo": layered gradients from a hue. */
const img = (hue, cls = '', shift = 0) => h('div', { class: `m-img ${cls}`, style: { '--h': hue + shift } });
const dot = (cls = '') => h('i', { class: `m-dot ${cls}` });
const btn = (text, cls = '') => h('span', { class: `m-btn ${cls}` }, text);

/** Smooth SVG area chart from random-walk values. */
function area(r, { w = 100, hgt = 36, n = 14, fill = true } = {}) {
  let v = 40 + r() * 20;
  const pts = Array.from({ length: n }, (_, i) => { v = Math.max(8, Math.min(92, v + (r() - 0.42) * 18)); return [(i / (n - 1)) * w, hgt - (v / 100) * hgt]; });
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
  return s('svg', { viewBox: `0 0 ${w} ${hgt}`, preserveAspectRatio: 'none', class: 'm-chart', 'aria-hidden': 'true' },
    fill ? s('path', { d: `${d} L${w} ${hgt} L0 ${hgt} Z`, class: 'm-area' }) : null,
    s('path', { d, class: 'm-stroke' }));
}
function bars(r, n = 8) {
  return div('m-bars', Array.from({ length: n }, () => h('i', { style: { height: `${25 + r() * 75}%` } })));
}
function ring(pct, cls = '') {
  const c = 2 * Math.PI * 15.9;
  return s('svg', { viewBox: '0 0 36 36', class: `m-ring ${cls}`, 'aria-hidden': 'true' },
    s('circle', { cx: 18, cy: 18, r: 15.9, class: 'm-ring-bg' }),
    s('circle', { cx: 18, cy: 18, r: 15.9, class: 'm-ring-fg', 'stroke-dasharray': `${(pct / 100) * c} ${c}` }));
}
const nav = (brand, items = ['Shop', 'About', 'Journal']) =>
  div('m-nav', t(brand, 'm-brand'), div('m-navlinks', items.map((i) => t(i, 'm-xs'))), btn('Menu', 'm-ghost'));

// ---- the layouts --------------------------------------------------------------------------
const KINDS = {
  // ----------------------------------------------------------------- dashboards
  dashboard: (p, r) => div('m-dash',
    div('m-side', t(p.brand[0], 'm-logo'), Array.from({ length: 5 }, (_, i) => dot(i === 0 ? 'on' : ''))),
    div('m-main',
      div('m-top', t(p.headline, 'm-h'), div('m-row', btn('30 days', 'm-ghost'), h('i', { class: 'm-avatar' }))),
      div('m-kpis', ['Revenue', 'Orders', 'Avg. order'].map((k, i) => div('m-kpi', t(k, 'm-xs m-muted'), t(['₱205k', '220', '₱934'][i], 'm-kv'), t(['+14.9%', '+31%', '−12%'][i], `m-xs ${i === 2 ? 'm-down' : 'm-up'}`)))),
      div('m-card m-grow', t('Revenue', 'm-xs m-muted'), area(r, { n: 18 })),
      div('m-split', div('m-card', bars(r, 10)), div('m-card', lines(r, 3))))),

  'dashboard-health': (p, r) => div('m-dash',
    div('m-side', t('+', 'm-logo'), Array.from({ length: 5 }, (_, i) => dot(i === 1 ? 'on' : ''))),
    div('m-main',
      div('m-top', t(`${p.brand} · ${p.headline}`, 'm-h'), btn('3 alerts', 'm-alert')),
      div('m-split',
        div('m-card m-grow', t('Heart rate · bed 12', 'm-xs m-muted'), t('82 bpm', 'm-kv'), area(r, { n: 24, fill: false })),
        div('m-card m-center', ring(72), t('Beds 72%', 'm-xs'))),
      div('m-card', ['M. Santos', 'J. Cruz', 'A. Reyes', 'B. Garcia'].map((n, i) =>
        div('m-tr', h('i', { class: 'm-avatar sm' }), t(n, 'm-xs'), line(30 + r() * 30), t(['Stable', 'Watch', 'Stable', 'Alert'][i], `m-pill ${i === 3 ? 'm-pill-alert' : i === 1 ? 'm-pill-warn' : ''}`)))))),

  'dashboard-course': (p, r) => div('m-dash',
    div('m-side', t(p.brand[0], 'm-logo'), Array.from({ length: 5 }, (_, i) => dot(i === 2 ? 'on' : ''))),
    div('m-main',
      div('m-top', t(p.headline, 'm-h'), t('Due today: 2', 'm-pill')),
      div('m-tiles', ['UI Design', 'JavaScript', 'Databases'].map((c, i) => div('m-card m-tile', img(p.hue, 'm-thumb', i * 40), t(c, 'm-s'), div('m-progress', h('i', { style: { width: `${30 + r() * 60}%` } }))))),
      div('m-card', t('Upcoming', 'm-xs m-muted'), ['Wireframe review', 'Quiz: Flexbox', 'Project brief'].map((x) => div('m-tr', dot('on'), t(x, 'm-xs'), line(25)))))),

  'dashboard-table': (p, r) => div('m-dash',
    div('m-side', t(p.brand[0], 'm-logo'), Array.from({ length: 5 }, (_, i) => dot(i === 0 ? 'on' : ''))),
    div('m-main',
      div('m-top', t(p.headline, 'm-h'), div('m-row', btn('Export', 'm-ghost'), btn('+ Delivery'))),
      div('m-kpis', ['SKUs', 'Low stock', 'Incoming'].map((k, i) => div('m-kpi', t(k, 'm-xs m-muted'), t(['1,284', '17', '6'][i], 'm-kv')))),
      div('m-card m-grow', ['Rice 25kg', 'Cooking oil', 'Canned tuna', 'Coffee 3-in-1', 'Sugar 1kg'].map((n, i) => {
        const pct = i === 2 ? 8 : 20 + r() * 75;
        return div('m-tr', t(n, 'm-xs'), div('m-progress', h('i', { class: pct < 15 ? 'low' : '', style: { width: `${pct}%` } })), t(pct < 15 ? 'Low' : 'OK', `m-pill ${pct < 15 ? 'm-pill-alert' : ''}`));
      })))),

  'admin-products': (p, r) => div('m-dash',
    div('m-side', t(p.brand[0], 'm-logo'), Array.from({ length: 5 }, (_, i) => dot(i === 1 ? 'on' : ''))),
    div('m-main',
      div('m-top', t(p.headline, 'm-h'), div('m-row', h('i', { class: 'm-search' }), btn('+ Product'))),
      div('m-card m-grow', ['Essential Heavy Tee', 'Relaxed Hoodie', 'Utility Cargo Pants', 'Utility Cap', 'Ribbed Beanie'].map((n, i) =>
        div('m-tr', img(p.hue, 'm-swatch', i * 55), t(n, 'm-xs'), t(['₱690', '₱1,490', '₱1,890', '₱450', '₱390'][i], 'm-xs m-muted'), div('m-progress', h('i', { class: i === 2 ? 'low' : '', style: { width: `${i === 2 ? 12 : 35 + r() * 60}%` } }))))),
      div('m-split', div('m-card', t('Sales', 'm-xs m-muted'), area(r, { n: 12 })), div('m-card', bars(r, 7))))),

  'admin-table': (p, r) => div('m-dash',
    div('m-side', t(p.brand[0], 'm-logo'), Array.from({ length: 5 }, (_, i) => dot(i === 3 ? 'on' : ''))),
    div('m-main',
      div('m-top', t(p.headline, 'm-h'), div('m-row', h('i', { class: 'm-search' }), btn('Invite'))),
      div('m-card m-grow', ['Ana Reyes', 'Mark Santos', 'Bea Cruz', 'Paolo Garcia', 'Kyla Ramos', 'Lance Tan'].map((n, i) =>
        div('m-tr', h('i', { class: 'm-avatar sm', style: { '--h': (i * 50 + p.hue) % 360 } }), t(n, 'm-xs'), t(['Owner', 'Admin', 'Editor', 'Viewer', 'Editor', 'Viewer'][i], 'm-pill'), h('i', { class: `m-toggle ${r() > 0.35 ? 'on' : ''}` })))),
      div('m-card', t('Audit log', 'm-xs m-muted'), lines(r, 2)))),

  kanban: (p, r) => div('m-board-wrap',
    div('m-top', t(`${p.brand} · ${p.headline}`, 'm-h'), div('m-row', h('i', { class: 'm-avatar sm' }), h('i', { class: 'm-avatar sm' }), btn('+ Task'))),
    div('m-board', ['To do', 'In progress', 'Done'].map((col, ci) => div('m-col', t(`${col} ${[4, 2, 5][ci]}`, 'm-xs m-muted'),
      Array.from({ length: [3, 2, 3][ci] }, () => div('m-card m-task', t(['UI', 'API', 'Bug', 'Docs'][Math.floor(r() * 4)], `m-tag t${Math.floor(r() * 3)}`), lines(r, 2, 50, 90))))))),

  crm: (p, r) => div('m-board-wrap',
    div('m-top', t(`${p.brand} · ${p.headline}`, 'm-h'), t('₱1.2M open', 'm-pill')),
    div('m-board', ['Lead', 'Qualified', 'Proposal', 'Won'].map((col, ci) => div('m-col', t(col, 'm-xs m-muted'),
      Array.from({ length: [3, 2, 2, 1][ci] }, () => div('m-card m-task', t(`₱${Math.round(20 + r() * 180)}k`, 'm-s'), line(70), div('m-row', h('i', { class: 'm-avatar sm' }), t('Fri', 'm-xs m-muted')))))))),

  'order-board': (p, r) => div('m-board-wrap',
    div('m-top', t(`${p.brand} · Kitchen`, 'm-h'), t('● Live', 'm-pill m-pill-ok')),
    div('m-board', ['New', 'Frying', 'Ready'].map((col, ci) => div('m-col', t(col, 'm-xs m-muted'),
      Array.from({ length: [3, 2, 2][ci] }, (_, k) => div('m-card m-task', div('m-row m-between', t(`FR-${1410 - ci * 3 - k}`, 'm-s'), t(`₱${Math.round(60 + r() * 240)}`, 'm-xs')), t(['Cheese Blast ×2', 'Barkada Bucket', 'Spicy Cajun', 'Solo Combo'][Math.floor(r() * 4)], 'm-xs m-muted'))))))),

  calendar: (p, r) => div('m-dash no-side',
    div('m-main',
      div('m-top', t(`${p.brand} · ${p.headline} 2026`, 'm-h'), div('m-row', btn('‹', 'm-ghost'), btn('›', 'm-ghost'))),
      div('m-split wide',
        div('m-card m-cal', Array.from({ length: 35 }, (_, i) => h('i', { class: r() < 0.28 ? 'busy' : i === 11 ? 'today' : '' }, i < 31 ? String(i + 1) : ''))),
        div('m-card', t('Mon, Oct 12', 'm-s'), ['9:00 AM', '10:30 AM', '1:00 PM', '3:30 PM'].map((x, i) => div(`m-slot ${i === 1 ? 'on' : ''}`, t(x, 'm-xs')))))) ),

  editor: (p, r) => div('m-dash',
    div('m-side wide', t('Posts', 'm-xs m-muted'), ['Draft: Hello', 'Design notes', 'Shipping v2'].map((x, i) => div(`m-postlink ${i === 0 ? 'on' : ''}`, t(x, 'm-xs')))),
    div('m-main',
      div('m-top', t('Draft · saved', 'm-xs m-muted'), div('m-row', btn('Preview', 'm-ghost'), btn('Publish'))),
      div('m-doc', t(p.headline, 'm-docTitle'), lines(r, 3, 70, 100), img(p.hue, 'm-docImg'), lines(r, 3, 60, 100)))),

  auth: (p) => div('m-auth',
    div('m-auth-art', img(p.hue, 'm-fill'), t(p.brand, 'm-brand on-img')),
    div('m-auth-form', t(p.headline, 'm-h'), t('Log in to continue', 'm-xs m-muted'),
      div('m-input', t('you@email.com', 'm-xs m-muted')), div('m-input', t('••••••••', 'm-xs m-muted')),
      btn('Log in', 'm-block'), div('m-row m-center', t('or', 'm-xs m-muted')), btn('Continue with Google', 'm-ghost m-block'))),

  // ----------------------------------------------------------------- websites
  'site-editorial': (p, r) => div('m-site',
    nav(p.brand, ['Women', 'Men', 'Journal']),
    div('m-ed', div('m-ed-copy', t('FW 2026', 'm-xs m-muted'), t(p.headline, 'm-serif'), btn('Discover', 'm-ghost')), img(p.hue, 'm-ed-img'), img(p.hue, 'm-ed-img2', 30))),

  'site-split': (p, r) => div('m-site',
    nav(p.brand, ['Menu', 'Visit', 'Reserve']),
    div('m-splitHero', div('m-hero-copy', t(p.headline, 'm-display'), lines(r, 2), div('m-row', btn('Reserve a table'), btn('View menu', 'm-ghost'))), img(p.hue, 'm-hero-img')),
    div('m-menu', ['Grilled liempo', 'Kinilaw', 'Sinigang'].map((d) => div('m-tr', t(d, 'm-xs'), h('i', { class: 'm-dots' }), t(`₱${Math.round(180 + r() * 300)}`, 'm-xs'))))),

  'site-personal': (p, r) => div('m-site',
    nav(p.brand, ['Work', 'About', 'Contact']),
    div('m-personal', img(p.hue, 'm-face'), t(p.brand, 'm-display center'), t(p.headline, 'm-s m-muted'), btn('Say hello')),
    div('m-tiles three', [0, 1, 2].map((i) => img(p.hue, 'm-thumb', i * 25)))),

  'site-bold': (p) => div('m-site',
    nav(p.brand, ['Work', 'Studio', 'Contact']),
    div('m-bold', t(p.headline, 'm-mega')),
    div('m-marquee', ['Branding', 'Web', 'Motion', 'Strategy', 'Branding'].map((x) => t(`${x} ✦`, 'm-s')))),

  'site-listings': (p, r) => div('m-site',
    nav(p.brand, ['Buy', 'Rent', 'Sell']),
    div('m-searchbar wide', t('Quezon City · 3 bedrooms · under ₱8M', 'm-xs m-muted'), btn('Search')),
    div('m-tiles three', [0, 1, 2].map((i) => div('m-card m-tile', img(p.hue, 'm-thumb', i * 30), t(`₱${(4 + r() * 6).toFixed(1)}M`, 'm-s'), t(`≈ ₱${Math.round(20 + r() * 30)}k / month`, 'm-xs m-muted'))))),

  'site-hero-search': (p) => div('m-site m-photo',
    img(p.hue, 'm-bg'),
    nav(p.brand, ['Stays', 'Flights', 'Tours']),
    div('m-overlay', t(p.headline, 'm-display on-img'), div('m-searchbar', t('Where to?', 'm-xs m-muted'), t('Dates', 'm-xs m-muted'), t('2 guests', 'm-xs m-muted'), btn('Search')))),

  'site-showcase': (p, r) => div('m-site m-dark-hero',
    nav(p.brand, ['Models', 'Charge', 'Test drive']),
    div('m-show', t(p.headline, 'm-display'), div('m-car', h('i', { class: 'm-car-body' }), h('i', { class: 'm-wheel a' }), h('i', { class: 'm-wheel b' })),
      div('m-specs', [['520', 'km range'], ['3.2s', '0–100'], ['250', 'kW']].map(([a, b]) => div('m-spec', t(a, 'm-kv'), t(b, 'm-xs m-muted')))))),

  'site-saas': (p, r) => div('m-site',
    nav(p.brand, ['Product', 'Docs', 'Pricing']),
    div('m-saas', t('New · v2 is live', 'm-pill'), t(p.headline, 'm-display center'), div('m-row m-center', btn('Start free'), btn('Read docs', 'm-ghost'))),
    div('m-screenshot', div('m-code', ['const api = launch()', "api.route('/orders')", 'await api.deploy()'].map((c) => t(c, 'm-xs m-mono'))), area(r, { n: 10 }))),

  'site-grid': (p) => div('m-site',
    nav(p.brand, ['Projects', 'Studio', 'Contact']),
    div('m-asym', div('m-asym-copy', t(p.headline, 'm-serif')), img(p.hue, 'a'), img(p.hue, 'b', 20), img(p.hue, 'c', -15))),

  'site-shop': (p, r) => div('m-site',
    nav(p.brand, ['Living', 'Dining', 'Outdoor']),
    div('m-shopHero', t(p.headline, 'm-display'), btn('Shop the collection')),
    div('m-tiles four', ['Lounge chair', 'Side table', 'Rattan lamp', 'Bench'].map((n, i) => div('m-prod', img(p.hue, 'm-thumb sq', i * 18), t(n, 'm-xs'), t(`₱${(4 + r() * 30).toFixed(1)}k`, 'm-xs m-muted'))))),

  // ----------------------------------------------------------------- phones
  'phone-bank': (p, r) => div('m-app',
    div('m-row m-between', t('Hi, Liorgio', 'm-s'), h('i', { class: 'm-avatar sm' })),
    div('m-bankcard', t('Balance', 'm-xs'), t(p.headline, 'm-kv'), t('•••• 4821', 'm-xs m-mono')),
    div('m-actions', ['Send', 'Request', 'Pay', 'Save'].map((a) => div('m-action', h('i'), t(a, 'm-xs')))),
    div('m-card', t('Savings goal', 'm-xs m-muted'), div('m-row', ring(64, 'sm'), t('Laptop · ₱32k', 'm-xs'))),
    ['GCash top-up', 'Jollibee', 'Salary'].map((x, i) => div('m-tr', h('i', { class: 'm-avatar sm' }), t(x, 'm-xs'), t(i === 2 ? '+₱18,000' : `−₱${Math.round(100 + r() * 900)}`, `m-xs ${i === 2 ? 'm-up' : ''}`))),
    div('m-tabbar', [0, 1, 2, 3].map((i) => dot(i === 0 ? 'on' : '')))),

  'phone-shop': (p, r) => div('m-app',
    div('m-row m-between', t(p.brand, 'm-brand'), dot('on')),
    div('m-input', t('Search products', 'm-xs m-muted')),
    div('m-chips', ['All', 'Tops', 'Shoes', 'Bags'].map((c, i) => t(c, `m-chip ${i === 0 ? 'on' : ''}`))),
    t(p.headline, 'm-h'),
    div('m-tiles two', [0, 1, 2, 3].map((i) => div('m-prod', img(p.hue, 'm-thumb sq', i * 35), t(['Linen shirt', 'Canvas tote', 'Runner', 'Cap'][i], 'm-xs'), t(`₱${Math.round(390 + r() * 1500)}`, 'm-xs m-muted')))),
    div('m-tabbar', [0, 1, 2, 3].map((i) => dot(i === 0 ? 'on' : '')))),

  'phone-food': (p, r) => div('m-app',
    t(p.headline, 'm-h'),
    div('m-input', t('Search sisig, milk tea…', 'm-xs m-muted')),
    div('m-chips', ['Filipino', 'Fries', 'Drinks'].map((c, i) => t(c, `m-chip ${i === 0 ? 'on' : ''}`))),
    [0, 1].map((i) => div('m-card m-rest', img(p.hue, 'm-thumb wide', i * 25), div('m-row m-between', t(['Lola’s Kusina', 'Friesta'][i], 'm-s'), t(`${15 + Math.round(r() * 20)} min`, 'm-pill')))),
    div('m-reorder', t('Reorder: Cheese Blast ×2', 'm-xs'), btn('Go')),
    div('m-tabbar', [0, 1, 2, 3].map((i) => dot(i === 0 ? 'on' : '')))),

  'phone-fitness': (p, r) => div('m-app',
    div('m-row m-between', t(p.headline, 'm-h'), t('🔥 6', 'm-pill')),
    div('m-rings', ring(78, 'a'), ring(55, 'b'), ring(90, 'c')),
    div('m-kpis two', [['Steps', '8,240'], ['Sleep', '7h 10m']].map(([a, b]) => div('m-kpi', t(a, 'm-xs m-muted'), t(b, 'm-kv')))),
    div('m-card', t('This week', 'm-xs m-muted'), bars(r, 7)),
    div('m-card m-row', h('i', { class: 'm-play' }), t('Morning mobility · 12 min', 'm-xs')),
    div('m-tabbar', [0, 1, 2, 3].map((i) => dot(i === 0 ? 'on' : '')))),

  'phone-feed': (p, r) => div('m-app',
    div('m-row m-between', t(p.brand, 'm-brand'), dot('on')),
    div('m-stories', [0, 1, 2, 3, 4].map((i) => h('i', { class: 'm-story', style: { '--h': (p.hue + i * 40) % 360 } }))),
    [0, 1].map((i) => div('m-post', div('m-row', h('i', { class: 'm-avatar sm' }), t(['Bea', 'Paolo'][i], 'm-xs')), img(p.hue, 'm-thumb wide', i * 50), div('m-row', t('♡', 'm-s'), t('💬', 'm-xs'), t('Plans: Sat 7PM', 'm-xs m-muted')))),
    div('m-tabbar', [0, 1, 2, 3].map((i) => dot(i === 0 ? 'on' : '')))),

  // ----------------------------------------------------------------- lab tools
  'tool-calc': (p) => div('m-tool',
    div('m-calc-display', t(p.headline, 'm-xs m-muted'), t('= 14', 'm-kv')),
    div('m-keys', ['7', '8', '9', '÷', '4', '5', '6', '×', '1', '2', '3', '−', '0', '.', '(', '='].map((k) => t(k, `m-key ${'÷×−='.includes(k) ? 'op' : ''}`)))),
  'tool-quiz': (p) => div('m-tool',
    t('JAVASCRIPT · 4 / 10', 'm-xs m-accent'), div('m-progress', h('i', { style: { width: '62%' } })), t(p.headline, 'm-h'),
    ['The data directly', 'A Promise', 'A callback'].map((a, i) => div(`m-answer ${i === 1 ? 'right' : ''}`, t(a, 'm-xs')))),
  'tool-palette': (p) => div('m-tool m-pal', [0, 1, 2, 3, 4].map((i) => h('i', { style: { '--h': (p.hue + i * 26) % 360, '--l': `${30 + i * 11}%` } }))),
  'tool-reaction': (p) => div('m-tool m-react', t(p.headline, 'm-display center'), t('Round 3 of 5', 'm-xs')),
};

const PHONE = (kind) => kind.startsWith('phone-');

/**
 * @param {object} preview  project.preview
 * @param {string} seed     usually the project id (keeps the "random" parts stable)
 * @param {{label?: string}} [opts]
 */
export function mockup(preview, seed, opts = {}) {
  const r = rng(seed);
  const build = KINDS[preview.kind] ?? KINDS.dashboard;
  const { bg, fg, accent, surface } = preview.theme;
  const style = { '--m-bg': bg, '--m-fg': fg, '--m-accent': accent, '--m-surface': surface, '--h': preview.hue };
  const content = build(preview, r);

  if (PHONE(preview.kind)) {
    return h('div', { class: 'mock mock-phone-wrap', role: 'img', 'aria-label': opts.label ?? `${preview.brand} mobile app preview` },
      h('div', { class: 'mock-phone', style }, h('i', { class: 'mock-notch' }), h('div', { class: 'mock-screen' }, content)));
  }
  return h('div', { class: 'mock mock-browser-wrap', role: 'img', 'aria-label': opts.label ?? `${preview.brand} interface preview` },
    h('div', { class: 'mock-browser', style },
      h('div', { class: 'mock-bar' }, h('i'), h('i'), h('i'), h('span', { class: 'mock-url' }, `${preview.brand.toLowerCase().replace(/[^a-z0-9]+/g, '')}.app`)),
      h('div', { class: 'mock-screen' }, content)));
}

export const isPhoneKind = PHONE;
