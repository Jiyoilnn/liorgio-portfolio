/**
 * analytics.js — turns a list of orders into dashboard numbers.
 *
 * It is a PURE function (same input -> same output, no side effects), which makes it
 * trivial to test and lets us run it on the server AND in the browser's demo mode.
 */

const DAY = 86_400_000;
const MANILA_OFFSET_MIN = 8 * 60; // Philippines is UTC+8, no daylight saving

/** "2026-10-12" for a timestamp, in Manila time. */
export function dateKey(ts, offsetMin = MANILA_OFFSET_MIN) {
  return new Date(ts + offsetMin * 60_000).toISOString().slice(0, 10);
}

/** First name + last initial, so the public dashboard never leaks full customer names. */
export function redactName(name) {
  const [first = 'Guest', last = ''] = String(name).split(/\s+/);
  return last ? `${first} ${last[0]}.` : first;
}

const sum = (arr, fn) => arr.reduce((s, x) => s + fn(x), 0);
const pct = (now, before) => (before === 0 ? (now > 0 ? 100 : 0) : Math.round(((now - before) / before) * 1000) / 10);

/**
 * @param {Array} orders every order we know about
 * @param {{ days?: number, now?: number, shop?: string }} opts
 */
export function summarize(orders, { days = 30, now = Date.now(), shop = 'all' } = {}) {
  const scoped = shop === 'all' ? orders : orders.filter((o) => o.shop === shop);
  const t = (o) => Date.parse(o.createdAt);

  const current = scoped.filter((o) => t(o) > now - days * DAY && t(o) <= now);
  const previous = scoped.filter((o) => t(o) > now - 2 * days * DAY && t(o) <= now - days * DAY);
  const paid = (list) => list.filter((o) => o.status !== 'cancelled');

  const revenue = sum(paid(current), (o) => o.totals.total);
  const prevRevenue = sum(paid(previous), (o) => o.totals.total);
  const orderCount = paid(current).length;
  const prevOrderCount = paid(previous).length;
  const avg = orderCount ? Math.round(revenue / orderCount) : 0;
  const prevAvg = prevOrderCount ? Math.round(prevRevenue / prevOrderCount) : 0;

  // Daily series — make sure days with zero sales still appear (otherwise the chart lies).
  const series = [];
  const buckets = new Map();
  for (let i = days - 1; i >= 0; i--) {
    const key = dateKey(now - i * DAY);
    const bucket = { date: key, revenue: 0, orders: 0 };
    buckets.set(key, bucket);
    series.push(bucket);
  }
  for (const o of paid(current)) {
    const b = buckets.get(dateKey(t(o)));
    if (b) { b.revenue += o.totals.total; b.orders += 1; }
  }

  // Best sellers
  const items = new Map();
  for (const o of paid(current)) {
    for (const line of o.items) {
      const row = items.get(line.name) ?? { name: line.name, qty: 0, revenue: 0 };
      row.qty += line.qty;
      row.revenue += line.qty * line.price;
      items.set(line.name, row);
    }
  }

  const byShop = {};
  for (const o of paid(current)) byShop[o.shop] = (byShop[o.shop] ?? 0) + o.totals.total;

  const status = { pending: 0, processing: 0, completed: 0, cancelled: 0 };
  for (const o of current) status[o.status] = (status[o.status] ?? 0) + 1;

  // Orders by hour of day (Manila time) -> "when are we busiest?"
  const hours = Array.from({ length: 24 }, () => 0);
  for (const o of paid(current)) hours[new Date(t(o) + MANILA_OFFSET_MIN * 60_000).getUTCHours()] += 1;

  const recent = [...scoped]
    .sort((a, b) => t(b) - t(a))
    .slice(0, 8)
    .map((o) => ({
      id: o.id, shop: o.shop, status: o.status, total: o.totals.total,
      createdAt: o.createdAt, customer: redactName(o.customer.name), itemCount: sum(o.items, (i) => i.qty),
    }));

  return {
    days, shop,
    kpis: {
      revenue: { value: revenue, change: pct(revenue, prevRevenue) },
      orders: { value: orderCount, change: pct(orderCount, prevOrderCount) },
      avgOrder: { value: avg, change: pct(avg, prevAvg) },
    },
    series,
    topItems: [...items.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 5),
    byShop, status, hours, recent,
  };
}
