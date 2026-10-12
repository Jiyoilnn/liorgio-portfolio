/**
 * tilt.js — the CSS-3D "card follows your cursor" effect.
 *
 * HOW IT WORKS
 *   1. The parent gets `perspective` (done in CSS) — that's what makes tilting look 3D.
 *   2. On pointer move we turn the cursor position inside the card into two angles
 *      (rotateX / rotateY) and set them as CSS custom properties.
 *   3. A radial-gradient "glare" follows the cursor via --mx / --my.
 *   4. requestAnimationFrame batches the updates so we never touch the DOM more than once per frame.
 *
 * Usage: <article class="card" data-tilt> … </article>
 */
const MAX_DEG = 9;

export function initTilt(root = document) {
  // No hover (touch screens) or "reduce motion" => skip the effect entirely.
  if (!matchMedia('(hover: hover)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  root.querySelectorAll('[data-tilt]:not([data-tilt-ready])').forEach(bind);
}

function bind(card) {
  card.dataset.tiltReady = '';
  let frame = 0;

  card.addEventListener('pointermove', (e) => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;   // 0..1 across the card
      const py = (e.clientY - r.top) / r.height;   // 0..1 down the card
      card.style.setProperty('--ry', `${(px - 0.5) * 2 * MAX_DEG}deg`);
      card.style.setProperty('--rx', `${(0.5 - py) * 2 * MAX_DEG}deg`);
      card.style.setProperty('--mx', `${px * 100}%`);
      card.style.setProperty('--my', `${py * 100}%`);
    });
  });

  card.addEventListener('pointerleave', () => {
    cancelAnimationFrame(frame);
    card.style.setProperty('--rx', '0deg');
    card.style.setProperty('--ry', '0deg');
  });
}
