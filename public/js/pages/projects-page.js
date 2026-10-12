/**
 * projects-page.js — the full gallery: filters, search, URL sync and smooth transitions.
 *
 * The active filter is stored in the URL (?filter=uiux) so it survives a refresh and can
 * be linked to from the home page. Works on GitHub Pages because it's a query string on a
 * real file, not a client-side "route".
 */
import { h, qs, clear, debounce } from '../lib/dom.js';
import { projects, CATEGORIES, inFilter } from '../data/projects.js';
import { projectCard } from '../components/project-card.js';

const grid = qs('#gallery');
const bar = qs('#filters');
const params = new URLSearchParams(location.search);
const state = {
  filter: CATEGORIES.some((c) => c.id === params.get('filter')) ? params.get('filter') : 'all',
  q: params.get('q') ?? '',
};
qs('#search').value = state.q;

const matches = (p) => inFilter(p, state.filter) && `${p.title} ${p.summary} ${p.tech.join(' ')}`.toLowerCase().includes(state.q.toLowerCase());

function renderFilters() {
  clear(bar).append(...CATEGORIES.map((c) => {
    const count = projects.filter((p) => inFilter(p, c.id)).length;
    return h('button', { class: 'chip', type: 'button', 'aria-pressed': String(state.filter === c.id), onclick: () => setFilter(c.id) }, c.label, h('span', { class: 'chip-count' }, count));
  }));
}

function renderGrid() {
  const list = projects.filter(matches);
  qs('#count').textContent = `${list.length} project${list.length === 1 ? '' : 's'}`;
  clear(grid).append(...(list.length ? list.map((p) => projectCard(p)) : [h('div', { class: 'empty' }, h('h3', {}, 'No projects match'), h('p', { class: 'muted' }, 'Try another filter or clear the search.'))]));
  dispatchEvent(new Event('content-updated'));
}

/** Use the View Transitions API for a smooth cross-fade when the browser supports it. */
function update(fn) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (document.startViewTransition && !reduced) document.startViewTransition(fn);
  else fn();
}

function syncUrl() {
  const u = new URL(location.href);
  state.filter === 'all' ? u.searchParams.delete('filter') : u.searchParams.set('filter', state.filter);
  state.q ? u.searchParams.set('q', state.q) : u.searchParams.delete('q');
  history.replaceState(null, '', u);
}

function setFilter(id) {
  state.filter = id;
  syncUrl();
  update(() => { renderFilters(); renderGrid(); });
}

qs('#search').addEventListener('input', debounce((e) => { state.q = e.target.value.trim(); syncUrl(); update(renderGrid); }, 200));
renderFilters();
renderGrid();
