/**
 * hero.js — the 3D portrait hero.
 *
 *  1. Pointer parallax: we write --px / --py (-1..1) on the stage; CSS moves every layer by
 *     its own depth (--d), so near things move more than far things = depth.
 *  2. A background particle field + orbit rings drawn by our mini canvas engine.
 *  3. The big screen behind the portrait shows a real generated dashboard mockup.
 * On touch devices / reduced motion the parallax is skipped (layers stay composed).
 */
import { Scene, ring, v3, runLoop } from '../lib/engine3d.js';
import { mockup } from '../components/mockup.js';
import { byId } from '../data/projects.js';

export function initHero() {
  const stage = document.getElementById('hero-stage');
  if (!stage) return;

  // the screen behind the portrait: reuse the Analytics project preview
  const p = byId('business-analytics');
  document.getElementById('hero-screen')?.append(mockup({ ...p.preview, brand: 'Studio', headline: 'Product overview' }, 'hero', { label: 'A dashboard interface floating behind the portrait' }));

  requestAnimationFrame(() => document.body.classList.add('is-loaded'));
  setTimeout(() => document.querySelector('.hero-title')?.classList.add('done'), 1400);

  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (fine && !reduced) {
    let frame = 0;
    addEventListener('pointermove', (e) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const r = stage.getBoundingClientRect();
        if (r.bottom < 0) return; // hero scrolled away: skip the work
        const px = ((e.clientX - (r.left + r.width / 2)) / innerWidth) * 2;
        const py = ((e.clientY - (r.top + r.height / 2)) / innerHeight) * 2;
        stage.style.setProperty('--px', Math.max(-1, Math.min(1, px)).toFixed(3));
        stage.style.setProperty('--py', Math.max(-1, Math.min(1, py)).toFixed(3));
      });
    }, { passive: true });
  }

  initScene(document.getElementById('hero-scene'), reduced);
}

function initScene(canvas, reduced) {
  if (!canvas) return;
  const scene = new Scene(canvas, { distance: 9, focal: 0.9 });
  const a = scene.add({ mesh: ring(4.2, 96), wire: 'rgba(255, 212, 0, .18)', rot: v3(1.25, 0, 0.18), pos: v3(1.6, 0.2, 0) });
  const b = scene.add({ mesh: ring(5.6, 96), wire: 'rgba(255, 255, 255, .08)', rot: v3(1.1, 0, -0.3), pos: v3(1.6, 0, 0) });
  for (let i = 0; i < 220; i++) {
    const u = Math.random() * 2 - 1, ang = Math.random() * Math.PI * 2, rad = 3 + Math.random() * 6;
    const k = Math.sqrt(1 - u * u);
    scene.points.push({ pos: v3(Math.cos(ang) * k * rad + 1.5, u * rad * 0.7, Math.sin(ang) * k * rad), size: 0.6 + Math.random() * 1.4, color: Math.random() < 0.3 ? '#ffd400' : '#ffffff' });
  }
  let last = 0;
  runLoop(canvas, (t) => {
    const dt = last ? Math.min(t - last, 50) : 16; last = t;
    scene.rotation.y += dt * 0.00004;
    a.rot.y += dt * 0.00012; b.rot.y -= dt * 0.00008;
    scene.render();
  });
  if (reduced) scene.render();
}
