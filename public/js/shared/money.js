/**
 * money.js — tiny helpers for working with Philippine pesos.
 *
 * LESSON: never store money as floating point (0.1 + 0.2 !== 0.3 in JS).
 * Every price in this project is a whole-peso INTEGER, so the maths stays exact.
 * If you ever need centavos, store the smallest unit (centavos) as an integer instead.
 */

const formatter = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
  maximumFractionDigits: 0,
});

/** @param {number} amount whole pesos  @returns {string} e.g. "₱1,490" */
export function formatPeso(amount) {
  return formatter.format(amount);
}

/** Compact version for dashboards: 24800 -> "₱24.8k". */
export function formatPesoCompact(amount) {
  if (Math.abs(amount) >= 1_000_000) return `₱${(amount / 1_000_000).toFixed(1)}M`;
  if (Math.abs(amount) >= 1_000) return `₱${(amount / 1_000).toFixed(1)}k`;
  return `₱${amount}`;
}
