/**
 * validators.js — input validation shared by the browser AND the server.
 *
 * LESSON: validate in the browser for fast, friendly feedback; validate AGAIN on
 * the server because anyone can bypass your front end (curl, DevTools, scripts).
 * Each validator returns { ok, errors, value } and never throws.
 */

const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

/** Trim + strip control characters. (Output escaping is done where text is rendered.) */
export function clean(text, max = 500) {
  return String(text ?? '').replace(CONTROL_CHARS, '').trim().slice(0, max);
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = /^[+()\d\s-]{7,20}$/;

export function isEmail(v) { return EMAIL.test(v); }
export function isPhone(v) { return PHONE.test(v) && v.replace(/\D/g, '').length >= 7; }

/** Contact form: { name, email, message } */
export function validateContact(body = {}) {
  const errors = {};
  const value = {
    name: clean(body.name, 80),
    email: clean(body.email, 120),
    message: clean(body.message, 2000),
  };
  if (value.name.length < 2) errors.name = 'Please enter your name (at least 2 characters).';
  if (!isEmail(value.email)) errors.email = 'Please enter a valid email address.';
  if (value.message.length < 10) errors.message = 'Message should be at least 10 characters.';
  return { ok: Object.keys(errors).length === 0, errors, value };
}

/** Leaderboard submission: { name, score } — rules differ per game. */
export const GAME_RULES = {
  // lower is better (milliseconds)
  reaction: { order: 'asc', min: 80, max: 5000 },
  // higher is better (points)
  quiz: { order: 'desc', min: 0, max: 1000 } // 10 questions x max 100 points,
};

export function validateScore(game, body = {}) {
  const errors = {};
  const rule = GAME_RULES[game];
  if (!rule) return { ok: false, errors: { game: 'Unknown game.' }, value: null };
  const value = { name: clean(body.name, 20) || 'Anonymous', score: Math.round(Number(body.score)) };
  if (!Number.isFinite(value.score) || value.score < rule.min || value.score > rule.max) {
    errors.score = `Score must be between ${rule.min} and ${rule.max}.`;
  }
  return { ok: Object.keys(errors).length === 0, errors, value };
}

/**
 * Order checkout. `lookup(shop, id)` returns the catalog item or undefined, so this
 * function stays independent of where the catalog lives (server db vs browser data).
 */
export function validateOrder(body = {}, lookup, { partial = false } = {}) {
  const errors = {};
  const shop = body.shop;
  if (shop !== 'storefront' && shop !== 'friesta') errors.shop = 'Unknown shop.';

  const customer = {
    name: clean(body.customer?.name, 60),
    contact: clean(body.customer?.contact, 80),
    address: clean(body.customer?.address, 200),
  };
  // `partial` is used for price quotes, where we don't know the customer yet.
  if (!partial && customer.name.length < 2) errors['customer.name'] = 'Name is required.';
  if (!partial && !isEmail(customer.contact) && !isPhone(customer.contact)) {
    errors['customer.contact'] = 'Enter a valid phone number or email.';
  }

  // Storefront always ships; Friesta can be pickup or delivery.
  const fulfillment = shop === 'storefront' ? 'delivery' : body.fulfillment === 'delivery' ? 'delivery' : 'pickup';
  if (!partial && fulfillment === 'delivery' && customer.address.length < 5) {
    errors['customer.address'] = 'A delivery address is required.';
  }

  const rawItems = Array.isArray(body.items) ? body.items : [];
  if (rawItems.length === 0 || rawItems.length > 30) errors.items = 'Your cart must contain 1–30 different items.';

  const items = [];
  for (const raw of rawItems.slice(0, 30)) {
    const qty = Number(raw?.qty);
    const product = typeof raw?.id === 'string' ? lookup(shop, raw.id) : undefined;
    if (!product) { errors.items = `Unknown item: ${clean(raw?.id, 30)}`; break; }
    if (!Number.isInteger(qty) || qty < 1 || qty > 20) { errors.items = `Invalid quantity for ${product.name}.`; break; }
    items.push({ id: product.id, name: product.name, price: product.price, qty });
  }

  return {
    ok: Object.keys(errors).length === 0,
    errors,
    value: { shop, customer, fulfillment, items, promo: clean(body.promo, 20), note: clean(body.note, 200) },
  };
}
