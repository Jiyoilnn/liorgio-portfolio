/**
 * API integration tests — they start the REAL server on a random port (with an
 * in-memory database) and talk to it over HTTP, exactly like the browser does.
 *
 * Run:  npm test
 */
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../server/app.js';

let server, base, store;

before(async () => {
  ({ server, store } = await createApp({ dbFile: null, quiet: true, adminKey: 'secret', rateLimit: { windowMs: 60_000, max: 1000 } }));
  await new Promise((r) => server.listen(0, r));
  base = `http://127.0.0.1:${server.address().port}`;
});
after(() => new Promise((r) => server.close(r)));

const api = (path, opts = {}) =>
  fetch(base + path, { ...opts, headers: { 'content-type': 'application/json', ...(opts.headers ?? {}) }, body: opts.body && JSON.stringify(opts.body) });

const goodOrder = (over = {}) => ({
  shop: 'storefront',
  items: [{ id: 'tee-heavy', qty: 2 }],
  customer: { name: 'Juan Dela Cruz', contact: 'juan@example.com', address: '123 Sample St, Caloocan' },
  ...over,
});

test('health check', async () => {
  const res = await api('/api/health');
  assert.equal(res.status, 200);
  assert.equal((await res.json()).ok, true);
});

test('products can be filtered and sorted', async () => {
  const res = await api('/api/products?category=Accessories&sort=price-desc');
  const { items } = await res.json();
  assert.ok(items.length > 0);
  assert.ok(items.every((p) => p.category === 'Accessories'));
  assert.deepEqual(items.map((p) => p.price), items.map((p) => p.price).sort((a, b) => b - a));
});

test('unknown routes return JSON 404 and wrong methods 405', async () => {
  assert.equal((await api('/api/nope')).status, 404);
  assert.equal((await api('/api/products', { method: 'POST', body: {} })).status, 405);
});

test('quote ignores client prices and applies promo + shipping rules', async () => {
  const res = await api('/api/orders/quote', { method: 'POST', body: goodOrder({ promo: 'welcome10', items: [{ id: 'tee-heavy', qty: 2, price: 1 }] }) });
  const { totals } = await res.json();
  assert.equal(totals.subtotal, 1380);        // 2 x 690, the "price: 1" the client sent is ignored
  assert.equal(totals.discount, 138);         // 10%
  assert.equal(totals.shipping, 99);          // below the free-shipping threshold
  assert.equal(totals.total, 1380 - 138 + 99);
});

test('placing an order stores it, reduces stock and increments the id', async () => {
  const before = store.data.products.find((p) => p.id === 'tee-heavy').stock;
  const res = await api('/api/orders', { method: 'POST', body: goodOrder() });
  assert.equal(res.status, 201);
  const order = await res.json();
  assert.match(order.id, /^SF-\d+$/);
  assert.equal(store.data.products.find((p) => p.id === 'tee-heavy').stock, before - 2);
  const second = await (await api('/api/orders', { method: 'POST', body: goodOrder() })).json();
  assert.equal(Number(second.id.split('-')[1]), Number(order.id.split('-')[1]) + 1);
});

test('validation errors come back as 422 with field details', async () => {
  const res = await api('/api/orders', { method: 'POST', body: goodOrder({ customer: { name: '', contact: 'nope' } }) });
  assert.equal(res.status, 422);
  const { details } = await res.json();
  assert.ok(details['customer.name'] && details['customer.contact']);
});

test('cannot order more than the stock available (409)', async () => {
  const res = await api('/api/orders', { method: 'POST', body: goodOrder({ items: [{ id: 'cap-utility', qty: 20 }, { id: 'cap-utility', qty: 20 }, { id: 'cap-utility', qty: 20 }] }) });
  assert.equal(res.status, 409);
});

test('invalid JSON and wrong content type are rejected', async () => {
  const bad = await fetch(base + '/api/orders', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{oops' });
  assert.equal(bad.status, 400);
  const wrongType = await fetch(base + '/api/contact', { method: 'POST', headers: { 'content-type': 'text/plain' }, body: 'hi' });
  assert.equal(wrongType.status, 415);
});

test('changing order status requires the admin key', async () => {
  const { id } = await (await api('/api/orders', { method: 'POST', body: goodOrder() })).json();
  assert.equal((await api(`/api/orders/${id}`, { method: 'PATCH', body: { status: 'completed' } })).status, 401);
  const ok = await api(`/api/orders/${id}`, { method: 'PATCH', body: { status: 'completed' }, headers: { 'x-admin-key': 'secret' } });
  assert.equal(ok.status, 200);
  assert.equal((await ok.json()).status, 'completed');
  const bad = await api(`/api/orders/${id}`, { method: 'PATCH', body: { status: 'banana' }, headers: { 'x-admin-key': 'secret' } });
  assert.equal(bad.status, 422);
});

test('analytics returns a full daily series and never leaks full customer names', async () => {
  const res = await api('/api/analytics?days=14&shop=friesta');
  const data = await res.json();
  assert.equal(data.series.length, 14);
  assert.ok(data.kpis.revenue.value > 0);
  assert.ok(data.recent.every((o) => !/\s\S{3,}$/.test(o.customer))); // "Mark S." not "Mark Santos"
});

test('contact form saves valid messages and silently drops honeypot spam', async () => {
  const n = store.data.messages.length;
  const ok = await api('/api/contact', { method: 'POST', body: { name: 'Ana', email: 'ana@example.com', message: 'Hello, nice portfolio!' } });
  assert.equal(ok.status, 201);
  assert.equal(store.data.messages.length, n + 1);
  const bot = await api('/api/contact', { method: 'POST', body: { name: 'Bot', email: 'bot@example.com', message: 'Buy cheap stuff now', website: 'http://spam' } });
  assert.equal(bot.status, 201);
  assert.equal(store.data.messages.length, n + 1); // not saved
  assert.equal((await api('/api/contact', { method: 'POST', body: { name: 'A', email: 'x', message: 'short' } })).status, 422);
});

test('leaderboards sort correctly per game', async () => {
  for (const score of [320, 250, 410]) await api('/api/scores/reaction', { method: 'POST', body: { name: 'R', score } });
  for (const score of [70, 90]) await api('/api/scores/quiz', { method: 'POST', body: { name: 'Q', score } });
  const reaction = (await (await api('/api/scores/reaction')).json()).scores.map((s) => s.score);
  const quiz = (await (await api('/api/scores/quiz')).json()).scores.map((s) => s.score);
  assert.deepEqual(reaction, [...reaction].sort((a, b) => a - b)); // lower is better
  assert.deepEqual(quiz, [...quiz].sort((a, b) => b - a));         // higher is better
  assert.equal((await api('/api/scores/reaction', { method: 'POST', body: { name: 'cheat', score: 3 } })).status, 422);
});

test('static files are served, and path traversal is blocked', async () => {
  assert.equal((await fetch(base + '/data/seed.json')).status, 200);
  assert.equal((await fetch(base + '/..%2fpackage.json')).status, 404);
  assert.equal((await fetch(base + '/.env')).status, 404);
  const res = await fetch(base + '/api/health');
  assert.ok(res.headers.get('content-security-policy').includes("default-src 'self'"));
});

test('rate limiter returns 429 with Retry-After', async () => {
  const { server: s2 } = await createApp({ dbFile: null, quiet: true, rateLimit: { windowMs: 60_000, max: 6 } });
  await new Promise((r) => s2.listen(0, r));
  const url = `http://127.0.0.1:${s2.address().port}/api/health`;
  let last;
  for (let i = 0; i < 8; i++) last = await fetch(url);
  assert.equal(last.status, 429);
  assert.ok(last.headers.get('retry-after'));
  await new Promise((r) => s2.close(r));
});
