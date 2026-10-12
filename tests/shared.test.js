/** Unit tests for the pure, shared logic (no server needed). */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calcTotals, findPromo } from '../public/js/shared/pricing.js';
import { validateContact, validateScore, isPhone } from '../public/js/shared/validators.js';
import { summarize, dateKey, redactName } from '../public/js/shared/analytics.js';
import { insertScore, topScores, rankOf } from '../public/js/shared/leaderboard.js';
import { rebaseOrders } from '../public/js/shared/seed-utils.js';

const fees = { delivery: 99, freeOver: 2000 };

test('calcTotals: free shipping kicks in at the threshold', () => {
  assert.equal(calcTotals([{ price: 1999, qty: 1 }], { fees, fulfillment: 'delivery' }).shipping, 99);
  assert.equal(calcTotals([{ price: 2000, qty: 1 }], { fees, fulfillment: 'delivery' }).shipping, 0);
  assert.equal(calcTotals([{ price: 100, qty: 1 }], { fees, fulfillment: 'pickup' }).shipping, 0);
});

test('calcTotals: promos respect minimum spend and never exceed the subtotal', () => {
  const flat = { type: 'flat', value: 500, minSubtotal: 100, shops: ['x'], label: 'x' };
  assert.equal(calcTotals([{ price: 50, qty: 1 }], { fees, fulfillment: 'pickup', promo: flat }).discount, 0);
  assert.equal(calcTotals([{ price: 120, qty: 1 }], { fees, fulfillment: 'pickup', promo: flat }).discount, 120);
});

test('findPromo is case-insensitive and shop-scoped', () => {
  const promos = { SAVE: { shops: ['friesta'] } };
  assert.ok(findPromo(promos, ' save ', 'friesta'));
  assert.equal(findPromo(promos, 'save', 'storefront'), null);
});

test('validators', () => {
  assert.equal(validateContact({ name: 'A', email: 'bad', message: 'x' }).ok, false);
  assert.equal(validateContact({ name: 'Ann', email: 'a@b.co', message: 'long enough message' }).ok, true);
  assert.equal(isPhone('+63 917 123 4567'), true);
  assert.equal(isPhone('abc'), false);
  assert.equal(validateScore('reaction', { score: 10 }).ok, false); // humanly impossible
  assert.equal(validateScore('nope', { score: 10 }).ok, false);
});

test('analytics: zero-sale days still appear, cancelled orders are excluded', () => {
  const now = Date.parse('2026-10-12T04:00:00Z');
  const mk = (iso, total, status = 'completed') => ({
    id: iso, shop: 'friesta', status, createdAt: iso, customer: { name: 'Mark Santos' },
    items: [{ name: 'Fries', qty: 1, price: total }], totals: { total },
  });
  const out = summarize([mk('2026-10-12T01:00:00Z', 100), mk('2026-10-10T01:00:00Z', 50), mk('2026-10-11T01:00:00Z', 999, 'cancelled')], { days: 3, now });
  assert.equal(out.series.length, 3);
  assert.equal(out.kpis.revenue.value, 150);
  assert.equal(out.kpis.orders.value, 2);
  assert.equal(out.series.find((d) => d.date === '2026-10-11').revenue, 0);
  assert.equal(redactName('Mark Santos'), 'Mark S.');
  assert.equal(dateKey(Date.parse('2026-10-11T17:00:00Z')), '2026-10-12'); // 1am Manila is already "tomorrow"
});

test('leaderboard ranks lower-is-better and higher-is-better games', () => {
  const scores = {};
  insertScore(scores, 'reaction', { name: 'a', score: 300 });
  const rank = insertScore(scores, 'reaction', { name: 'b', score: 200 });
  assert.equal(rank, 1);
  assert.equal(topScores(scores, 'reaction')[0].name, 'b');
  insertScore(scores, 'quiz', { name: 'a', score: 50 });
  assert.equal(rankOf(scores, 'quiz', 80), 1);
});

test('rebaseOrders shifts by whole days only', () => {
  const orders = [{ createdAt: '2026-10-01T10:15:00.000Z' }];
  const [o] = rebaseOrders(orders, '2026-10-01T12:00:00.000Z', Date.parse('2026-10-11T13:00:00.000Z'));
  assert.equal(o.createdAt, '2026-10-11T10:15:00.000Z');
});

// ---------------------------------------------------------------- calculator + colour
import { evaluate } from '../public/js/shared/calc-parser.js';
import { contrast, wcagLevel, hslToHex, hexToHsl, generatePalette } from '../public/js/lib/color.js';

test('calculator: precedence, associativity, unary minus', () => {
  const v = (s, ctx) => evaluate(s, ctx).value;
  assert.equal(v('2 + 3 * 4'), 14);
  assert.equal(v('(2 + 3) * 4'), 20);
  assert.equal(v('2 ^ 3 ^ 2'), 512);       // right-associative
  assert.equal(v('-2 ^ 2'), -4);           // unary minus binds looser than ^
  assert.equal(v('2 ^ -1'), 0.5);
  assert.equal(v('10 - 4 - 3'), 3);        // left-associative
  assert.equal(v('50%'), 0.5);
  assert.equal(v('7 mod 4'), 3);
  assert.equal(v('0.1 + 0.2'), 0.3);       // float noise is hidden
  assert.equal(v('2(3 + 4)'), 14);         // implicit multiplication
  assert.equal(v('sqrt(16) + ans', { ans: 6 }), 10);
  assert.equal(v('12 × 3 ÷ 4'), 9);
});

test('calculator: errors are reported, never thrown, and code cannot be injected', () => {
  for (const bad of ['', '1 / 0', '2 +', '(1 + 2', 'sqrt(-1)', 'foo(1)', '1 + * 2', 'alert(1)', 'process.exit()', '2 $ 3']) {
    const r = evaluate(bad);
    assert.equal(r.ok, false, `"${bad}" should fail`);
    assert.ok(r.error.length > 0);
  }
});

test('colour maths: contrast and conversions', () => {
  assert.equal(Math.round(contrast('#000000', '#FFFFFF')), 21);
  assert.equal(contrast('#777777', '#777777'), 1);
  assert.equal(wcagLevel(4.5), 'AA');
  assert.equal(wcagLevel(2.9), 'Fail');
  assert.equal(hslToHex(0, 100, 50), '#FF0000');
  assert.deepEqual(hexToHsl('#00FF00'), { h: 120, s: 100, l: 50 });
  const palette = generatePalette('triad', 5);
  assert.equal(palette.length, 5);
  assert.ok(palette.every((c) => /^#[0-9A-F]{6}$/.test(c)));
});
