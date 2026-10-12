/**
 * cart.js — cart state (WHAT is in the cart). Rendering lives in cart-ui.js.
 *
 * LESSON (state vs. view): keeping data in one small store and letting the UI
 * "subscribe" to it means the header badge, the drawer and the product buttons all
 * stay in sync automatically — nobody has to remember to update three places.
 */
import { createEmitter, storage } from './dom.js';

const MAX_QTY = 20;

export function createCart(shop) {
  const key = `cart-${shop}-v1`;
  let lines = storage.get(key, []).filter((l) => l && typeof l.id === 'string' && l.qty > 0); // [{ id, qty }]
  const changes = createEmitter();

  const commit = () => { storage.set(key, lines); changes.emit(lines); };

  return {
    onChange: changes.on,
    get lines() { return lines; },
    get count() { return lines.reduce((n, l) => n + l.qty, 0); },
    qty: (id) => lines.find((l) => l.id === id)?.qty ?? 0,
    add(id, qty = 1) {
      const line = lines.find((l) => l.id === id);
      if (line) line.qty = Math.min(MAX_QTY, line.qty + qty);
      else lines = [...lines, { id, qty: Math.min(MAX_QTY, qty) }];
      commit();
    },
    setQty(id, qty) {
      lines = qty <= 0 ? lines.filter((l) => l.id !== id) : lines.map((l) => (l.id === id ? { ...l, qty: Math.min(MAX_QTY, qty) } : l));
      commit();
    },
    clear() { lines = []; commit(); },
  };
}
