/**
 * dom.js — small helpers for building HTML safely.
 *
 * LESSON (XSS): element.innerHTML = userText lets an attacker run scripts by typing
 * "<img src=x onerror=...>" as their name. `h()` below ONLY ever sets text through
 * textContent / text nodes, so user data can never turn into markup.
 */

/**
 * Hyperscript: h('button', { class: 'btn', onclick: fn }, 'Click', h('span', {}, '!'))
 * - on*  props become event listeners
 * - `class` / `dataset` / boolean props are handled
 * - children can be strings, numbers, nodes, arrays or null (ignored)
 */
export function h(tag, props = {}, ...children) {
  const el = document.createElement(tag);
  for (const [key, value] of Object.entries(props ?? {})) {
    if (value == null || value === false) continue;
    if (key.startsWith('on') && typeof value === 'function') el.addEventListener(key.slice(2).toLowerCase(), value);
    else if (key === 'class') el.className = value;
    else if (key === 'dataset') Object.assign(el.dataset, value);
    else if (key === 'style' && typeof value === 'object') {
      // CSS custom properties ("--i") must go through setProperty; Object.assign silently ignores them.
      for (const [k, v] of Object.entries(value)) (k.startsWith('--') ? el.style.setProperty(k, v) : (el.style[k] = v));
    }
    else if (value === true) el.setAttribute(key, '');
    else el.setAttribute(key, value);
  }
  append(el, children);
  return el;
}

function append(el, children) {
  for (const child of children.flat(Infinity)) {
    if (child == null || child === false) continue;
    el.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
}

/** SVG needs its own namespace, otherwise the browser treats <svg> children as unknown HTML tags. */
export function svg(markup) {
  const t = document.createElement('template');
  t.innerHTML = markup.trim(); // only ever call this with trusted, hard-coded markup
  return t.content.firstElementChild;
}

export const qs = (sel, root = document) => root.querySelector(sel);
export const qsa = (sel, root = document) => [...root.querySelectorAll(sel)];

export function clear(el) { el.replaceChildren(); return el; }

export function debounce(fn, ms = 250) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

/** Small non-blocking notification. role="status" makes screen readers announce it. */
export function toast(message, kind = 'info') {
  let host = qs('#toasts');
  if (!host) { host = h('div', { id: 'toasts', 'aria-live': 'polite' }); document.body.append(host); }
  const t = h('div', { class: `toast toast-${kind}`, role: 'status' }, message);
  host.append(t);
  requestAnimationFrame(() => t.classList.add('show'));
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, 3200);
}

/** Tiny pub/sub: lets modules react to changes without importing each other. */
export function createEmitter() {
  const listeners = new Set();
  return { on: (fn) => (listeners.add(fn), () => listeners.delete(fn)), emit: (v) => listeners.forEach((fn) => fn(v)) };
}

/** localStorage that never throws (private mode / blocked storage). */
export const storage = {
  get(key, fallback) { try { const v = localStorage.getItem(key); return v == null ? fallback : JSON.parse(v); } catch { return fallback; } },
  set(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch { return false; } },
  remove(key) { try { localStorage.removeItem(key); } catch { /* ignore */ } },
};
