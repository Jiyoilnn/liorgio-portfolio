/**
 * todo.js — Task Dashboard.
 *
 * LESSON: the UI is a pure function of `state`. We never edit the DOM by hand when
 * something changes; we change `state`, call render(), and the screen catches up.
 * (This is the core idea behind React, Vue and Svelte — here you can see it without a framework.)
 */
import { h, qs, clear, toast, storage } from '../lib/dom.js';

const KEY = 'tasks-v2';
const PRIORITY = { high: 3, medium: 2, low: 1 };
const state = { tasks: storage.get(KEY, []), filter: 'all', query: '', editing: null };
let dragId = null;

const save = () => storage.set(KEY, state.tasks);
const uid = () => (crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()));

function addTask(text, priority, due) {
  state.tasks.unshift({ id: uid(), text, priority, due: due || '', done: false, createdAt: Date.now() });
  save(); render();
}

function removeTask(id) {
  const index = state.tasks.findIndex((t) => t.id === id);
  const [removed] = state.tasks.splice(index, 1);
  save(); render();
  // Undo is friendlier than "Are you sure?" dialogs: act now, allow a quick reversal.
  toastUndo(`Deleted "${removed.text.slice(0, 30)}"`, () => { state.tasks.splice(index, 0, removed); save(); render(); });
}

function toastUndo(msg, undo) {
  const btn = h('button', { class: 'small', type: 'button', style: { marginLeft: '12px' } }, 'Undo');
  const el = h('div', { class: 'toast toast-info', role: 'status' }, msg, btn);
  let host = qs('#toasts'); if (!host) { host = h('div', { id: 'toasts' }); document.body.append(host); }
  host.append(el);
  requestAnimationFrame(() => el.classList.add('show'));
  const close = () => { el.classList.remove('show'); setTimeout(() => el.remove(), 300); };
  btn.addEventListener('click', () => { undo(); close(); });
  setTimeout(close, 5000);
}

const isOverdue = (t) => t.due && !t.done && t.due < new Date().toISOString().slice(0, 10);

function visible() {
  const q = state.query.toLowerCase();
  return state.tasks.filter((t) => (state.filter === 'all' || (state.filter === 'done' ? t.done : !t.done)) && t.text.toLowerCase().includes(q));
}

function render() {
  const list = visible();
  const total = state.tasks.length, done = state.tasks.filter((t) => t.done).length;
  qs('#count').textContent = total - done;
  qs('#progress-bar').style.width = total ? `${(done / total) * 100}%` : '0%';
  qs('#progress-text').textContent = total ? `${done} of ${total} done` : 'No tasks yet';
  qs('#clear-done').disabled = !done;

  qs('#filters').querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.filter === state.filter)));

  clear(qs('#tasks'));
  if (!list.length) {
    qs('#tasks').append(h('p', { class: 'muted center' }, total ? 'Nothing matches this filter.' : 'Add your first task above. Drag tasks to reorder them.'));
    return;
  }
  qs('#tasks').append(...list.map(row));
}

function row(t) {
  const editing = state.editing === t.id;
  const text = editing
    ? h('input', { class: 'edit', value: t.text, 'aria-label': 'Edit task', onblur: (e) => finishEdit(t, e.target.value), onkeydown: (e) => { if (e.key === 'Enter') e.target.blur(); if (e.key === 'Escape') { state.editing = null; render(); } } })
    : h('span', { class: 'task-text', ondblclick: () => { state.editing = t.id; render(); qs('.edit')?.focus(); } }, t.text);

  const el = h('div', { class: `list-item task ${t.done ? 'done' : ''}`, draggable: 'true', dataset: { id: t.id },
    ondragstart: (e) => { dragId = t.id; e.dataTransfer.effectAllowed = 'move'; el.classList.add('dragging'); },
    ondragend: () => { dragId = null; el.classList.remove('dragging'); },
    ondragover: (e) => { e.preventDefault(); el.classList.add('over'); },
    ondragleave: () => el.classList.remove('over'),
    ondrop: (e) => { e.preventDefault(); reorder(dragId, t.id); },
  },
    h('span', { class: 'grip', 'aria-hidden': 'true', title: 'Drag to reorder' }, '⋮⋮'),
    h('input', { type: 'checkbox', checked: t.done, 'aria-label': `Mark "${t.text}" complete`, onchange: (e) => { t.done = e.target.checked; save(); render(); } }),
    h('div', { class: 'task-main' }, text,
      h('div', { class: 'task-meta' }, h('span', { class: `prio ${t.priority}` }, t.priority),
        t.due ? h('span', { class: isOverdue(t) ? 'overdue' : 'muted' }, `${isOverdue(t) ? 'Overdue · ' : 'Due '}${new Date(`${t.due}T00:00:00`).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}`) : null)),
    h('button', { class: 'outline icon-btn', type: 'button', 'aria-label': `Delete "${t.text}"`, onclick: () => removeTask(t.id) }, '×'));
  return el;
}

function finishEdit(t, value) {
  const v = value.trim();
  if (v) t.text = v;
  state.editing = null; save(); render();
}

function reorder(fromId, toId) {
  if (!fromId || fromId === toId) return;
  const from = state.tasks.findIndex((t) => t.id === fromId);
  const [moved] = state.tasks.splice(from, 1);
  state.tasks.splice(state.tasks.findIndex((t) => t.id === toId), 0, moved);
  save(); render();
}

// ---- wiring --------------------------------------------------------------------------------
const form = qs('#task-form');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = form.elements.text.value.trim();
  if (!text) { toast('Write something first.', 'error'); return; }
  addTask(text.slice(0, 120), form.elements.priority.value, form.elements.due.value);
  form.elements.text.value = '';
  form.elements.text.focus();
});
qs('#filters').addEventListener('click', (e) => { if (e.target.dataset.filter) { state.filter = e.target.dataset.filter; render(); } });
qs('#search').addEventListener('input', (e) => { state.query = e.target.value; render(); });
qs('#clear-done').addEventListener('click', () => {
  const removed = state.tasks.filter((t) => t.done), before = [...state.tasks];
  state.tasks = state.tasks.filter((t) => !t.done); save(); render();
  toastUndo(`Cleared ${removed.length} completed`, () => { state.tasks = before; save(); render(); });
});
qs('#sort-prio').addEventListener('click', () => {
  state.tasks.sort((a, b) => PRIORITY[b.priority] - PRIORITY[a.priority] || a.done - b.done); save(); render();
});
render();
