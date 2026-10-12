/**
 * calculator.js — UI for the Smart Calculator. The maths lives in shared/calc-parser.js.
 */
import { evaluate } from '../shared/calc-parser.js';
import { h, qs, clear, storage } from '../lib/dom.js';

const input = qs('#expr');
const out = qs('#result');
const historyEl = qs('#history');
let ans = 0;
let history = storage.get('calc-history', []);

const KEYS = [
  ['C', 'clear', 'fn'], ['(', '(', 'fn'], [')', ')', 'fn'], ['÷', '/', 'op'],
  ['7'], ['8'], ['9'], ['×', '*', 'op'],
  ['4'], ['5'], ['6'], ['−', '-', 'op'],
  ['1'], ['2'], ['3'], ['+', '+', 'op'],
  ['0'], ['.'], ['⌫', 'back', 'fn'], ['=', 'eval', 'eq'],
  ['√', 'sqrt(', 'fn'], ['^', '^', 'fn'], ['%', '%', 'fn'], ['Ans', 'ans', 'fn'],
  ['π', 'pi', 'fn'], ['sin', 'sind(', 'fn'], ['cos', 'cosd(', 'fn'], ['log', 'log(', 'fn'],
];

function insert(text) {
  const { selectionStart: a, selectionEnd: b } = input;
  input.setRangeText(text, a, b, 'end');
  input.focus();
  preview();
}

function preview() {
  const r = evaluate(input.value, { ans });
  out.classList.toggle('error', !r.ok && input.value.trim() !== '');
  out.textContent = !input.value.trim() ? '0' : r.ok ? `= ${r.value.toLocaleString('en-US', { maximumFractionDigits: 10 })}` : r.error;
  // Live preview: the answer updates while you type. (Errors are quiet until you press "=".)
  if (!r.ok && !input.dataset.committed) out.textContent = input.value.trim() ? '…' : '0';
}

function commit() {
  const r = evaluate(input.value, { ans });
  if (!r.ok) { input.dataset.committed = '1'; out.classList.add('error'); out.textContent = r.error; return; }
  ans = r.value;
  history = [{ expr: input.value, value: r.value }, ...history].slice(0, 12);
  storage.set('calc-history', history);
  input.value = String(r.value);
  delete input.dataset.committed;
  renderHistory();
  preview();
}

function key([label, action = label, kind = 'num']) {
  return h('button', { type: 'button', class: `key ${kind}`, 'aria-label': label, onclick: () => {
    delete input.dataset.committed;
    if (action === 'clear') { input.value = ''; preview(); }
    else if (action === 'back') { input.value = input.value.slice(0, -1); preview(); }
    else if (action === 'eval') commit();
    else insert(action);
  } }, label);
}

function renderHistory() {
  clear(historyEl);
  if (!history.length) { historyEl.append(h('p', { class: 'muted small' }, 'Your calculations will appear here.')); return; }
  historyEl.append(...history.map((item) => h('button', { type: 'button', class: 'outline hist', onclick: () => { input.value = item.expr; preview(); input.focus(); } },
    h('span', { class: 'muted' }, item.expr), h('strong', {}, `= ${item.value}`))));
}

qs('#keys').append(...KEYS.map(key));
input.addEventListener('input', () => { delete input.dataset.committed; preview(); });
input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); commit(); } if (e.key === 'Escape') { input.value = ''; preview(); } });
qs('#clear-history').addEventListener('click', () => { history = []; storage.set('calc-history', []); renderHistory(); });
renderHistory();
preview();
