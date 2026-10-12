/**
 * pricing.js — the ONE place where order totals are calculated.
 *
 * LESSON (isomorphic code): this file is imported by BOTH the browser
 * (to show a live cart total) and the Node server (to compute the real total
 * when an order is placed). Because it is the same code, the two can never
 * disagree. The server still recalculates everything itself — a client can
 * lie about prices, so the server NEVER trusts totals sent from the browser.
 */

/**
 * @typedef {{ price: number, qty: number }} Line
 * @typedef {{ delivery: number, freeOver: number }} FeeRule
 * @typedef {{ type: 'percent'|'flat', value: number, minSubtotal?: number, shops: string[], label: string }} Promo
 */

/**
 * Work out the totals for a cart.
 * @param {Line[]} lines
 * @param {{ fees: FeeRule, fulfillment: 'pickup'|'delivery', promo?: Promo|null }} rules
 */
export function calcTotals(lines, { fees, fulfillment, promo = null }) {
  const subtotal = lines.reduce((sum, l) => sum + l.price * l.qty, 0);

  // 1) promo discount ------------------------------------------------------
  let discount = 0;
  let promoMessage = '';
  if (promo) {
    if (promo.minSubtotal && subtotal < promo.minSubtotal) {
      promoMessage = `Spend at least ₱${promo.minSubtotal} to use this code.`;
    } else {
      discount = promo.type === 'percent' ? Math.round((subtotal * promo.value) / 100) : promo.value;
      discount = Math.min(discount, subtotal); // a discount can never exceed the subtotal
      promoMessage = promo.label;
    }
  }

  // 2) shipping / delivery fee --------------------------------------------
  const afterDiscount = subtotal - discount;
  const needsFee = fulfillment === 'delivery' && subtotal > 0;
  const shipping = needsFee && afterDiscount < fees.freeOver ? fees.delivery : 0;

  return {
    subtotal,
    discount,
    shipping,
    total: afterDiscount + shipping,
    promoApplied: discount > 0,
    promoMessage,
    freeShippingGap: needsFee && shipping > 0 ? fees.freeOver - afterDiscount : 0,
  };
}

/** Look up a promo code (case-insensitive) that is valid for a given shop. */
export function findPromo(promos, code, shop) {
  if (!code) return null;
  const promo = promos[String(code).trim().toUpperCase()];
  return promo && promo.shops.includes(shop) ? promo : null;
}
