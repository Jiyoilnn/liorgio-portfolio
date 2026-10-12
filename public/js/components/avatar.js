/**
 * avatar.js — an animated, anime-style 3D avatar of Liorgio, drawn entirely in SVG.
 *
 * Inspired by the real photo: curly, voluminous dark-brown hair with lighter tips,
 * warm tan skin, thick brows, dark eyes and a black crewneck.
 *
 * How the "3D" works (no 3D library):
 *  - The whole figure tilts with CSS perspective (rotateX / rotateY from the pointer).
 *  - Inside the head, each layer (back hair, face, eyes, brows, fringe) shifts by a
 *    different amount — near layers move more — so the face seems to turn in space.
 *  - Idle life: breathing, blinking, swaying curls. Click = smile + wave hello.
 * With "reduce motion" on, the avatar stays still.
 */
import { s } from '../lib/charts.js';

const C = {
  skin: '#c68a5c', skinShade: '#a46a42', skinLight: '#e0a97e',
  hairDark: '#2a1b12', hair: '#3f2a1c', hairMid: '#4c3322', hairHi: '#8c6643', hairTip: '#c9a06c',
  sweater: '#1b1c20', sweaterShade: '#0f1013', sweaterHi: '#2c2e35',
  iris: '#3a2214', iris2: '#7a4a2a', line: '#1a0f0a', lip: '#8a4a36',
};

/** deterministic random so the hairstyle is always the same */
function rng(seed = 7) { return () => ((seed = (seed * 16807) % 2147483647) / 2147483647); }

/** one curl: a filled blob, a darker inner shadow and a light highlight arc */
function curl(cx, cy, r, tone, hi, start = 200) {
  const a0 = (start * Math.PI) / 180, a1 = ((start + 150) * Math.PI) / 180, rr = r * 0.6;
  const p = (a, k = 1) => `${(cx + Math.cos(a) * rr * k).toFixed(1)} ${(cy + Math.sin(a) * rr * k).toFixed(1)}`;
  return s('g', { class: 'av-curl', style: `--d:${((cx * 7 + cy) % 13) * -0.27}s` },
    s('circle', { cx, cy, r, fill: tone }),
    // a highlight that spirals inward = reads as a ringlet, not a ball
    s('path', { d: `M${p(a0)} A${rr} ${rr} 0 0 1 ${p(a1)}`, stroke: hi, 'stroke-width': Math.max(1.6, r * 0.13), 'stroke-linecap': 'round', fill: 'none', opacity: 0.75 }));
}

function eye(cx, mirror = false) {
  const m = (x) => (mirror ? 400 - x : x);
  const id = `eyeclip-${mirror ? 'r' : 'l'}`;
  const white = `M${m(154)} 240 Q${m(160)} 225 ${m(174)} 224 Q${m(187)} 225 ${m(192)} 236 Q${m(185)} 249 ${m(172)} 250 Q${m(160)} 249 ${m(154)} 240 Z`;
  return s('g', { class: 'av-eye' },
    s('clipPath', { id }, s('path', { d: white })),
    s('path', { d: white, fill: '#fbf7f2' }),
    s('g', { 'clip-path': `url(#${id})` },
      s('g', { class: 'av-pupil' },
        s('circle', { cx, cy: 238, r: 10.5, fill: 'url(#av-iris)' }),
        s('circle', { cx, cy: 238, r: 5, fill: '#0e0806' }),
        s('circle', { cx: cx - 3.5, cy: 233.5, r: 3.2, fill: '#fff' }),
        s('circle', { cx: cx + 3.5, cy: 242.5, r: 1.5, fill: '#fff', opacity: 0.85 })),
      s('path', { d: white, fill: 'none', stroke: 'rgba(0,0,0,.12)', 'stroke-width': 6 })), // soft lid shadow
    // thick upper lash line + a little flick at the outer corner (anime style)
    s('path', { d: `M${m(193)} 234 Q${m(188)} 222 ${m(174)} 221 Q${m(158)} 221 ${m(151)} 238 L${m(145)} 234`, fill: 'none', stroke: C.line, 'stroke-width': 4.2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }),
    s('path', { d: `M${m(160)} 250 Q${m(172)} 254 ${m(186)} 248`, fill: 'none', stroke: C.skinShade, 'stroke-width': 1.6, 'stroke-linecap': 'round', opacity: 0.8 }));
}

function buildSvg() {
  const r = rng(11);
  // 1) the hair MASS: a solid silhouette with a bumpy (curly) outline
  const outline = [];
  for (let i = 0; i <= 22; i++) {
    const ang = Math.PI * (0.98 + (i / 22) * 1.04);
    outline.push(s('circle', { cx: +(200 + Math.cos(ang) * 94).toFixed(1), cy: +(160 + Math.sin(ang) * 80).toFixed(1), r: 18 + r() * 7, fill: i % 2 ? C.hair : C.hairMid, stroke: 'rgba(255,212,0,.18)', 'stroke-width': 1.2 }));
  }
  const mass = s('path', { d: 'M118 205 C96 150 120 78 200 76 C280 78 304 150 282 205 Q200 168 118 205 Z', fill: C.hair });
  // 2) texture: many small ringlets over the top, lighter toward the tips
  const texture = [];
  for (let i = 0; i < 34; i++) {
    const ang = Math.PI * (1.02 + r() * 0.96), dist = 20 + r() * 66;
    const cx = 200 + Math.cos(ang) * dist * 1.22, cy = 158 + Math.sin(ang) * dist * 0.92;
    texture.push(curl(+cx.toFixed(1), +cy.toFixed(1), 10 + r() * 7, i % 3 ? C.hairMid : C.hair, i % 2 ? C.hairTip : C.hairHi, 180 + r() * 90));
  }
  // 3) fringe: small ringlets falling over the forehead (the closest, most "3D" layer)
  const fringe = [];
  const fx = [148, 162, 176, 190, 204, 218, 232, 246, 155, 183, 211, 239];
  const fy = [186, 192, 186, 194, 188, 194, 187, 182, 174, 176, 176, 172];
  fx.forEach((x, i) => fringe.push(curl(x, fy[i], 10 + r() * 4, i < 8 ? C.hairMid : C.hair, i % 2 ? C.hairTip : C.hairHi, 160 + r() * 80)));
  const backCurls = [outline, mass];
  const crown = texture;

  return s('svg', { viewBox: '0 0 400 480', class: 'av-svg', role: 'img', 'aria-label': 'Animated anime-style avatar of Liorgio with curly hair and a black crewneck' },
    s('defs', {},
      s('radialGradient', { id: 'av-skin', cx: '45%', cy: '40%', r: '70%' }, s('stop', { offset: '0%', 'stop-color': C.skinLight }), s('stop', { offset: '60%', 'stop-color': C.skin }), s('stop', { offset: '100%', 'stop-color': C.skinShade })),
      s('linearGradient', { id: 'av-iris', x1: 0, y1: 0, x2: 0, y2: 1 }, s('stop', { offset: '0%', 'stop-color': C.iris }), s('stop', { offset: '100%', 'stop-color': C.iris2 })),
      s('linearGradient', { id: 'av-sweater', x1: 0, y1: 0, x2: 1, y2: 1 }, s('stop', { offset: '0%', 'stop-color': C.sweaterHi }), s('stop', { offset: '55%', 'stop-color': C.sweater }), s('stop', { offset: '100%', 'stop-color': C.sweaterShade })),
      s('radialGradient', { id: 'av-rim', cx: '50%', cy: '50%', r: '50%' }, s('stop', { offset: '0%', 'stop-color': 'rgba(255,212,0,.35)' }), s('stop', { offset: '100%', 'stop-color': 'rgba(255,212,0,0)' }))),

    s('ellipse', { cx: 200, cy: 210, rx: 170, ry: 170, fill: 'url(#av-rim)', class: 'av-aura' }),

    s('g', { class: 'av-breathe' },
      // ---- body
      s('g', { class: 'av-body', transform: 'translate(0 -26)' },
        s('path', { d: 'M170 288 L168 362 Q200 380 232 362 L230 288 Z', fill: C.skinShade }),
        s('path', { d: 'M170 300 Q200 330 230 300 L230 318 Q200 340 170 318 Z', fill: '#8a5636', opacity: 0.45 }),
        s('path', { d: 'M30 506 C36 418 78 390 150 370 Q200 394 250 370 C322 390 364 418 370 506 Z', fill: 'url(#av-sweater)' }),
        s('path', { d: 'M150 370 Q200 400 250 370 Q246 356 238 354 Q200 380 162 354 Q154 356 150 370 Z', fill: C.sweaterShade }),
        s('path', { d: 'M156 362 Q200 390 244 362', fill: 'none', stroke: C.sweaterHi, 'stroke-width': 1.5, opacity: 0.6 }),
        s('path', { d: 'M90 410 Q110 440 104 506 M310 410 Q290 440 296 506', fill: 'none', stroke: C.sweaterShade, 'stroke-width': 3, opacity: 0.8 }),
        s('circle', { cx: 262, cy: 428, r: 10, fill: '#ffd400', class: 'av-emblem' }),
        s('path', { d: 'M259 422 V433 H266', fill: 'none', stroke: '#0a0a08', 'stroke-width': 2.4, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' })),

      // ---- head (JS rotates this group; its children move by different depths)
      s('g', { transform: 'translate(200 300) scale(1.13) translate(-200 -300)' }, s('g', { class: 'av-head', id: 'av-head' },
        s('g', { 'data-depth': 1.5 }, backCurls,
          s('path', { d: 'M134 170 Q130 205 140 228 L150 226 Q144 200 150 176 Z M266 170 Q270 205 260 228 L250 226 Q256 200 250 176 Z', fill: C.hairDark })),
        s('g', { 'data-depth': 3 },
          s('ellipse', { cx: 133, cy: 240, rx: 11, ry: 17, fill: C.skinShade }), s('ellipse', { cx: 267, cy: 240, rx: 11, ry: 17, fill: C.skinShade }),
          s('path', { d: 'M135 180 C131 252 158 306 200 321 C242 306 269 252 265 180 C258 140 142 140 135 180 Z', fill: 'url(#av-skin)' }),
          s('path', { d: 'M150 290 Q200 330 250 290 Q236 312 200 320 Q164 312 150 290 Z', fill: C.skinShade, opacity: 0.35 }), // jaw shadow
          s('ellipse', { cx: 158, cy: 268, rx: 13, ry: 6, fill: '#e2735f', class: 'av-blush' }), s('ellipse', { cx: 242, cy: 268, rx: 13, ry: 6, fill: '#e2735f', class: 'av-blush' }),
          s('path', { d: 'M201 252 Q196 266 202 272 Q206 273 209 270', fill: 'none', stroke: C.skinShade, 'stroke-width': 2.4, 'stroke-linecap': 'round' }),
          s('path', { class: 'av-mouth-neutral', d: 'M187 290 Q200 294 213 289', fill: 'none', stroke: C.lip, 'stroke-width': 3, 'stroke-linecap': 'round' }),
          s('path', { class: 'av-mouth-smile', d: 'M184 285 Q200 302 216 285 Q200 292 184 285 Z', fill: '#6b2a20', stroke: C.lip, 'stroke-width': 2, 'stroke-linejoin': 'round' })),
        s('g', { 'data-depth': 5, class: 'av-eyes' }, eye(172), eye(228, true)),
        s('g', { 'data-depth': 5.5, class: 'av-brows' },
          s('path', { d: 'M152 212 Q170 202 192 208', fill: 'none', stroke: C.line, 'stroke-width': 6.5, 'stroke-linecap': 'round' }),
          s('path', { d: 'M248 212 Q230 202 208 208', fill: 'none', stroke: C.line, 'stroke-width': 6.5, 'stroke-linecap': 'round' })),
        s('g', { 'data-depth': 7, class: 'av-hairtop' }, crown, fringe)))),

    // a waving hand that appears on click
    s('g', { class: 'av-wave' },
      s('path', { d: 'M318 300 q-6 -34 8 -40 q8 -2 9 10 l2 -26 q2 -10 10 -8 q7 2 6 12 l1 -6 q2 -9 10 -7 q7 2 6 12 l-1 8 q3 -8 9 -6 q7 3 4 14 l-8 38 q-6 22 -30 22 q-22 0 -26 -23 Z', fill: C.skin, stroke: C.skinShade, 'stroke-width': 2 }),
      s('path', { d: 'M300 360 Q310 330 322 318 L346 330 Q336 350 330 372 Z', fill: 'url(#av-sweater)' })));
}

/** Mount the avatar into `host` and wire up the motion. */
export function mountAvatar(host) {
  if (!host) return;
  const svg = buildSvg();
  const bubble = Object.assign(document.createElement('div'), { className: 'av-bubble', textContent: "Hi, I'm Liorgio! 👋" });
  bubble.setAttribute('aria-hidden', 'true');
  host.append(svg, bubble);

  const head = svg.querySelector('#av-head');
  const layers = [...head.querySelectorAll('[data-depth]')];
  const pupils = [...svg.querySelectorAll('.av-pupil')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const target = { x: 0, y: 0 }, cur = { x: 0, y: 0 };
  let lastPointer = 0, raf = 0, visible = false;

  addEventListener('pointermove', (e) => {
    const r = host.getBoundingClientRect();
    target.x = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (innerWidth / 2)));
    target.y = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height * 0.4)) / (innerHeight / 2)));
    lastPointer = performance.now();
  }, { passive: true });

  function frame(t) {
    raf = 0;
    if (!visible) return;
    // no pointer for 3s (or a touch device): look around on its own
    if (performance.now() - lastPointer > 3000) { target.x = Math.sin(t / 2100) * 0.6; target.y = Math.sin(t / 2900) * 0.3; }
    cur.x += (target.x - cur.x) * 0.08;
    cur.y += (target.y - cur.y) * 0.08;
    host.style.setProperty('--ax', cur.x.toFixed(3));
    host.style.setProperty('--ay', cur.y.toFixed(3));
    head.setAttribute('transform', `translate(${(cur.x * 7).toFixed(2)} ${(cur.y * 5).toFixed(2)}) rotate(${(cur.x * 5).toFixed(2)} 200 300)`);
    for (const l of layers) {
      const d = Number(l.dataset.depth);
      l.setAttribute('transform', `translate(${(cur.x * d).toFixed(2)} ${(cur.y * d * 0.7).toFixed(2)})`);
    }
    for (const p of pupils) p.setAttribute('transform', `translate(${(cur.x * 4.5).toFixed(2)} ${(cur.y * 3).toFixed(2)})`);
    raf = requestAnimationFrame(frame);
  }

  if (!reduced) {
    new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !raf) raf = requestAnimationFrame(frame);
    }).observe(host);
  } else {
    host.classList.add('still');
  }

  // click / tap / Enter: smile, wave and say hi
  const hello = () => {
    host.classList.remove('is-happy'); void host.offsetWidth; // restart the animation
    host.classList.add('is-happy');
    dispatchEvent(new CustomEvent('ui-sound', { detail: 'hello' }));
    clearTimeout(host._t);
    host._t = setTimeout(() => host.classList.remove('is-happy'), 2600);
  };
  host.addEventListener('click', hello);
  host.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); hello(); } });
}
