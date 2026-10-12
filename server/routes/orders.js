/**
 * orders.js
 *
 *   POST  /api/orders/quote   price a cart (no data saved)
 *   POST  /api/orders         place an order
 *   PATCH /api/orders/:id     change status (needs the X-Admin-Key header)
 *
 * LESSON: look at how thin these handlers are. All the rules live in
 * public/js/shared/order-service.js. The route's only job is HTTP: read the
 * request, call the service, translate the result into a status code.
 */
import { timingSafeEqual } from 'node:crypto';
import { HttpError } from '../http-utils.js';
import { quoteOrder, placeOrder, setOrderStatus } from '../../public/js/shared/order-service.js';

/** Compare secrets in constant time so response timing can't leak the key. */
function keysMatch(given = '', expected = '') {
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function registerOrders(router, { store, adminKey }) {
  router.post('/api/orders/quote', async ({ body }) => {
    const result = quoteOrder(store.data, await body());
    if (!result.ok) throw new HttpError(422, 'Invalid cart.', result.errors);
    return { body: { items: result.items, totals: result.totals } };
  });

  router.post('/api/orders', async ({ body }) => {
    const payload = await body();
    // store.update() guarantees no other write happens while we check stock + save.
    const result = await store.update((data) => placeOrder(data, payload));
    if (!result.ok) throw new HttpError(result.status, 'Order could not be placed.', result.errors);
    const { id, status, totals, createdAt, items } = result.order;
    // Return only what the customer needs (never echo internal data back).
    return { status: 201, body: { id, status, totals, createdAt, items } };
  });

  router.patch('/api/orders/:id', async ({ params, body, req }) => {
    if (!keysMatch(req.headers['x-admin-key'], adminKey)) throw new HttpError(401, 'Admin key required.');
    const { status } = await body();
    const result = await store.update((data) => setOrderStatus(data, params.id, status));
    if (!result.ok) throw new HttpError(result.status, 'Could not update order.', result.errors);
    return { body: { id: result.order.id, status: result.order.status } };
  });
}
