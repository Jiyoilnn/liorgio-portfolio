/**
 * fries3d.js — a 3D carton of fries made from boxes, using the mini engine.
 *
 * Drawing order trick: the carton is ONE object but its faces go to different layers:
 *   inner (back) walls  -> layer 2   (drawn first)
 *   the fries           -> layer 2.5 (drawn on top of the inner walls)
 *   outer (front) walls -> layer 3   (drawn last, so they hide the bottom of the fries)
 */
import { Scene, boxMesh, taperedTub, v3, runLoop } from './engine3d.js';

export function mountFries(canvas) {
  const scene = new Scene(canvas, { distance: 5.6, focal: 0.92 });
  scene.rotation.x = 0.3; // positive = the top of the carton tips toward the camera, so we look down into it

  scene.add({ mesh: taperedTub(1.6, 2.3, 1.7), fill: '#d8322b', inner: '#6e1410', pos: v3(0, -0.45, 0), layer: 3 });

  // Seeded pseudo-random so the fries look the same on every visit.
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const fries = [];
  for (let i = 0; i < 46; i++) {
    const h = 1.7 + rnd() * 1.1;
    const x = (rnd() - 0.5) * 1.5, z = (rnd() - 0.5) * 1.5;
    const o = scene.add({
      mesh: boxMesh(0.17, h, 0.17), fill: i % 5 === 0 ? '#ffd45a' : '#ffec9a',
      pos: v3(x, -1 + h / 2 + 0.05, z), rot: v3((rnd() - 0.5) * 0.35, rnd() * 3, (rnd() - 0.5) * 0.35), layer: 2.5,
    });
    fries.push({ o, baseY: o.pos.y, phase: rnd() * 6 });
  }

  // little sparkles that float upward
  const sparks = Array.from({ length: 28 }, () => ({ pos: v3((rnd() - 0.5) * 3, rnd() * 3 - 0.5, (rnd() - 0.5) * 3), size: 1 + rnd() * 1.5, color: '#ffd400', speed: 0.0003 + rnd() * 0.0005 }));
  scene.points.push(...sparks);

  const mouse = { x: 0.5, tx: 0.5 };
  canvas.parentElement.addEventListener('pointermove', (e) => {
    const r = canvas.getBoundingClientRect();
    mouse.tx = (e.clientX - r.left) / r.width;
  });

  let bounce = 0, last = 0, spin = 0.5;
  runLoop(canvas, (t) => {
    const dt = last ? Math.min(t - last, 50) : 16; last = t;
    mouse.x += (mouse.tx - mouse.x) * 0.05;
    spin += dt * 0.0004;
    scene.rotation.y = spin + (mouse.x - 0.5) * 0.9;
    bounce *= 0.9;                                   // impulse decays: simple spring-less animation
    scene.offset.y = Math.sin(t * 0.0012) * 0.07 + bounce;
    // fries sway slightly out of sync -> feels alive
    for (const f of fries) f.o.pos.y = f.baseY + Math.sin(t * 0.002 + f.phase) * 0.02 + bounce * 0.4;
    for (const s of sparks) { s.pos.y += dt * s.speed * 3; if (s.pos.y > 2.6) s.pos.y = -0.8; }
    scene.render();
  });

  return { bump: () => { bounce = 0.35; } };
}
