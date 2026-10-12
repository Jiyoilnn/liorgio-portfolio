/**
 * order-service.js — business rules for quoting and placing orders.
 *
 * LESSON (separation of concerns): these functions know NOTHING about HTTP, files or
 * the DOM. They take plain data in and return plain data out. The Node server calls
 * them from its routes, and the browser's offline "demo mode" calls the very same code.
 * That is why this project can run on GitHub Pages without a server.
 *
 * `data` is the shape stored in the database:
 *   { shops, promos, products, menu, orders }
 */
import { validateOrder } from './validators.js';
import { calcTotals, findPromo } from './pricing.js';

/** Returns lookup(shop, id) bound to a data set. */
export function makeLookup(data) {
  return (shop, id) => (shop === 'friesta' ? data.menu : data.products).find((x) => x.id === id);
}

/** Price a cart without saving anything. Used for the live total in the cart drawer. */
export function quoteOrder(data, body) {
  const v = validateOrder(body, makeLookup(data), { partial: true });
  // For a quote we only care about problems with shop/items, not customer details.
  const blocking = Object.keys(v.errors).filter((k) => k === 'shop' || k === 'items');
  if (blocking.length) return { ok: false, errors: v.errors };
  const { shop, items, fulfillment, promo } = v.value;
  const totals = calcTotals(items, {
    fees: data.shops[shop].fees,
    fulfillment,
    promo: findPromo(data.promos, promo, shop),
  });
  return { ok: true, items, totals, fulfillment };
}

/** Next human-friendly order number, e.g. "FR-1410". */
function nextId(data, shop) {
  const max = data.orders.reduce((m, o) => Math.max(m, Number(o.id.split('-')[1]) || 0), 1000);
  return `${shop === 'friesta' ? 'FR' : 'SF'}-${max + 1}`;
}

/**
 * Validate + create an order. MUTATES `data` (adds the order, reduces stock).
 * Returns { ok:true, order } or { ok:false, status, errors }.
 */
export function placeOrder(data, body, now = Date.now()) {
  const v = validateOrder(body, makeLookup(data));
  if (!v.ok) return { ok: false, status: 422, errors: v.errors };
  const { shop, customer, fulfillment, items, promo, note } = v.value;

  // Stock check (storefront only). Sum quantities per product first: the same item can
  // appear on several lines, and checking each line alone would let the total slip past the stock.
  if (shop === 'storefront') {
    const wanted = new Map();
    for (const line of items) wanted.set(line.id, (wanted.get(line.id) ?? 0) + line.qty);
    for (const [id, qty] of wanted) {
      const product = data.products.find((p) => p.id === id);
      if (product.stock < qty) {
        return { ok: false, status: 409, errors: { items: `Only ${product.stock} left of ${product.name}.` } };
      }
    }
  }

  const promoRule = findPromo(data.promos, promo, shop);
  const totals = calcTotals(items, { fees: data.shops[shop].fees, fulfillment, promo: promoRule });
  const order = {
    id: nextId(data, shop),
    shop,
    status: 'pending',
    createdAt: new Date(now).toISOString(),
    fulfillment,
    customer,
    items,
    promo: totals.promoApplied ? promo.toUpperCase() : '',
    totals,
    note,
  };

  if (shop === 'storefront') {
    for (const line of items) data.products.find((p) => p.id === line.id).stock -= line.qty;
  }
  data.orders.push(order);
  return { ok: true, order };
}

export const ORDER_STATUSES = ['pending', 'processing', 'completed', 'cancelled'];

/** Change an order's status. Returns the order or null. */
export function setOrderStatus(data, id, status) {
  if (!ORDER_STATUSES.includes(status)) return { ok: false, status: 422, errors: { status: 'Invalid status.' } };
  const order = data.orders.find((o) => o.id === id);
  if (!order) return { ok: false, status: 404, errors: { id: 'Order not found.' } };
  order.status = status;
  return { ok: true, order };
}
