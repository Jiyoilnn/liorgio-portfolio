/**
 * icons.js — a tiny set of line icons (24×24, stroke-based) built as real SVG elements.
 */
import { s } from '../lib/charts.js';

const PATHS = {
  ui: ['M3 5h18v14H3z', 'M3 9h18', 'M7 13h5', 'M7 16h8'],
  ux: ['M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18', 'M8 14s1.5 2 4 2s4-2 4-2', 'M9 9h.01', 'M15 9h.01'],
  resp: ['M2 6h13v10H2z', 'M17 8h5v12h-5z', 'M6 20h5'],
  sys: ['M4 4h7v7H4z', 'M13 4h7v7h-7z', 'M4 13h7v7H4z', 'M16.5 13v7', 'M13 16.5h7'],
  wire: ['M3 3h18v18H3z', 'M3 9h18', 'M9 9v12'],
  fe: ['M8 8l-4 4l4 4', 'M16 8l4 4l-4 4', 'M14 5l-4 14'],
  be: ['M4 5h16v5H4z', 'M4 14h16v5H4z', 'M8 7.5h.01', 'M8 16.5h.01'],
  api: ['M4 12h6', 'M14 12h6', 'M10 9l4 3l-4 3', 'M4 6v12', 'M20 6v12'],
  db: ['M5 6c0-1.7 3.1-3 7-3s7 1.3 7 3s-3.1 3-7 3s-7-1.3-7-3z', 'M5 6v12c0 1.7 3.1 3 7 3s7-1.3 7-3V6', 'M5 12c0 1.7 3.1 3 7 3s7-1.3 7-3'],
  perf: ['M13 2L4 14h7l-1 8l9-12h-7z'],
  a11y: ['M12 4a1.5 1.5 0 1 0 0 3a1.5 1.5 0 1 0 0-3', 'M5 9l7 1l7-1', 'M12 10v5', 'M9 21l3-6l3 6'],
  git: ['M6 3v12', 'M18 9a3 3 0 1 0 0-6a3 3 0 1 0 0 6', 'M6 21a3 3 0 1 0 0-6a3 3 0 1 0 0 6', 'M18 9c0 6-12 3-12 6'],
};

export function icon(name) {
  return s('svg', { viewBox: '0 0 24 24', 'aria-hidden': 'true' }, (PATHS[name] ?? PATHS.ui).map((d) => s('path', { d })));
}
