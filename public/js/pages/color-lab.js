/**
 * color-lab.js — palette generator with locking, WCAG contrast checks and export.
 * Colour maths is in lib/color.js (pure + tested). This file is only the interface.
 */
import { h, qs, clear, toast, storage } from '../lib/dom.js';
import { generatePalette, hexToRgb, hexToHsl, contrast, wcagLevel, readableOn } from '../lib/color.js';

const state = { mode: 'analogous', colors: [], locked: new Set(), saved: storage.get('palettes', []), a: 0, b: 1 };

function generate() {
  const fresh = generatePalette(state.mode, 5);
  state.colors = state.colors.length ? fresh.map((c, i) => (state.locked.has(i) ? state.colors[i] : c)) : fresh; // locked swatches survive
  render();
}

async function copy(text) {
  try { await navigator.clipboard.writeText(text); toast(`Copied ${text.length > 40 ? 'to clipboard' : text}`, 'success'); }
  catch { toast('Copy blocked by the browser. Select the text manually.', 'error'); }
}

function swatch(hex, i) {
  const ink = readableOn(hex);
  const { r, g, b } = hexToRgb(hex), { h: hh, s, l } = hexToHsl(hex);
  const onWhite = contrast(hex, '#FFFFFF'), onBlack = contrast(hex, '#000000');
  return h('div', { class: 'swatch', style: { background: hex, color: ink } },
    h('button', { class: 'lock', type: 'button', 'aria-pressed': String(state.locked.has(i)), 'aria-label': `${state.locked.has(i) ? 'Unlock' : 'Lock'} ${hex}`, style: { color: ink }, onclick: () => { state.locked.has(i) ? state.locked.delete(i) : state.locked.add(i); render(); } }, state.locked.has(i) ? '🔒' : '🔓'),
    h('button', { class: 'hex', type: 'button', style: { color: ink }, onclick: () => copy(hex), title: 'Click to copy' }, hex),
    h('div', { class: 'sw-info' }, h('span', {}, `rgb(${r}, ${g}, ${b})`), h('span', {}, `hsl(${hh}, ${s}%, ${l}%)`),
      h('span', {}, `White ${onWhite.toFixed(1)} · ${wcagLevel(onWhite)}`), h('span', {}, `Black ${onBlack.toFixed(1)} · ${wcagLevel(onBlack)}`)));
}

function renderChecker() {
  const fg = state.colors[state.a], bg = state.colors[state.b];
  const ratio = contrast(fg, bg), level = wcagLevel(ratio);
  const options = (sel) => state.colors.map((c, i) => h('option', { value: i, selected: i === sel }, `${i + 1} · ${c}`));
  clear(qs('#checker')).append(
    h('div', { class: 'checker-controls' },
      h('div', { class: 'field' }, h('label', { for: 'fg' }, 'Text colour'), h('select', { id: 'fg', onchange: (e) => { state.a = +e.target.value; renderChecker(); } }, options(state.a))),
      h('div', { class: 'field' }, h('label', { for: 'bg' }, 'Background'), h('select', { id: 'bg', onchange: (e) => { state.b = +e.target.value; renderChecker(); } }, options(state.b)))),
    h('div', { class: 'sample', style: { background: bg, color: fg } }, h('strong', {}, 'The quick brown fox'), h('span', {}, 'jumps over the lazy dog. Small body text must reach 4.5:1.')),
    h('p', {}, h('strong', { class: ratio >= 4.5 ? 'good' : 'bad' }, `${ratio.toFixed(2)} : 1`), ` — ${level === 'Fail' ? 'Fails WCAG for text.' : level === 'AA Large' ? 'OK for large text only (≥ 24px, or 19px bold).' : `Passes WCAG ${level}.`}`));
}

function exportText(kind) {
  const c = state.colors;
  if (kind === 'css') return `:root {\n${c.map((x, i) => `  --color-${i + 1}: ${x};`).join('\n')}\n}`;
  if (kind === 'json') return JSON.stringify(c, null, 2);
  return `// tailwind.config.js\ncolors: {\n${c.map((x, i) => `  brand${i + 1}: '${x}',`).join('\n')}\n}`;
}

function renderSaved() {
  clear(qs('#saved')).append(...(state.saved.length ? state.saved.map((p, n) => h('button', { type: 'button', class: 'saved-strip outline', 'aria-label': `Load saved palette ${n + 1}`, onclick: () => { state.colors = [...p]; state.locked.clear(); render(); } }, p.map((c) => h('span', { style: { background: c } }))))
    : [h('p', { class: 'muted small' }, 'Saved palettes appear here.')]));
}

function render() {
  clear(qs('#palette')).append(...state.colors.map(swatch));
  renderChecker();
  qs('#export').textContent = exportText(qs('#format').value);
  qs('#modes').querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.mode === state.mode)));
  renderSaved();
}

qs('#modes').addEventListener('click', (e) => { if (e.target.dataset.mode) { state.mode = e.target.dataset.mode; generate(); } });
qs('#generate').addEventListener('click', generate);
qs('#format').addEventListener('change', render);
qs('#copy-export').addEventListener('click', () => copy(exportText(qs('#format').value)));
qs('#save-palette').addEventListener('click', () => { state.saved = [[...state.colors], ...state.saved].slice(0, 8); storage.set('palettes', state.saved); renderSaved(); toast('Palette saved', 'success'); });
addEventListener('keydown', (e) => { if (e.code === 'Space' && !e.target.matches('input, select, textarea, button')) { e.preventDefault(); generate(); } });
generate();
