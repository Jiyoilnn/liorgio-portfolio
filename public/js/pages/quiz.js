/**
 * quiz.js — Web Dev Quiz: 10 random questions, a countdown per question, speed + streak
 * scoring, explanations and an online leaderboard.
 *
 * Score per question (max 100 -> max 1000 total):
 *   50 for a correct answer  +  up to 30 for speed  +  up to 20 for a streak.
 */
import { api } from '../lib/api.js';
import { h, qs, clear, toast } from '../lib/dom.js';

const ROUND = 10, SECONDS = 20;
const root = qs('#quiz');
let bank = [], q = [], i = 0, score = 0, streak = 0, correct = 0, left = SECONDS, tick = 0, locked = false;

/** Fisher–Yates shuffle: the fair way to shuffle (sorting with Math.random() is biased). */
function shuffle(arr) {
  const a = [...arr];
  for (let n = a.length - 1; n > 0; n--) { const k = Math.floor(Math.random() * (n + 1)); [a[n], a[k]] = [a[k], a[n]]; }
  return a;
}

async function init() {
  bank = await (await fetch('data/quiz.json')).json();
  home();
  loadBoard();
}

function home() {
  clear(root).append(
    h('p', { class: 'eyebrow' }, 'Ready?'),
    h('h2', {}, 'Test your web-dev knowledge'),
    h('p', { class: 'muted' }, `${ROUND} random questions · ${SECONDS} seconds each · faster answers and streaks score more (max 1000).`),
    h('button', { type: 'button', onclick: begin }, 'Start quiz →'));
}

function begin() {
  // Shuffle the answers too, and remember where the correct one moved.
  q = shuffle(bank).slice(0, ROUND).map((item) => {
    const order = shuffle(item.a.map((text, idx) => ({ text, ok: idx === item.c })));
    return { ...item, options: order };
  });
  i = 0; score = 0; streak = 0; correct = 0;
  show();
}

function show() {
  locked = false; left = SECONDS;
  const item = q[i];
  clear(root).append(
    h('div', { class: 'quiz-top' }, h('span', { class: 'tag' }, `${item.cat.toUpperCase()} · QUESTION ${i + 1} OF ${ROUND}`), h('span', { class: 'mono', id: 'score' }, `${score} pts${streak > 1 ? ` · 🔥${streak}` : ''}`)),
    h('div', { class: 'timer', role: 'progressbar', 'aria-label': 'Time left', 'aria-valuemin': 0, 'aria-valuemax': SECONDS }, h('div', { id: 'timer-bar' })),
    h('h2', { id: 'question' }, item.q),
    h('div', { class: 'answers', role: 'group', 'aria-labelledby': 'question' }, item.options.map((o, idx) => h('button', { type: 'button', class: 'outline answer', onclick: (e) => choose(idx, e.currentTarget) }, h('kbd', {}, idx + 1), o.text))),
    h('div', { id: 'feedback', class: 'feedback', role: 'status', 'aria-live': 'polite' }));
  clearInterval(tick);
  tick = setInterval(() => {
    left -= 0.1;
    qs('#timer-bar').style.width = `${(left / SECONDS) * 100}%`;
    qs('.timer').setAttribute('aria-valuenow', Math.ceil(left));
    qs('#timer-bar').classList.toggle('low', left < 6);
    if (left <= 0) choose(-1);
  }, 100);
}

function choose(idx, btn) {
  if (locked) return;
  locked = true; clearInterval(tick);
  const item = q[i];
  const ok = idx >= 0 && item.options[idx].ok;
  let gained = 0;
  if (ok) {
    streak++; correct++;
    gained = 50 + Math.round((left / SECONDS) * 30) + Math.min(streak - 1, 4) * 5;
    score += gained;
  } else streak = 0;

  const buttons = [...root.querySelectorAll('.answer')];
  buttons.forEach((b, n) => { b.disabled = true; if (item.options[n].ok) b.classList.add('right'); });
  if (btn && !ok) btn.classList.add('wrong');
  qs('#score').textContent = `${score} pts${streak > 1 ? ` · 🔥${streak}` : ''}`;

  clear(qs('#feedback')).append(
    h('strong', { class: ok ? 'good' : 'bad' }, idx < 0 ? "Time's up!" : ok ? `Correct! +${gained}` : 'Not quite.'), ' ', item.why,
    h('div', {}, h('button', { type: 'button', onclick: () => (++i < ROUND ? show() : results()) }, i + 1 < ROUND ? 'Next question →' : 'See results')));
  qs('#feedback button').focus();
}

function results() {
  clear(root).append(
    h('p', { class: 'eyebrow' }, 'Quiz complete'),
    h('h2', {}, 'You scored ', h('span', { class: 'accent' }, `${score} / ${ROUND * 100}`)),
    h('p', {}, `${correct} of ${ROUND} correct. ${correct === ROUND ? 'Perfect run!' : correct >= 7 ? 'Strong result.' : 'Every developer starts somewhere. Try again!'}`),
    h('form', { class: 'inline', id: 'save', onsubmit: save }, h('input', { name: 'name', placeholder: 'Your name for the leaderboard', maxlength: 20, 'aria-label': 'Your name' }), h('button', { type: 'submit' }, 'Submit score')),
    h('button', { class: 'outline', type: 'button', onclick: begin }, 'Play again'));
}

async function save(e) {
  e.preventDefault();
  try {
    const { rank } = await api.post('scores/quiz', { name: e.target.elements.name.value, score });
    toast(`You're #${rank} on the leaderboard!`, 'success');
    e.target.remove();
    loadBoard();
  } catch (err) { toast(err.message, 'error'); }
}

async function loadBoard() {
  try {
    const { scores } = await api.get('scores/quiz');
    clear(qs('#board')).append(...(scores.length ? scores.map((s, n) => h('li', {}, h('span', { class: 'rank' }, n + 1), h('span', { class: 'who' }, s.name), h('strong', {}, `${s.score}`)))
      : [h('li', { class: 'muted' }, 'No scores yet. Be the first!')]));
  } catch { clear(qs('#board')).append(h('li', { class: 'muted' }, 'Leaderboard unavailable.')); }
}

// keyboard shortcuts: press 1-4 to answer
addEventListener('keydown', (e) => {
  if (locked || !/^[1-4]$/.test(e.key) || e.target.matches('input')) return;
  root.querySelectorAll('.answer')[Number(e.key) - 1]?.click();
});
init();
