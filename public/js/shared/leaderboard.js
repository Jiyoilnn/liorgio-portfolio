/**
 * leaderboard.js — keeps a sorted top-N list per game.
 * `scores` looks like { reaction: [{name, score, at}], quiz: [...] }
 */
import { GAME_RULES } from './validators.js';

const MAX_PER_GAME = 50;

/** Insert an entry, keep only the best MAX_PER_GAME, return the new 1-based rank. MUTATES `scores`. */
export function insertScore(scores, game, entry, now = Date.now()) {
  const rank = rankOf(scores, game, entry.score); // compute BEFORE inserting
  const list = (scores[game] ??= []);
  list.push({ name: entry.name, score: entry.score, at: new Date(now).toISOString() });
  sortScores(game, list);
  list.length = Math.min(list.length, MAX_PER_GAME);
  return rank;
}

export function sortScores(game, list) {
  const asc = GAME_RULES[game].order === 'asc';
  // Ties are broken by who got there first (older `at` wins).
  list.sort((a, b) => (asc ? a.score - b.score : b.score - a.score) || a.at.localeCompare(b.at));
  return list;
}

export function topScores(scores, game, n = 10) {
  return (scores[game] ?? []).slice(0, n);
}

/** 1-based rank a given score would have right now. */
export function rankOf(scores, game, score) {
  const asc = GAME_RULES[game].order === 'asc';
  const better = (scores[game] ?? []).filter((e) => (asc ? e.score < score : e.score > score)).length;
  return better + 1;
}
