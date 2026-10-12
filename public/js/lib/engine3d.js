/**
 * engine3d.js — a tiny 3D engine in ~150 lines, drawing on a normal 2D <canvas>.
 *
 * WHY NOT THREE.JS? Three.js is great, but it hides the maths. Writing a mini engine
 * once teaches you what every 3D library does for you:
 *
 *   1. MODEL      Shapes are lists of 3D points (vertices) joined into faces/edges.
 *   2. TRANSFORM  Rotate / scale / move each vertex (linear algebra).
 *   3. PROJECT    Squash 3D onto 2D with perspective:  x2d = x * focal / depth.
 *                 Far things get smaller — that single division IS "3D".
 *   4. SORT       Painter's algorithm: draw far faces first so near ones cover them.
 *   5. LIGHT      Brightness = dot(face normal, light direction)  (flat shading).
 *
 * Coordinate system: +x right, +y up, +z away from the viewer.
 */

// ---------------------------------------------------------------- vector maths
export const v3 = (x = 0, y = 0, z = 0) => ({ x, y, z });
export const add = (a, b) => v3(a.x + b.x, a.y + b.y, a.z + b.z);
export const sub = (a, b) => v3(a.x - b.x, a.y - b.y, a.z - b.z);
export const scale = (a, k) => v3(a.x * k, a.y * k, a.z * k);
export const dot = (a, b) => a.x * b.x + a.y * b.y + a.z * b.z;
export const cross = (a, b) => v3(a.y * b.z - a.z * b.y, a.z * b.x - a.x * b.z, a.x * b.y - a.y * b.x);
export const normalize = (a) => { const l = Math.hypot(a.x, a.y, a.z) || 1; return v3(a.x / l, a.y / l, a.z / l); };

/** Rotate a point around the X, then Y, then Z axis (angles in radians). */
export function rotate(p, rx = 0, ry = 0, rz = 0) {
  let { x, y, z } = p;
  let c = Math.cos(rx), s = Math.sin(rx);
  [y, z] = [y * c - z * s, y * s + z * c];          // around X
  c = Math.cos(ry); s = Math.sin(ry);
  [x, z] = [x * c + z * s, -x * s + z * c];         // around Y
  c = Math.cos(rz); s = Math.sin(rz);
  [x, y] = [x * c - y * s, x * s + y * c];          // around Z
  return v3(x, y, z);
}

// ---------------------------------------------------------------------- meshes
/** Axis-aligned box centred on the origin. Faces are quads (4 vertex indices). */
export function boxMesh(w = 1, h = 1, d = 1) {
  const [x, y, z] = [w / 2, h / 2, d / 2];
  const vertices = [v3(-x, -y, -z), v3(x, -y, -z), v3(x, y, -z), v3(-x, y, -z), v3(-x, -y, z), v3(x, -y, z), v3(x, y, z), v3(-x, y, z)];
  const faces = [[0, 1, 2, 3], [5, 4, 7, 6], [4, 0, 3, 7], [1, 5, 6, 2], [3, 2, 6, 7], [4, 5, 1, 0]];
  return { vertices, faces, edges: edgesOf(faces) };
}

/** Square tapered tub (wider at the top) — used for the fries carton. */
export function taperedTub(bottom = 1, top = 1.4, height = 1.4) {
  const [b, t, h] = [bottom / 2, top / 2, height / 2];
  const vertices = [v3(-b, -h, -b), v3(b, -h, -b), v3(b, -h, b), v3(-b, -h, b), v3(-t, h, -t), v3(t, h, -t), v3(t, h, t), v3(-t, h, t)];
  const faces = [[0, 1, 5, 4], [2, 3, 7, 6], [3, 0, 4, 7], [1, 2, 6, 5], [3, 2, 1, 0]];
  return { vertices, faces, edges: edgesOf(faces) };
}

/** Regular icosahedron (20 triangles) built from the golden ratio. */
export function icosahedron(radius = 1) {
  const t = (1 + Math.sqrt(5)) / 2;
  const raw = [[-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0], [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t], [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1]];
  const vertices = raw.map(([x, y, z]) => scale(normalize(v3(x, y, z)), radius));
  const faces = [[0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11], [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8], [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9], [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1]];
  return { vertices, faces, edges: edgesOf(faces) };
}

export function octahedron(r = 1) {
  const vertices = [v3(r, 0, 0), v3(-r, 0, 0), v3(0, r, 0), v3(0, -r, 0), v3(0, 0, r), v3(0, 0, -r)];
  const faces = [[0, 2, 4], [4, 2, 1], [1, 2, 5], [5, 2, 0], [4, 3, 0], [1, 3, 4], [5, 3, 1], [0, 3, 5]];
  return { vertices, faces, edges: edgesOf(faces) };
}

/** A flat circle of points (an "orbit ring"). */
export function ring(radius = 1, segments = 64) {
  const vertices = Array.from({ length: segments }, (_, i) => {
    const a = (i / segments) * Math.PI * 2;
    return v3(Math.cos(a) * radius, 0, Math.sin(a) * radius);
  });
  return { vertices, faces: [], edges: vertices.map((_, i) => [i, (i + 1) % segments]) };
}

/** Unique edges of a face list (so shared edges aren't drawn twice). */
function edgesOf(faces) {
  const seen = new Set();
  const edges = [];
  for (const f of faces) {
    for (let i = 0; i < f.length; i++) {
      const a = f[i], b = f[(i + 1) % f.length];
      const key = a < b ? `${a}-${b}` : `${b}-${a}`;
      if (!seen.has(key)) { seen.add(key); edges.push([a, b]); }
    }
  }
  return edges;
}

// ----------------------------------------------------------------------- scene
/**
 * A Scene owns a canvas, a list of objects and a camera, and draws them every frame.
 *
 * object = {
 *   mesh, pos, rot, scale,
 *   fill:  '#rrggbb' | null     // flat-shaded faces
 *   inner: '#rrggbb' | null     // colour for the INSIDE of faces (back faces); also enables drawing them
 *   wire:  'rgba(...)' | null   // edges
 *   layer: number               // lower layers are painted first
 * }
 */
export class Scene {
  constructor(canvas, { distance = 6, focal = 1, light = v3(-0.4, 0.8, -0.6) } = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.objects = [];
    this.points = [];            // point clouds: { pos: v3, size, color }
    this.distance = distance;    // camera distance from origin
    this.focalFactor = focal;    // focal length relative to canvas height
    this.light = normalize(light);
    this.rotation = v3();        // whole-scene rotation (what the mouse controls)
    this.offset = v3();          // whole-scene translation
    this.resize();
    new ResizeObserver(() => this.resize()).observe(canvas);
  }

  /** Match the canvas bitmap to its CSS size × devicePixelRatio so lines stay crisp on retina screens. */
  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const { clientWidth: w, clientHeight: h } = this.canvas;
    this.canvas.width = Math.max(1, Math.round(w * dpr));
    this.canvas.height = Math.max(1, Math.round(h * dpr));
    this.w = w; this.h = h; this.dpr = dpr;
    // Changing canvas.width clears it. If the animation loop is paused (off-screen), nothing would repaint it.
    if (this.objects.length || this.points.length) this.render();
  }

  add(obj) {
    this.objects.push({ pos: v3(), rot: v3(), scale: 1, layer: 1, ...obj });
    return this.objects.at(-1);
  }

  /** model space -> world space -> view space (camera at origin, looking along +z). */
  #transform(p, obj) {
    let q = scale(p, obj.scale);
    q = rotate(q, obj.rot.x, obj.rot.y, obj.rot.z);
    q = add(q, obj.pos);
    q = rotate(q, this.rotation.x, this.rotation.y, this.rotation.z);
    q = add(q, this.offset);
    return v3(q.x, q.y, q.z + this.distance);
  }

  /** view space -> screen pixels. Dividing by depth is the whole perspective trick. */
  #project(p) {
    const focal = this.h * this.focalFactor;
    const k = focal / Math.max(p.z, 0.01);
    return { x: this.w / 2 + p.x * k, y: this.h / 2 - p.y * k, k };
  }

  render() {
    const { ctx, dpr } = this;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, this.w, this.h);

    const draws = []; // everything we are going to paint, with a depth for sorting

    for (const obj of this.objects) {
      const view = obj.mesh.vertices.map((p) => this.#transform(p, obj));
      const screen = view.map((p) => this.#project(p));

      if (obj.fill || obj.inner) {
        // centre of the mesh in view space: used to point face normals OUTWARD
        const centre = view.reduce((a, p) => add(a, p), v3());
        const c = scale(centre, 1 / view.length);

        for (const face of obj.mesh.faces) {
          const [a, b, d] = [view[face[0]], view[face[1]], view[face[2]]];
          let n = normalize(cross(sub(b, a), sub(d, a)));
          if (dot(n, sub(a, c)) < 0) n = scale(n, -1);     // make the normal point away from the centre
          const facesCamera = dot(n, a) < 0;                  // ray from camera to face points against the normal
          const colour = facesCamera ? obj.fill : obj.inner;
          if (!colour) continue;                              // back-face culling when no inner colour is given
          const depth = face.reduce((s, i) => s + view[i].z, 0) / face.length;
          const lit = facesCamera ? 0.55 + 0.6 * Math.max(0, dot(n, this.#lightInView())) : 0.5;
          draws.push({ layer: obj.layer + (facesCamera ? 0 : -1), depth, kind: 'face', pts: face.map((i) => screen[i]), colour, lit });
        }
      }
      if (obj.wire) {
        const depth = view.reduce((s, p) => s + p.z, 0) / view.length;
        draws.push({ layer: obj.layer, depth, kind: 'wire', mesh: obj.mesh, screen, colour: obj.wire, width: obj.width ?? 1 });
      }
    }

    for (const pt of this.points) {
      const p = this.#transform(pt.pos, { scale: 1, rot: v3(), pos: v3() });
      if (p.z < 0.2) continue;
      draws.push({ layer: pt.layer ?? 0, depth: p.z, kind: 'dot', p: this.#project(p), size: pt.size, colour: pt.color, z: p.z });
    }

    // painter's algorithm: lower layer first, then far (large depth) before near
    draws.sort((a, b) => a.layer - b.layer || b.depth - a.depth);

    for (const d of draws) {
      if (d.kind === 'face') {
        ctx.beginPath();
        d.pts.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
        ctx.closePath();
        ctx.fillStyle = shade(d.colour, d.lit);
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,.25)';
        ctx.lineWidth = 1;
        ctx.stroke();
      } else if (d.kind === 'wire') {
        ctx.beginPath();
        for (const [a, b] of d.mesh.edges) { ctx.moveTo(d.screen[a].x, d.screen[a].y); ctx.lineTo(d.screen[b].x, d.screen[b].y); }
        ctx.strokeStyle = d.colour;
        ctx.lineWidth = d.width;
        ctx.stroke();
      } else {
        // Distant dots are dimmer and smaller: cheap "depth fog".
        const fade = Math.max(0.12, Math.min(1, 1.9 - d.z / (this.distance + 2.5)));
        ctx.globalAlpha = fade;
        ctx.fillStyle = d.colour;
        ctx.beginPath();
        ctx.arc(d.p.x, d.p.y, Math.max(0.4, d.size * d.p.k * 0.01), 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }
  }

  /** The light direction must be rotated with the scene or the lighting would "stick" to the screen. */
  #lightInView() {
    return normalize(rotate(this.light, this.rotation.x, this.rotation.y, this.rotation.z));
  }
}

/** Multiply a #rrggbb colour by a brightness factor (0..1.x). */
function shade(hex, k) {
  const n = parseInt(hex.slice(1), 16);
  const ch = (shift) => Math.min(255, Math.round(((n >> shift) & 255) * k));
  return `rgb(${ch(16)},${ch(8)},${ch(0)})`;
}

/**
 * Runs `draw(timeMs)` every frame, but ONLY while the canvas is on screen and the tab
 * is visible (saves battery). With "reduce motion" enabled it draws a single still frame.
 */
export function runLoop(canvas, draw) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let visible = true, raf = 0;
  const frame = (t) => { draw(t); raf = requestAnimationFrame(frame); };
  const start = () => { if (!raf && visible && !document.hidden && !reduced) raf = requestAnimationFrame(frame); };
  const stop = () => { cancelAnimationFrame(raf); raf = 0; };

  new IntersectionObserver(([e]) => { visible = e.isIntersecting; visible ? start() : stop(); }).observe(canvas);
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
  draw(0);       // always paint one frame immediately
  start();
}
