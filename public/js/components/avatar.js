/**
 * avatar.js — an animated, anime-style 3D avatar of Liorgio, drawn entirely in SVG.
 *
 * Inspired by the real photo: voluminous dark-brown hair, warm tan skin, thick brows,
 * dark eyes, a strong jaw and a black crewneck.
 *
 * How the "3D" works (no 3D library):
 *  - The whole figure tilts with CSS perspective (rotateX / rotateY from the pointer).
 *  - Inside the head, each layer (back hair, face, eyes, brows, fringe) shifts by a
 *    different amount — near layers move more — so the face seems to turn in space.
 *  - Idle life: breathing, blinking, a little hair movement. Click = smile + say hello.
 * With "reduce motion" on, the avatar stays still.
 */
import { s } from '../lib/charts.js';

const C = {
  skin: '#c4885a', skinShade: '#a0673f', skinLight: '#d99e72', stubble: '#5b3b27',
  hairDark: '#1f140d', hair: '#33231a', hairMid: '#3f2b1e', hairHi: '#7a5638',
  sweater: '#1b1c20', sweaterShade: '#0f1013', sweaterHi: '#2c2e35',
  iris: '#2e1b10', iris2: '#5e3a22', line: '#1a0f0a', lip: '#7a4330',
};

/** A simple almond eye: no lashes/flicks, so it reads as an ordinary male face. */
function eye(cx, mirror = false) {
  const m = (x) => (mirror ? 400 - x : x);
  const id = `eyeclip-${mirror ? 'r' : 'l'}`;
  const white = `M${m(157)} 240 Q${m(164)} 230 ${m(174)} 230 Q${m(184)} 230 ${m(190)} 238 Q${m(183)} 247 ${m(173)} 247 Q${m(163)} 247 ${m(157)} 240 Z`;
  return s('g', { class: 'av-eye' },
    s('clipPath', { id }, s('path', { d: white })),
    s('path', { d: white, fill: '#f6f1ea' }),
    s('g', { 'clip-path': `url(#${id})` },
      s('g', { class: 'av-pupil' },
        s('circle', { cx, cy: 238.5, r: 7.5, fill: 'url(#av-iris)' }),
        s('circle', { cx, cy: 238.5, r: 3.6, fill: '#0e0806' }),
        s('circle', { cx: cx - 2.5, cy: 235.5, r: 1.8, fill: '#fff' }))),
    // upper lid line only, fairly thin
    s('path', { d: `M${m(156)} 240 Q${m(164)} 228 ${m(174)} 228 Q${m(185)} 228 ${m(191)} 237`, fill: 'none', stroke: C.line, 'stroke-width': 2.6, 'stroke-linecap': 'round' }),
    s('path', { d: `M${m(160)} 250 Q${m(174)} 254 ${m(187)} 248`, fill: 'none', stroke: C.skinShade, 'stroke-width': 1.4, 'stroke-linecap': 'round', opacity: 0.7 }));
}

function buildSvg() {
  // ---- HAIR (no curls): a textured men's crop — short sides, volume on top,
  // chunky locks falling forward over the forehead, a few strand highlights.
  const backHair = s('path', { d: 'M126 210 C112 150 126 86 200 80 C274 86 288 150 274 210 Z', fill: C.hairDark });
  const sides = s('path', { d: 'M131 176 Q128 206 136 230 L146 228 Q141 204 146 182 Z M269 176 Q272 206 264 230 L254 228 Q259 204 254 182 Z', fill: C.hairDark, opacity: 0.9 });
  const top = s('path', {
    d: 'M128 206 C116 160 126 110 162 94 C180 80 212 76 230 86 C254 88 272 106 276 132 C282 158 280 186 272 206'
      + ' Q262 196 250 200 Q232 206 214 198 Q196 192 182 200 Q164 196 150 202 Q138 198 128 206 Z',
    fill: C.hair,
  });
  // the top gets a lighter "lift" so the volume reads in 3D
  const volume = s('path', { d: 'M152 112 C166 90 200 82 228 88 C252 92 268 108 270 128 C252 112 228 106 204 108 C184 109 166 114 152 126 Z', fill: C.hairMid });
  // a fringe swept to the side (one big lock), instead of curls
  const fringe = s('g', { class: 'av-fringe' },
    s('path', { d: 'M146 176 C170 150 214 150 254 198 C236 186 214 182 196 188 C180 194 162 192 146 176 Z', fill: C.hairMid }),
    s('path', { d: 'M160 172 Q200 160 236 186', fill: 'none', stroke: C.hairHi, 'stroke-width': 2.4, 'stroke-linecap': 'round', opacity: 0.8 }));
  // strand highlights follow the sweep direction (left-top to right)
  const strands = s('g', { class: 'av-strands', fill: 'none', stroke: C.hairHi, 'stroke-width': 2.6, 'stroke-linecap': 'round', opacity: 0.7 },
    s('path', { d: 'M168 116 Q200 102 236 112' }), s('path', { d: 'M152 146 Q186 128 226 136' }),
    s('path', { d: 'M200 128 Q234 122 262 140' }), s('path', { d: 'M232 106 Q254 112 266 130' }));

  return s('svg', { viewBox: '0 0 400 480', class: 'av-svg', role: 'img', 'aria-label': 'Animated avatar of Liorgio with a textured haircut and a black crewneck' },
    s('defs', {},
      s('radialGradient', { id: 'av-skin', cx: '45%', cy: '40%', r: '70%' }, s('stop', { offset: '0%', 'stop-color': C.skinLight }), s('stop', { offset: '62%', 'stop-color': C.skin }), s('stop', { offset: '100%', 'stop-color': C.skinShade })),
      s('linearGradient', { id: 'av-iris', x1: 0, y1: 0, x2: 0, y2: 1 }, s('stop', { offset: '0%', 'stop-color': C.iris }), s('stop', { offset: '100%', 'stop-color': C.iris2 })),
      s('linearGradient', { id: 'av-sweater', x1: 0, y1: 0, x2: 1, y2: 1 }, s('stop', { offset: '0%', 'stop-color': C.sweaterHi }), s('stop', { offset: '55%', 'stop-color': C.sweater }), s('stop', { offset: '100%', 'stop-color': C.sweaterShade })),
      s('radialGradient', { id: 'av-rim', cx: '50%', cy: '50%', r: '50%' }, s('stop', { offset: '0%', 'stop-color': 'rgba(255,212,0,.32)' }), s('stop', { offset: '100%', 'stop-color': 'rgba(255,212,0,0)' }))),

    s('ellipse', { cx: 200, cy: 210, rx: 170, ry: 170, fill: 'url(#av-rim)', class: 'av-aura' }),

    s('g', { class: 'av-breathe' },
      // ---- body: broad shoulders, thick neck
      s('g', { class: 'av-body', transform: 'translate(0 -26)' },
        s('path', { d: 'M164 286 L162 362 Q200 382 238 362 L236 286 Z', fill: C.skinShade }),
        s('path', { d: 'M164 300 Q200 334 236 300 L236 320 Q200 346 164 320 Z', fill: '#7e4c2e', opacity: 0.45 }),
        s('path', { d: 'M18 506 C22 420 70 388 150 368 Q200 394 250 368 C330 388 378 420 382 506 Z', fill: 'url(#av-sweater)' }),
        s('path', { d: 'M148 368 Q200 402 252 368 Q248 354 240 352 Q200 380 160 352 Q152 354 148 368 Z', fill: C.sweaterShade }),
        s('path', { d: 'M154 360 Q200 390 246 360', fill: 'none', stroke: C.sweaterHi, 'stroke-width': 1.5, opacity: 0.6 }),
        s('path', { d: 'M84 410 Q104 440 98 506 M316 410 Q296 440 302 506', fill: 'none', stroke: C.sweaterShade, 'stroke-width': 3, opacity: 0.8 }),
        s('circle', { cx: 264, cy: 428, r: 10, fill: '#ffd400', class: 'av-emblem' }),
        s('path', { d: 'M261 422 V433 H268', fill: 'none', stroke: '#0a0a08', 'stroke-width': 2.4, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' })),

      // ---- head (JS rotates this group; its children move by different depths)
      s('g', { transform: 'translate(200 300) scale(1.1) translate(-200 -300)' }, s('g', { class: 'av-head', id: 'av-head' },
        s('g', { 'data-depth': 1.5 }, backHair),
        s('g', { 'data-depth': 3 },
          s('ellipse', { cx: 133, cy: 242, rx: 11, ry: 17, fill: C.skinShade }), s('ellipse', { cx: 267, cy: 242, rx: 11, ry: 17, fill: C.skinShade }),
          s('path', { d: 'M135 182 C133 244 144 286 170 310 Q200 328 230 310 C256 286 267 244 265 182 C258 140 142 140 135 182 Z', fill: 'url(#av-skin)' }),
          // subtle stubble / jaw shading: a stronger, squarer jawline
          s('path', { d: 'M146 262 C150 292 168 312 200 320 C232 312 250 292 254 262 C246 290 228 304 200 308 C172 304 154 290 146 262 Z', fill: C.stubble, opacity: 0.22 }),
          s('path', { d: 'M180 288 Q200 282 220 288 Q218 300 200 302 Q182 300 180 288 Z', fill: C.stubble, opacity: 0.12 }),
          // nose
          s('path', { d: 'M201 246 Q197 262 196 268 Q200 274 208 271', fill: 'none', stroke: C.skinShade, 'stroke-width': 2.6, 'stroke-linecap': 'round' }),
          s('path', { d: 'M192 272 Q196 276 200 274 M204 274 Q208 276 212 272', fill: 'none', stroke: C.skinShade, 'stroke-width': 1.6, 'stroke-linecap': 'round', opacity: 0.7 }),
          // mouth: straight, calm; a closed grin when happy
          s('path', { class: 'av-mouth-neutral', d: 'M186 292 Q200 294 214 291', fill: 'none', stroke: C.lip, 'stroke-width': 3, 'stroke-linecap': 'round' }),
          s('path', { class: 'av-mouth-smile', d: 'M184 289 Q200 302 216 289', fill: 'none', stroke: C.lip, 'stroke-width': 3.2, 'stroke-linecap': 'round' })),
        s('g', { 'data-depth': 5, class: 'av-eyes' }, eye(173), eye(227, true)),
        s('g', { 'data-depth': 5.5, class: 'av-brows' },
          // thick, straight brows
          s('path', { d: 'M150 214 L190 207 L192 216 L152 222 Z', fill: C.hairDark }),
          s('path', { d: 'M250 214 L210 207 L208 216 L248 222 Z', fill: C.hairDark })),
        s('g', { 'data-depth': 7, class: 'av-hairtop' }, sides, top, volume, strands, fringe)))));
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

  // click / tap / Enter: smile and say hi
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
