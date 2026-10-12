/**
 * storefront.js — Streetwear store: search, filters, sorting, stock, cart and checkout.
 *
 * LESSON: the search box is "debounced" — we wait until the visitor stops typing for
 * 250ms before calling the API, so typing "hoodie" sends 1 request instead of 6.
 * We also use a request counter so a slow, old response can never overwrite a newer one.
 */
import { api } from '../lib/api.js';
import { h, qs, clear, debounce, svg } from '../lib/dom.js';
import { createCart } from '../lib/cart.js';
import { createCartDrawer } from '../lib/cart-ui.js';
import { garmentSvg } from '../lib/garments.js';
import { formatPeso } from '../shared/money.js';

const cart = createCart('storefront');
const state = { category: 'All', q: '', sort: '', items: [], all: [], categories: [], hints: [] };
const grid = qs('#product-grid');
let drawer, requestId = 0;

const art = (p) => svg(garmentSvg(p.kind, p.color));

async function load() {
  const id = ++requestId;
  const params = new URLSearchParams();
  if (state.category !== 'All') params.set('category', state.category);
  if (state.q) params.set('q', state.q);
  if (state.sort) params.set('sort', state.sort);
  try {
    const data = await api.get(`products?${params}`);
    if (id !== requestId) return; // a newer request is already in flight
    state.items = data.items;
    if (!state.all.length) { state.all = data.items; state.categories = data.categories; state.hints = data.promoHints; }
    render();
  } catch (err) {
    clear(grid).append(h('div', { class: 'card' }, h('p', {}, `Couldn't load products: ${err.message}`), h('button', { onclick: load }, 'Try again')));
  }
}

function stockLabel(p) {
  if (p.stock <= 0) return h('span', { class: 'stock out' }, 'Sold out');
  if (p.stock <= 5) return h('span', { class: 'stock low' }, `Only ${p.stock} left`);
  return h('span', { class: 'stock' }, 'In stock');
}

function render() {
  qs('#result-count').textContent = `${state.items.length} product${state.items.length === 1 ? '' : 's'}`;
  if (!state.items.length) {
    clear(grid).append(h('div', { class: 'card center', style: { gridColumn: '1 / -1' } }, h('h3', {}, 'No matches'), h('p', { class: 'muted' }, 'Try a different search or category.')));
    return;
  }
  clear(grid).append(...state.items.map((p) => {
    const inCart = cart.qty(p.id);
    return h('article', { class: 'card product', 'data-tilt': '' },
      h('div', { class: 'product-art' }, art(p)),
      h('span', { class: 'tag' }, p.category.toUpperCase()),
      h('h3', {}, p.name),
      h('p', { class: 'muted small' }, `${p.blurb} · ${p.colorName}`),
      h('div', { class: 'product-foot' },
        h('div', {}, h('strong', { class: 'price' }, formatPeso(p.price)), h('div', {}, stockLabel(p))),
        h('button', { type: 'button', class: 'small', disabled: p.stock <= inCart, onclick: () => { cart.add(p.id); } }, p.stock <= 0 ? 'Sold out' : inCart ? `In cart (${inCart})` : 'Add to cart')));
  }));
  dispatchEvent(new Event('content-updated'));
}

function renderChips() {
  clear(qs('#chips')).append(...['All', ...state.categories].map((c) =>
    h('button', { class: 'chip', type: 'button', 'aria-pressed': String(state.category === c), onclick: () => { state.category = c; renderChips(); load(); } }, c)));
}

// 3D lookbook ring (pure CSS 3D): panels sit around a cylinder and the whole ring rotates.
function buildRing(products) {
  const picks = products.slice(0, 6);
  const track = qs('#ring-track');
  track.style.setProperty('--n', picks.length);
  track.append(...picks.map((p, i) => h('div', { class: 'ring-panel', style: { '--i': i } }, art(p), h('span', {}, p.name))));
}

async function init() {
  qs('#search').addEventListener('input', debounce((e) => { state.q = e.target.value.trim(); load(); }, 250));
  qs('#sort').addEventListener('change', (e) => { state.sort = e.target.value; load(); });
  await load();
  if (!state.all.length) return;
  renderChips();
  buildRing(state.all);

  drawer = createCartDrawer({ shop: 'storefront', cart, getItem: (id) => state.all.find((p) => p.id === id), promoHints: state.hints, allowPickup: false, title: 'Your cart' });
  document.body.append(drawer.el);
  const fab = qs('#cart-btn');
  fab.addEventListener('click', () => drawer.open());
  const sync = () => { qs('.count', fab).textContent = cart.count; };
  cart.onChange(() => { sync(); render(); });
  sync();
}
init();
