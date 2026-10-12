/**
 * friesta.js — Friesta ordering page.
 * Flow: load menu from the API -> render cards -> cart store -> checkout drawer -> POST /api/orders
 */
import { api } from '../lib/api.js';
import { h, qs, clear } from '../lib/dom.js';
import { createCart } from '../lib/cart.js';
import { createCartDrawer } from '../lib/cart-ui.js';
import { formatPeso } from '../shared/money.js';
import { mountFries } from '../lib/fries3d.js';

const grid = qs('#menu-grid');
const chips = qs('#chips');
const fab = qs('#cart-btn');
const cart = createCart('friesta');
const state = { menu: null, category: 'All' };
let drawer;

const fries = mountFries(qs('#fries-canvas'));

function renderChips() {
  clear(chips).append(...['All', ...state.menu.categories].map((c) =>
    h('button', { class: 'chip', type: 'button', 'aria-pressed': String(state.category === c), onclick: () => { state.category = c; renderChips(); renderMenu(); } }, c)));
}

function controls(item) {
  const qty = cart.qty(item.id);
  if (!qty) return h('button', { class: 'small', type: 'button', onclick: () => { cart.add(item.id); fries.bump(); } }, '+ Add');
  return h('div', { class: 'qty' },
    h('button', { type: 'button', 'aria-label': `Remove one ${item.name}`, onclick: () => cart.setQty(item.id, qty - 1) }, '−'),
    h('output', {}, qty),
    h('button', { type: 'button', 'aria-label': `Add one ${item.name}`, onclick: () => { cart.add(item.id); fries.bump(); } }, '+'));
}

function renderMenu() {
  const items = state.menu.items.filter((i) => state.category === 'All' || i.category === state.category);
  clear(grid).append(...items.map((item) => h('article', { class: 'card menu-card', 'data-tilt': '' },
    h('div', { class: 'menu-top' }, h('span', { class: 'tag' }, item.category.toUpperCase()), h('strong', { class: 'price' }, formatPeso(item.price))),
    h('h3', {}, item.name),
    h('p', { class: 'muted' }, item.desc),
    h('div', { class: 'menu-foot' }, h('div', {}, item.tags.map((t) => h('span', { class: 'pill' }, t))), controls(item)),
  )));
  dispatchEvent(new Event('content-updated'));
}

function updateFab() {
  qs('.count', fab).textContent = cart.count;
}

async function init() {
  try {
    state.menu = await api.get('menu');
  } catch (err) {
    clear(grid).append(h('div', { class: 'card' }, h('p', {}, `Couldn't load the menu: ${err.message}`), h('button', { onclick: () => location.reload() }, 'Try again')));
    return;
  }
  drawer = createCartDrawer({ shop: 'friesta', cart, getItem: (id) => state.menu.items.find((i) => i.id === id), promoHints: state.menu.promoHints, allowPickup: true, title: 'Your Friesta order' });
  document.body.append(drawer.el);
  fab.addEventListener('click', () => drawer.open());
  cart.onChange(() => { updateFab(); renderMenu(); });
  renderChips(); renderMenu(); updateFab();
}
init();
