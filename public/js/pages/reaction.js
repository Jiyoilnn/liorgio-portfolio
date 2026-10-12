/**
 * reaction.js — Reaction Game: 5 rounds, average time, personal best and an online leaderboard.
 *
 * Timing uses performance.now() (sub-millisecond, unaffected by clock changes) and starts
 * counting on `pointerdown` rather than `click`, because click fires AFTER you release the
 * button, which would add ~100 ms of unfair delay.
 */
import { api } from '../lib/api.js';
import { h, qs, clear, toast, storage } from '../lib/dom.js';

const ROUNDS = 5;
const box = qs('#game-box');
const state = { phase: 'idle', round: 0, times: [], startAt: 0, timer: 0 };
let best = storage.get('reaction-best', null);

const set = (cls, title, sub = '') => { box.className = `game-box ${cls}`; qs('.gb-title', box).textContent = title; qs('.gb-sub', box).textContent = sub; };

function start() {
  state.round = 0; state.times = [];
  qs('#submit-area').hidden = true;
  nextRound();
}

function nextRound() {
  state.phase = 'waiting';
  set('wait', 'Wait for green…', `Round ${state.round + 1} of ${ROUNDS}`);
  // Random delay: if it was predictable you could just count in your head.
  state.timer = setTimeout(() => { state.phase = 'go'; state.startAt = performance.now(); set('go', 'CLICK!', `Round ${state.round + 1} of ${ROUNDS}`); }, 1400 + Math.random() * 3200);
}

function press() {
  if (state.phase === 'idle' || state.phase === 'done') return start();
  if (state.phase === 'waiting') {
    clearTimeout(state.timer);
    state.phase = 'early';
    return set('early', 'Too soon!', 'Click to retry this round.');
  }
  if (state.phase === 'early') return nextRound();
  if (state.phase === 'between') return nextRound();
  if (state.phase === 'go') {
    const ms = Math.round(performance.now() - state.startAt);
    state.times.push(ms); state.round++;
    renderTimes();
    if (state.round < ROUNDS) { state.phase = 'between'; return set('between', `${ms} ms`, 'Click to continue'); }
    finish();
  }
}

function finish() {
  state.phase = 'done';
  const avg = Math.round(state.times.reduce((a, b) => a + b, 0) / ROUNDS);
  const isBest = best == null || avg < best;
  if (isBest) { best = avg; storage.set('reaction-best', best); }
  set('done', `${avg} ms average`, `${isBest ? 'New personal best! ' : ''}${rating(avg)} Click to play again.`);
  renderBest();
  qs('#submit-area').hidden = false;
  qs('#submit-area').dataset.score = avg;
}

const rating = (ms) => (ms < 200 ? 'Elite reflexes.' : ms < 250 ? 'Lightning fast.' : ms < 320 ? 'Nice reflexes.' : 'Keep practising.');

function renderTimes() {
  clear(qs('#times')).append(...Array.from({ length: ROUNDS }, (_, i) => h('li', { class: state.times[i] != null ? 'filled' : '' }, state.times[i] != null ? `${state.times[i]} ms` : '—')));
}
function renderBest() { qs('#best').textContent = best == null ? '—' : `${best} ms`; }

async function loadBoard() {
  try {
    const { scores } = await api.get('scores/reaction');
    clear(qs('#board')).append(...(scores.length ? scores.map((s, i) => h('li', {}, h('span', { class: 'rank' }, i + 1), h('span', { class: 'who' }, s.name), h('strong', {}, `${s.score} ms`)))
      : [h('li', { class: 'muted' }, 'No scores yet. Be the first!')]));
  } catch { clear(qs('#board')).append(h('li', { class: 'muted' }, 'Leaderboard unavailable.')); }
}

qs('#submit-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const score = Number(qs('#submit-area').dataset.score);
  try {
    const { rank } = await api.post('scores/reaction', { name: e.target.elements.name.value, score });
    toast(`You're #${rank} on the leaderboard!`, 'success');
    qs('#submit-area').hidden = true;
    loadBoard();
  } catch (err) { toast(err.message, 'error'); }
});

// pointerdown for speed; keyboard (Space / Enter) so the game is playable without a mouse.
box.addEventListener('pointerdown', (e) => { e.preventDefault(); press(); });
box.addEventListener('keydown', (e) => { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) { e.preventDefault(); press(); } });
set('idle', 'Click to start', `${ROUNDS} rounds · wait for green, then click as fast as you can`);
renderTimes(); renderBest(); loadBoard();
