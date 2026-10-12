/**
 * charts.js — small, dependency-free SVG charts.
 *
 * LESSON: a chart is just maths that turns data values into pixel positions:
 *      x = left + (index / (count - 1)) * width        y = bottom - (value / max) * height
 * That mapping is called a SCALE (what d3.scaleLinear gives you). Once you can write it
 * yourself, chart libraries stop being magic.
 *
 * Design rules followed here: thin marks, quiet grid, one axis, labels in text colours
 * (never the series colour), and a hover tooltip on every mark.
 */
import { h } from './dom.js';

const NS = 'http://www.w3.org/2000/svg';

/** Create an SVG element: s('path', { d: '...' }) */
export function s(tag, attrs = {}, ...children) {
  const el = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) if (v != null) el.setAttribute(k, v);
  for (const c of children.flat()) if (c != null) el.append(c instanceof Node ? c : document.createTextNode(c));
  return el;
}

/** Round a max value up to a "nice" number so grid lines land on 1, 2, 5 × 10ⁿ. */
export function niceMax(v) {
  if (v <= 0) return 1;
  const pow = 10 ** Math.floor(Math.log10(v));
  const n = v / pow;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * pow;
}

/**
 * Area/line chart with a crosshair tooltip.
 * @param {HTMLElement} host
 * @param {{label:string, value:number}[]} points
 * @param {{ format:(n:number)=>string, name:string }} opts
 */
export function lineChart(host, points, { format, name }) {
  const W = 720, H = 280, m = { t: 16, r: 16, b: 30, l: 52 };
  const iw = W - m.l - m.r, ih = H - m.t - m.b;
  const max = niceMax(Math.max(...points.map((p) => p.value), 1));
  const x = (i) => m.l + (points.length === 1 ? iw / 2 : (i / (points.length - 1)) * iw);
  const y = (v) => m.t + ih - (v / max) * ih;

  const svg = s('svg', { viewBox: `0 0 ${W} ${H}`, class: 'chart', role: 'img', 'aria-label': `${name} over time. ${points.length} data points, highest ${format(Math.max(...points.map((p) => p.value)))}.` });
  svg.append(s('defs', {}, s('linearGradient', { id: 'area-fill', x1: 0, y1: 0, x2: 0, y2: 1 },
    s('stop', { offset: '0%', 'stop-color': 'var(--accent)', 'stop-opacity': 0.32 }), s('stop', { offset: '100%', 'stop-color': 'var(--accent)', 'stop-opacity': 0 }))));

  // recessive grid + y labels
  for (let i = 0; i <= 4; i++) {
    const v = (max / 4) * i;
    svg.append(s('line', { x1: m.l, x2: W - m.r, y1: y(v), y2: y(v), class: 'grid' }), s('text', { x: m.l - 10, y: y(v) + 4, 'text-anchor': 'end', class: 'axis' }, format(v)));
  }
  // x labels: about 6 evenly spaced
  const step = Math.max(1, Math.ceil(points.length / 6));
  points.forEach((p, i) => { if (i % step === 0 || i === points.length - 1) svg.append(s('text', { x: x(i), y: H - 8, 'text-anchor': 'middle', class: 'axis' }, p.label)); });

  const line = points.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(p.value).toFixed(1)}`).join(' ');
  svg.append(s('path', { d: `${line} L${x(points.length - 1)} ${y(0)} L${x(0)} ${y(0)} Z`, fill: 'url(#area-fill)' }), s('path', { d: line, class: 'series-line' }));

  // hover layer: vertical rule + marker, moved to the nearest point
  const rule = s('line', { class: 'rule', y1: m.t, y2: m.t + ih, visibility: 'hidden' });
  const dot = s('circle', { r: 5, class: 'dot', visibility: 'hidden' });
  const hit = s('rect', { x: m.l, y: m.t, width: iw, height: ih, fill: 'transparent', tabindex: 0, 'aria-label': 'Chart values. Use left and right arrow keys.' });
  svg.append(rule, dot, hit);

  const tip = h('div', { class: 'tooltip', role: 'status', hidden: true });
  host.replaceChildren(svg, tip);
  host.classList.add('chart-host');

  let active = -1;
  function show(i) {
    active = Math.max(0, Math.min(points.length - 1, i));
    const p = points[active];
    const px = x(active), py = y(p.value);
    rule.setAttribute('x1', px); rule.setAttribute('x2', px); rule.setAttribute('visibility', 'visible');
    dot.setAttribute('cx', px); dot.setAttribute('cy', py); dot.setAttribute('visibility', 'visible');
    tip.hidden = false;
    tip.replaceChildren(h('span', { class: 'muted small' }, p.label), h('strong', {}, format(p.value)));
    const rect = svg.getBoundingClientRect();
    const left = (px / W) * rect.width;
    tip.style.left = `${Math.min(Math.max(left, 60), rect.width - 60)}px`;
    tip.style.top = `${(py / H) * rect.height - 12}px`;
  }
  const hide = () => { rule.setAttribute('visibility', 'hidden'); dot.setAttribute('visibility', 'hidden'); tip.hidden = true; };
  hit.addEventListener('pointermove', (e) => {
    const r = svg.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * W;
    show(Math.round(((px - m.l) / iw) * (points.length - 1)));
  });
  hit.addEventListener('pointerleave', hide);
  hit.addEventListener('blur', hide);
  hit.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); show(active + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); show(active < 0 ? points.length - 1 : active - 1); }
  });
}

/** Horizontal bars (best sellers). Rows: [{label, value, note}] */
export function hBars(host, rows, { format }) {
  const max = Math.max(...rows.map((r) => r.value), 1);
  host.replaceChildren(h('ul', { class: 'hbars' }, rows.map((r) => h('li', { title: `${r.label}: ${format(r.value)}` },
    h('div', { class: 'hbar-top' }, h('span', {}, r.label), h('strong', {}, format(r.value))),
    h('div', { class: 'hbar-track' }, h('div', { class: 'hbar-fill', style: { width: `${(r.value / max) * 100}%` } })),
    r.note ? h('span', { class: 'muted small' }, r.note) : null))));
}
