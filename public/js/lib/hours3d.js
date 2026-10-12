/**
 * hours3d.js — "orders by hour of day" as a 3D bar chart, using the mini engine.
 * Move the mouse over it to look at the bars from different angles.
 */
import { Scene, boxMesh, v3, runLoop } from './engine3d.js';

export function mountHours3D(canvas) {
  const scene = new Scene(canvas, { distance: 8, focal: 1.45 });
  scene.rotation.x = 0.42;
  const mouse = { x: 0.5, tx: 0.5 };
  canvas.addEventListener('pointermove', (e) => { const r = canvas.getBoundingClientRect(); mouse.tx = (e.clientX - r.left) / r.width; });
  canvas.addEventListener('pointerleave', () => { mouse.tx = 0.5; });
  runLoop(canvas, () => {
    mouse.x += (mouse.tx - mouse.x) * 0.08;
    scene.rotation.y = (mouse.x - 0.5) * 0.7;
    scene.render();
  });

  return {
    /** @param {number[]} hours 24 counts */
    update(hours) {
      const max = Math.max(...hours, 1);
      scene.objects.length = 0;
      hours.forEach((n, i) => {
        const ratio = n / max;
        const height = Math.max(0.05, ratio * 2.6);
        // brighter yellow = busier hour
        const g = Math.round(150 + ratio * 62), b = Math.round(ratio * 10);
        scene.add({ mesh: boxMesh(0.32, height, 0.9), fill: `#${[255, g, b].map((n2) => n2.toString(16).padStart(2, '0')).join('')}`, pos: v3((i - 11.5) * 0.5, height / 2 - 1.3, 0) });
      });
      scene.render(); // paint immediately: the loop may be paused while the chart is off-screen
    },
  };
}
