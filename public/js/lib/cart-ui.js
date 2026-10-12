/**
 * cart-ui.js — a checkout drawer used by BOTH the Friesta and Streetwear projects.
 *
 * It uses the native <dialog> element: showModal() gives us a focus trap, the Escape
 * key and a backdrop for free — things that used to take 100 lines of JavaScript.
 */
import { h, clear, toast } from './dom.js';
import { api, ApiError } from './api.js';
import { formatPeso } from '../shared/money.js';

/**
 * @param {object} cfg
 * @param {'friesta'|'storefront'} cfg.shop
 * @param {ReturnType<import('./cart.js').createCart>} cfg.cart
 * @param {(id:string)=>object|undefined} cfg.getItem  look up product/menu item by id
 * @param {{code:string,label:string}[]} cfg.promoHints
 * @param {boolean} cfg.allowPickup  Friesta: pickup or delivery. Storefront: always delivery.
 * @param {string} cfg.title
 */
export function createCartDrawer({ shop, cart, getItem, promoHints = [], allowPickup, title }) {
  const state = { values: {}, fulfillment: allowPickup ? 'pickup' : 'delivery', promo: '', quote: null, busy: false, placed: null };
  let quoteToken = 0;

  const dialog = h('dialog', { class: 'drawer', 'aria-label': title });
  dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); }); // click on backdrop
  dialog.addEventListener('close', () => { state.placed = null; render(); });

  // ---- talking to the server ------------------------------------------------
  async function refreshQuote() {
    const token = ++quoteToken; // "latest request wins": ignore slow, out-of-date answers
    if (!cart.lines.length) { state.quote = null; return render(); }
    try {
      const res = await api.post('orders/quote', { shop, items: cart.lines, fulfillment: state.fulfillment, promo: state.promo });
      if (token === quoteToken) { state.quote = res.totals; render(); }
    } catch (err) {
      if (token === quoteToken) { state.quote = null; toast(err.message, 'error'); }
    }
  }

  async function checkout(form) {
    if (state.busy) return;
    const fd = new FormData(form);
    state.busy = true;
    render();
    try {
      const order = await api.post('orders', {
        shop, items: cart.lines, fulfillment: state.fulfillment, promo: state.promo,
        customer: { name: fd.get('name'), contact: fd.get('contact'), address: fd.get('address') ?? '' },
        note: fd.get('note') ?? '',
      });
      state.placed = order;
      cart.clear();
    } catch (err) {
      const first = err instanceof ApiError && err.details ? Object.values(err.details)[0] : null;
      toast(first || err.message, 'error');
      state.fieldErrors = err.details;
    } finally {
      state.busy = false;
      render();
    }
  }

  // ---- drawing --------------------------------------------------------------
  function render() {
    // Re-rendering wipes the DOM, so first remember what the customer already typed.
    const oldForm = dialog.querySelector('form');
    if (oldForm) for (const [k, v] of new FormData(oldForm)) if (k !== 'fulfillment') state.values[k] = v;
    clear(dialog);
    const close = h('button', { class: 'icon-btn', type: 'button', 'aria-label': 'Close cart', onclick: () => dialog.close() }, '✕');

    if (state.placed) {
      dialog.append(
        h('div', { class: 'drawer-head' }, h('h2', {}, 'Order placed'), close),
        h('div', { class: 'drawer-body center' },
          h('div', { class: 'success-ring', 'aria-hidden': 'true' }, '✓'),
          h('p', { class: 'eyebrow' }, 'Order number'),
          h('p', { class: 'big-id' }, state.placed.id),
          h('p', {}, `Total ${formatPeso(state.placed.totals.total)} · status: ${state.placed.status}.`),
          h('p', { class: 'muted' }, 'This is a portfolio demo — no real payment or delivery happens. Open the Analytics dashboard to watch your order appear.'),
          h('a', { class: 'button', href: 'analytics-dashboard.html' }, 'See it in the dashboard →'),
        ),
      );
      return;
    }

    const lines = cart.lines.map((l) => ({ ...l, item: getItem(l.id) })).filter((l) => l.item);
    dialog.append(h('div', { class: 'drawer-head' }, h('h2', {}, title), close));

    if (!lines.length) {
      dialog.append(h('div', { class: 'drawer-body center' }, h('p', { class: 'muted' }, 'Your cart is empty.')));
      return;
    }

    const body = h('form', { class: 'drawer-body', novalidate: true, onsubmit: (e) => { e.preventDefault(); checkout(e.currentTarget); } });

    body.append(h('ul', { class: 'cart-lines' }, lines.map(({ item, qty }) =>
      h('li', { class: 'cart-line' },
        h('div', {}, h('strong', {}, item.name), h('div', { class: 'muted small' }, formatPeso(item.price))),
        h('div', { class: 'qty' },
          h('button', { type: 'button', 'aria-label': `Remove one ${item.name}`, onclick: () => cart.setQty(item.id, qty - 1) }, '−'),
          h('output', { 'aria-live': 'polite' }, qty),
          h('button', { type: 'button', 'aria-label': `Add one ${item.name}`, onclick: () => cart.setQty(item.id, qty + 1) }, '+'),
        ),
        h('strong', {}, formatPeso(item.price * qty)),
      ))));

    if (allowPickup) {
      body.append(h('fieldset', { class: 'segmented' }, h('legend', {}, 'How do you want it?'),
        ['pickup', 'delivery'].map((v) => h('label', { class: state.fulfillment === v ? 'on' : '' },
          h('input', { type: 'radio', name: 'fulfillment', value: v, checked: state.fulfillment === v, onchange: () => { state.fulfillment = v; refreshQuote(); } }),
          v === 'pickup' ? 'Pick up (free)' : 'Delivery'))));
    }

    const promoInput = h('input', { id: 'promo', value: state.promo, placeholder: promoHints[0]?.code ?? 'Promo code', autocomplete: 'off', 'aria-describedby': 'promo-msg' });
    body.append(h('div', { class: 'field' },
      h('label', { for: 'promo' }, 'Promo code'),
      h('div', { class: 'inline' }, promoInput, h('button', { type: 'button', class: 'outline', onclick: () => { state.promo = promoInput.value.trim(); refreshQuote(); } }, 'Apply')),
      h('small', { id: 'promo-msg', class: 'muted' }, state.quote?.promoApplied ? `✓ ${state.quote.promoMessage}` : state.quote?.promoMessage || (promoHints.length ? `Try ${promoHints.map((p) => p.code).join(' or ')}` : '')),
    ));

    const q = state.quote;
    if (q) {
      if (q.freeShippingGap > 0) {
        body.append(h('p', { class: 'small accent' }, `Add ${formatPeso(q.freeShippingGap)} more for free ${shop === 'friesta' ? 'delivery' : 'shipping'}.`));
      }
      body.append(h('dl', { class: 'totals' },
        row('Subtotal', formatPeso(q.subtotal)),
        q.discount ? row('Discount', `−${formatPeso(q.discount)}`) : null,
        row(state.fulfillment === 'delivery' ? 'Delivery' : 'Pickup', q.shipping ? formatPeso(q.shipping) : 'Free'),
        row('Total', formatPeso(q.total), 'grand'),
      ));
    }

    const needsAddress = state.fulfillment === 'delivery';
    body.append(
      field('name', 'Your name', { autocomplete: 'name', required: true }),
      field('contact', 'Phone or email', { autocomplete: 'tel', required: true }),
      needsAddress ? field('address', 'Delivery address', { autocomplete: 'street-address', required: true }) : null,
      field('note', 'Note (optional)', { maxlength: 200 }),
      h('button', { type: 'submit', disabled: state.busy }, state.busy ? 'Placing order…' : `Place order${q ? ` · ${formatPeso(q.total)}` : ''}`),
      h('p', { class: 'muted small' }, 'Demo checkout only: nothing is charged and your details are stored just for this demo.'),
    );
    dialog.append(body);
  }

  function field(name, label, attrs) {
    const err = state.fieldErrors?.[`customer.${name}`];
    return h('div', { class: 'field' + (err ? ' invalid' : '') },
      h('label', { for: `f-${name}` }, label),
      h('input', { id: `f-${name}`, name, value: state.values[name] ?? '', ...attrs, 'aria-invalid': err ? 'true' : null }),
      err ? h('small', { class: 'error' }, err) : null);
  }
  const row = (k, v, cls = '') => h('div', { class: cls }, h('dt', {}, k), h('dd', {}, v));

  cart.onChange(() => { refreshQuote(); render(); });
  render();
  refreshQuote();

  return { el: dialog, open() { state.fieldErrors = null; render(); dialog.showModal(); } };
}
