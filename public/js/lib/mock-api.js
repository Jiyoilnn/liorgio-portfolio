/**
 * mock-api.js — a pretend back end that lives inside the browser.
 *
 * It exposes the same endpoints as the Node server and re-uses the SAME business code
 * (public/js/shared/*). The only differences: data comes from data/seed.json and every
 * change is saved to localStorage instead of a database file.
 *
 * This is what makes the project work on GitHub Pages, where no server can run.
 */
import { storage } from './dom.js';
import { rebaseOrders } from '../shared/seed-utils.js';
import { quoteOrder, placeOrder, setOrderStatus } from '../shared/order-service.js';
import { summarize } from '../shared/analytics.js';
import { validateContact, validateScore, GAME_RULES } from '../shared/validators.js';
import { insertScore, topScores } from '../shared/leaderboard.js';
import { filterProducts, promoHints, uniqueCategories } from '../shared/catalog-service.js';

const KEY = 'portfolio-demo-overlay-v1';
const ADMIN_KEY = 'demo-admin'; // same default as the real server
let state; // { data, seedOrderStatus, seedStock, ... }

async function load() {
  if (state) return state;
  const seed = await (await fetch('data/seed.json')).json();
  const data = { ...seed, orders: rebaseOrders(seed.orders, seed.generatedAt), messages: [], scores: {} };
  delete data.generatedAt;

  // Re-apply what the visitor changed in previous visits ("overlay").
  const overlay = storage.get(KEY, {});
  const seedIds = new Set(data.orders.map((o) => o.id));
  for (const o of data.orders) if (overlay.status?.[o.id]) o.status = overlay.status[o.id];
  for (const p of data.products) if (overlay.stock?.[p.id] != null) p.stock = overlay.stock[p.id];
  data.orders.push(...(overlay.orders ?? []));
  data.messages = overlay.messages ?? [];
  data.scores = overlay.scores ?? {};
  state = { data, seedIds, seedStatus: new Map(seed.orders.map((o) => [o.id, o.status])), seedStock: new Map(seed.products.map((p) => [p.id, p.stock])) };
  return state;
}

/** Save only the DIFFERENCES from the seed, so localStorage stays small. */
function save({ data, seedIds, seedStatus, seedStock }) {
  storage.set(KEY, {
    orders: data.orders.filter((o) => !seedIds.has(o.id)),
    status: Object.fromEntries(data.orders.filter((o) => seedIds.has(o.id) && o.status !== seedStatus.get(o.id)).map((o) => [o.id, o.status])),
    stock: Object.fromEntries(data.products.filter((p) => p.stock !== seedStock.get(p.id)).map((p) => [p.id, p.stock])),
    messages: data.messages.slice(-50),
    scores: data.scores,
  });
}

const ok = (body, status = 200) => ({ status, body });
const fail = (status, error, details) => ({ status, body: { error, details } });

/** @returns {Promise<{status:number, body:any}>} */
export async function handle(method, path, body = {}, headers = {}) {
  const s = await load();
  const { data } = s;
  const url = new URL(path, 'http://demo.local/');
  const q = url.searchParams;
  const route = url.pathname.replace(/^\//, '');
  let m;

  if (method === 'GET' && route === 'health') return ok({ ok: true, mode: 'demo' });

  if (method === 'GET' && route === 'menu') {
    return ok({ shop: data.shops.friesta, categories: uniqueCategories(data.menu), items: data.menu, promoHints: promoHints(data.promos, 'friesta') });
  }
  if (method === 'GET' && route === 'products') {
    const items = filterProducts(data.products, { category: q.get('category'), q: q.get('q'), sort: q.get('sort') });
    return ok({ shop: data.shops.storefront, categories: uniqueCategories(data.products), items, promoHints: promoHints(data.promos, 'storefront') });
  }
  if (method === 'GET' && (m = route.match(/^products\/([^/]+)$/))) {
    const p = data.products.find((x) => x.id === m[1]);
    return p ? ok(p) : fail(404, 'Product not found.');
  }

  if (method === 'POST' && route === 'orders/quote') {
    const r = quoteOrder(data, body);
    return r.ok ? ok({ items: r.items, totals: r.totals }) : fail(422, 'Invalid cart.', r.errors);
  }
  if (method === 'POST' && route === 'orders') {
    const r = placeOrder(data, body);
    if (!r.ok) return fail(r.status, 'Order could not be placed.', r.errors);
    save(s);
    const { id, status, totals, createdAt, items } = r.order;
    return ok({ id, status, totals, createdAt, items }, 201);
  }
  if (method === 'PATCH' && (m = route.match(/^orders\/([^/]+)$/))) {
    if (headers['X-Admin-Key'] !== ADMIN_KEY) return fail(401, 'Admin key required.');
    const r = setOrderStatus(data, m[1], body.status);
    if (!r.ok) return fail(r.status, 'Could not update order.', r.errors);
    save(s);
    return ok({ id: r.order.id, status: r.order.status });
  }

  if (method === 'GET' && route === 'analytics') {
    const days = Math.min(90, Math.max(1, parseInt(q.get('days') ?? '30', 10) || 30));
    const shop = ['friesta', 'storefront'].includes(q.get('shop')) ? q.get('shop') : 'all';
    return ok(summarize(data.orders, { days, shop }));
  }

  if (method === 'POST' && route === 'contact') {
    const v = validateContact(body);
    if (!v.ok) return fail(422, 'Please fix the highlighted fields.', v.errors);
    if (!body.website) { data.messages.push({ ...v.value, createdAt: new Date().toISOString() }); save(s); }
    return ok({ ok: true }, 201);
  }

  if ((m = route.match(/^scores\/([^/]+)$/))) {
    const game = m[1];
    if (!GAME_RULES[game]) return fail(404, 'Unknown game.');
    if (method === 'GET') return ok({ game, order: GAME_RULES[game].order, scores: topScores(data.scores, game) });
    if (method === 'POST') {
      const v = validateScore(game, body);
      if (!v.ok) return fail(422, 'Invalid score.', v.errors);
      const rank = insertScore(data.scores, game, v.value);
      save(s);
      return ok({ rank }, 201);
    }
  }

  return fail(404, 'Route not found.');
}
