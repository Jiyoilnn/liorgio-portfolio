/**
 * dashboard.js — Business Analytics.
 *
 * Data flow:  controls (range / shop) -> GET /api/analytics -> render KPIs, charts, tables.
 * The numbers come from the orders customers place in the Friesta and Storefront projects,
 * so try ordering something and press "Refresh" (or turn on auto-refresh).
 */
import { api, ApiError } from '../lib/api.js';
import { h, qs, clear, toast, storage } from '../lib/dom.js';
import { lineChart, hBars } from '../lib/charts.js';
import { mountHours3D } from '../lib/hours3d.js';
import { formatPeso, formatPesoCompact } from '../shared/money.js';

const state = { days: 30, shop: 'all', data: null, admin: storage.get('admin-key', '') || '', auto: false };
const hours3d = mountHours3D(qs('#hours-canvas'));
let timer;

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fmtDate = (iso) => new Date(`${iso}T00:00:00`).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
const fmtTime = (iso) => new Date(iso).toLocaleString('en-PH', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZone: 'Asia/Manila' });
const SHOP_NAME = { friesta: 'Friesta', storefront: 'Storefront' };

/** Animate a number from its old value to the new one (skipped for reduced-motion users). */
function countUp(el, to, format) {
  const from = Number(el.dataset.v ?? 0);
  el.dataset.v = to;
  if (reduceMotion || from === to) { el.textContent = format(to); return; }
  const start = performance.now(), dur = 700;
  const tick = (now) => {
    const t = Math.min(1, (now - start) / dur);
    const eased = 1 - (1 - t) ** 3; // ease-out cubic: fast start, gentle landing
    el.textContent = format(Math.round(from + (to - from) * eased));
    if (t < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

function renderKpis(k) {
  const defs = [['revenue', formatPeso], ['orders', (n) => n.toLocaleString('en-PH')], ['avgOrder', formatPeso]];
  for (const [key, fmt] of defs) {
    const card = qs(`[data-kpi="${key}"]`);
    countUp(qs('strong', card), k[key].value, fmt);
    const d = qs('.delta', card), c = k[key].change;
    d.textContent = `${c > 0 ? '▲' : c < 0 ? '▼' : '■'} ${Math.abs(c)}% vs previous ${state.days} days`;
    d.className = `delta ${c > 0 ? 'up' : c < 0 ? 'down' : ''}`;
  }
}

function renderTable(rows) {
  const body = qs('#orders-body');
  clear(body).append(...rows.map((o) => h('tr', {},
    h('td', {}, h('strong', {}, o.id)),
    h('td', {}, SHOP_NAME[o.shop]),
    h('td', {}, o.customer),
    h('td', {}, fmtTime(o.createdAt)),
    h('td', {}, formatPeso(o.total)),
    h('td', {}, state.admin ? statusSelect(o) : h('span', { class: `badge ${o.status}` }, o.status)))));
}

function statusSelect(o) {
  return h('select', { class: 'status-select', 'aria-label': `Status of order ${o.id}`, onchange: async (e) => {
    try {
      await api.patch(`orders/${o.id}`, { status: e.target.value }, { 'X-Admin-Key': state.admin });
      toast(`${o.id} marked ${e.target.value}`, 'success');
      load();
    } catch (err) {
      toast(err.status === 401 ? 'Wrong admin key.' : err.message, 'error');
      if (err.status === 401) setAdmin('');
      load();
    }
  } }, ['pending', 'processing', 'completed', 'cancelled'].map((s) => h('option', { value: s, selected: s === o.status }, s)));
}

function render() {
  const d = state.data;
  renderKpis(d.kpis);

  lineChart(qs('#revenue-chart'), d.series.map((p) => ({ label: fmtDate(p.date), value: p.revenue })), { format: formatPesoCompact, name: 'Daily revenue' });
  clear(qs('#series-body')).append(...d.series.map((p) => h('tr', {}, h('td', {}, fmtDate(p.date)), h('td', {}, p.orders), h('td', {}, formatPeso(p.revenue)))));

  hBars(qs('#top-items'), d.topItems.map((i) => ({ label: i.name, value: i.revenue, note: `${i.qty} sold` })), { format: formatPeso });

  // revenue split between the two shops: a single stacked bar with direct labels + legend
  const f = d.byShop.friesta ?? 0, st = d.byShop.storefront ?? 0, total = f + st || 1;
  qs('#shop-split').replaceChildren(
    h('div', { class: 'split-bar', role: 'img', 'aria-label': `Friesta ${formatPeso(f)}, Storefront ${formatPeso(st)}` },
      f ? h('span', { class: 's-friesta', style: { width: `${(f / total) * 100}%` } }) : null,
      st ? h('span', { class: 's-store', style: { width: `${(st / total) * 100}%` } }) : null),
    h('ul', { class: 'legend' },
      h('li', {}, h('i', { class: 's-friesta' }), 'Friesta ', h('strong', {}, formatPeso(f)), h('span', { class: 'muted' }, ` · ${Math.round((f / total) * 100)}%`)),
      h('li', {}, h('i', { class: 's-store' }), 'Storefront ', h('strong', {}, formatPeso(st)), h('span', { class: 'muted' }, ` · ${Math.round((st / total) * 100)}%`))));

  qs('#status-list').replaceChildren(...Object.entries(d.status).map(([k, v]) => h('li', {}, h('span', { class: `badge ${k}` }, k), h('strong', {}, v))));

  hours3d.update(d.hours);
  const peak = d.hours.indexOf(Math.max(...d.hours));
  const label = (hr) => `${hr % 12 || 12}${hr < 12 ? 'AM' : 'PM'}`;
  qs('#peak').textContent = d.hours[peak] ? `Busiest hour: ${label(peak)} (${d.hours[peak]} orders)` : 'No orders in this range.';

  renderTable(d.recent);
  qs('#updated').textContent = `Updated ${new Date().toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit', second: '2-digit' })}`;
}

async function load() {
  try {
    state.data = await api.get(`analytics?days=${state.days}&shop=${state.shop}`);
    render();
  } catch (err) {
    toast(err instanceof ApiError ? err.message : 'Could not load analytics.', 'error');
  }
}

// ---- controls ---------------------------------------------------------------------------
function renderRange() {
  clear(qs('#range')).append(...[7, 14, 30, 60].map((n) => h('button', { class: 'chip', type: 'button', 'aria-pressed': String(state.days === n), onclick: () => { state.days = n; renderRange(); load(); } }, `${n} days`)));
}
qs('#shop').addEventListener('change', (e) => { state.shop = e.target.value; load(); });
qs('#refresh').addEventListener('click', load);
qs('#auto').addEventListener('change', (e) => {
  state.auto = e.target.checked;
  clearInterval(timer);
  if (state.auto) timer = setInterval(load, 10000);
});
qs('#toggle-table').addEventListener('click', (e) => {
  const t = qs('#series-table'), show = t.hidden;
  t.hidden = !show;
  e.currentTarget.textContent = show ? 'Hide data table' : 'View as table';
  e.currentTarget.setAttribute('aria-expanded', String(show));
});

function setAdmin(key) {
  state.admin = key;
  storage.set('admin-key', key);
  qs('#admin').textContent = key ? 'Admin mode: ON' : 'Admin mode';
  qs('#admin').classList.toggle('outline', !key);
  if (state.data) renderTable(state.data.recent);
}
qs('#admin').addEventListener('click', () => {
  if (state.admin) return setAdmin('');
  const key = prompt('Enter the admin key. (Local default: demo-admin. Change it with the ADMIN_KEY environment variable.)');
  if (key) { setAdmin(key.trim()); toast('Admin mode on: you can now change order statuses.', 'success'); }
});

renderRange();
setAdmin(state.admin);
load();
