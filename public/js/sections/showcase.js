/**
 * showcase.js — the interactive UI/UX showcase: design tokens, components,
 * wireframe-vs-final slider, the 3D phone fan and the responsive demo.
 */
import { h, qs, qsa } from '../lib/dom.js';
import { mockup } from '../components/mockup.js';
import { byId } from '../data/projects.js';

const TOKENS = [
  ['bg', '#060709'], ['charcoal', '#121418'], ['text', '#f5f5f2'], ['muted', '#8f929a'],
  ['accent', '#ffd400'], ['accent-2', '#fff3a3'], ['ok', '#5ee6a8'], ['danger', '#ff7a7a'],
];

export function initShowcase() {
  // ---- design tokens ------------------------------------------------------------------
  qs('#token-grid')?.append(...TOKENS.map(([name, hex]) => h('div', { class: 'token' }, h('i', { style: { background: hex } }), h('span', {}, `--${name}`), h('code', {}, hex))));

  // ---- components: segmented control + range ------------------------------------------
  qsa('.seg').forEach((seg) => seg.addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    seg.querySelectorAll('button').forEach((x) => x.setAttribute('aria-checked', String(x === b)));
  }));
  const range = qs('#demo-range');
  range?.addEventListener('input', () => { qs('#demo-range-out').textContent = `${range.value}%`; });

  // ---- wireframe -> final ------------------------------------------------------------------
  const lp = byId('launchpad-startup');
  qs('#compare-final')?.append(mockup(lp.preview, lp.id, { label: 'Final landing page design' }));
  const compare = qs('#compare');
  const slider = qs('#compare-range');
  slider?.addEventListener('input', () => compare.style.setProperty('--pos', `${slider.value}%`));

  // ---- 3D phone fan ----------------------------------------------------------------------
  const phones = ['kalye-bank-app', 'kain-food-delivery', 'galaw-fitness-app'].map(byId);
  const host = qs('#phones');
  if (host) {
    const order = ['left', 'center', 'right'];
    const slots = phones.map((p, i) => h('div', {
      class: 'phone-slot', tabindex: 0, role: 'button', 'aria-label': `Bring ${p.title} to the front`, dataset: { pos: order[i] },
    }, mockup(p.preview, p.id, { label: `${p.title} screen` })));
    const focus = (slot) => {
      const i = slots.indexOf(slot);
      slots.forEach((s, k) => { s.dataset.pos = k === i ? 'center' : k === (i + 1) % 3 ? 'right' : 'left'; });
    };
    slots.forEach((s) => {
      s.addEventListener('click', () => focus(s));
      s.addEventListener('mouseenter', () => matchMedia('(hover: hover)').matches && focus(s));
      s.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); focus(s); } });
    });
    host.append(...slots);
  }

  initResponsiveDemo();
}

/**
 * The responsive demo renders the SAME component at real widths (1024 / 640 / 360 px) so its
 * container queries genuinely kick in, then scales each frame down to fit the page.
 */
function initResponsiveDemo() {
  const host = qs('#resp-frames');
  if (!host) return;
  const frames = [['Desktop', 1024, 0.56], ['Tablet', 640, 0.27], ['Phone', 360, 0.17]].map(([name, w, share]) => {
    const demo = h('div', { class: 'rdemo', style: { width: `${w}px` } },
      h('div', { class: 'rd-nav' }, h('span', { class: 'rd-logo' }, 'SABOR'), h('div', { class: 'rd-links' }, h('span', {}, 'Menu'), h('span', {}, 'Visit'), h('span', {}, 'Reserve')), h('i', { class: 'rd-burger' })),
      h('div', { class: 'rd-hero' }, h('div', {}, h('h4', {}, 'Slow food, open fire.'), h('p', {}, 'Wood-fired Filipino classics in the heart of Caloocan.'), h('span', { class: 'rd-btn' }, 'Reserve a table')), h('div', { class: 'rd-img' })),
      h('div', { class: 'rd-cards' }, ['Grilled liempo', 'Kinilaw', 'Sinigang'].map((d, i) => h('div', {}, h('b', {}, d), h('span', {}, ['₱320', '₱280', '₱260'][i])))));
    const viewport = h('div', { class: 'rframe-viewport' }, demo);
    const frame = h('figure', { class: 'rframe', style: { margin: 0 } }, h('figcaption', { class: 'rframe-bar' }, h('span', {}, name), h('span', {}, `${w}px`)), viewport);
    return { frame, viewport, demo, w, share };
  });
  host.append(...frames.map((f) => f.frame));

  const fit = () => {
    const total = host.clientWidth - 32;
    const narrow = host.clientWidth < 600; // small screens: frames wrap onto two rows
    const shares = narrow ? [1.03, 0.55, 0.38] : null;
    for (const [i, f] of frames.entries()) {
      const target = Math.max(90, total * (shares ? shares[i] : f.share));
      const s = Math.min(1, target / f.w);
      f.demo.style.transform = `scale(${s})`;
      f.frame.style.width = `${f.w * s}px`;
      f.viewport.style.height = `${f.demo.offsetHeight * s}px`;
    }
  };
  new ResizeObserver(fit).observe(host);
  fit();
}
