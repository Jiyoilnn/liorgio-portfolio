/**
 * garments.js — draws product "photos" as SVG so the store needs no image files.
 * LESSON: SVG is just text describing shapes, so we can generate it from data (colour, kind).
 */
const SHAPES = {
  tee: '<path d="M60 40 L90 30 Q100 46 110 30 L140 40 L176 70 L152 92 L140 82 L140 170 L60 170 L60 82 L48 92 L24 70 Z"/>',
  hoodie: '<path d="M58 52 L85 42 Q100 62 115 42 L142 52 L182 150 L156 158 L142 108 L142 172 L58 172 L58 108 L44 158 L18 150 Z"/><path fill="rgba(0,0,0,.28)" d="M80 44 Q100 8 120 44 Q100 68 80 44 Z"/><path fill="none" stroke="rgba(255,255,255,.2)" d="M78 132 H122 L116 154 H84 Z"/>',
  pants: '<path d="M62 24 H138 L150 182 H108 L100 82 L92 182 H50 Z"/><path fill="none" stroke="rgba(255,255,255,.2)" d="M62 44 H138"/>',
  cap: '<path d="M40 122 Q40 58 100 58 Q160 58 160 122 Z"/><path fill="rgba(0,0,0,.3)" d="M150 118 Q192 120 188 136 Q160 140 118 128 Z"/><circle cx="100" cy="58" r="4" fill="rgba(255,255,255,.35)"/>',
  beanie: '<path d="M46 122 Q46 50 100 50 Q154 50 154 122 Z"/><path fill="rgba(0,0,0,.28)" d="M42 120 H158 V148 H42 Z"/><circle cx="100" cy="42" r="10" fill="rgba(255,255,255,.35)"/>',
  bag: '<path d="M50 72 H150 L158 176 H42 Z"/><path fill="none" stroke="rgba(255,255,255,.4)" stroke-width="5" d="M76 72 Q76 28 100 28 Q124 28 124 72"/>',
};

/** @returns {string} trusted SVG markup (colour is validated so nothing can be injected through it) */
export function garmentSvg(kind, color) {
  const fill = /^#[0-9a-f]{6}$/i.test(color) ? color : '#444444';
  const shape = SHAPES[kind] ?? SHAPES.tee;
  return `<svg viewBox="0 0 200 200" role="img" aria-hidden="true"><g fill="${fill}" stroke="rgba(255,255,255,.22)" stroke-width="1.5" stroke-linejoin="round">${shape}</g></svg>`;
}
