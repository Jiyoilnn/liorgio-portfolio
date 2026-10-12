/**
 * sound.js — the site's sound design, synthesised live with the Web Audio API.
 *
 * No audio files are downloaded: every sound is built from oscillators, filters and
 * noise, tuned to the "night studio" theme (soft synth blips + a lo-fi ambient pad).
 *
 * Browser rule: audio may only start after the visitor interacts (click / key / tap),
 * so nothing plays until then. The nav button cycles: All sound → Effects only → Muted,
 * and the choice is remembered.
 */
import { storage } from './dom.js';

const KEY = 'sound-pref-v1';
const MODES = ['all', 'fx', 'off'];
let mode = MODES.includes(storage.get(KEY, 'all')) ? storage.get(KEY, 'all') : 'all';
let ctx, master, fxBus, ambBus, unlocked = false;
let ambient = null;
const listeners = new Set();

export const getSoundMode = () => mode;
export const onSoundChange = (fn) => (listeners.add(fn), () => listeners.delete(fn));

function ensure() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = 0.9;
    // gentle compressor so stacked sounds never clip
    const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -18; comp.ratio.value = 4;
    master.connect(comp).connect(ctx.destination);
    fxBus = ctx.createGain(); fxBus.gain.value = 0.55; fxBus.connect(master);
    ambBus = ctx.createGain(); ambBus.gain.value = 0; ambBus.connect(master);
  }
  if (ctx.state === 'suspended') ctx.resume();
  return true;
}

/** One synth note with an attack/decay envelope, optionally gliding to another pitch. */
function tone({ freq, to, type = 'sine', dur = 0.12, vol = 0.2, delay = 0, attack = 0.005, bus = fxBus }) {
  const t = ctx.currentTime + delay;
  const osc = ctx.createOscillator(), g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (to) osc.frequency.exponentialRampToValueAtTime(to, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g).connect(bus);
  osc.start(t); osc.stop(t + dur + 0.05);
}

/** Filtered noise that sweeps up: a soft "whoosh". */
function whoosh(vol = 0.12, dur = 0.5) {
  const t = ctx.currentTime;
  const buf = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource(); src.buffer = buf;
  const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 1.2;
  f.frequency.setValueAtTime(300, t); f.frequency.exponentialRampToValueAtTime(2600, t + dur);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + dur * 0.4); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(f).connect(g).connect(fxBus);
  src.start(t);
}

const SFX = {
  hover: () => tone({ freq: 1900, to: 2300, type: 'sine', dur: 0.05, vol: 0.035 }),
  click: () => { tone({ freq: 520, to: 780, type: 'triangle', dur: 0.09, vol: 0.12 }); tone({ freq: 1560, type: 'sine', dur: 0.06, vol: 0.04, delay: 0.02 }); },
  toggle: () => { tone({ freq: 660, type: 'square', dur: 0.06, vol: 0.05 }); tone({ freq: 990, type: 'square', dur: 0.08, vol: 0.05, delay: 0.06 }); },
  open: () => tone({ freq: 300, to: 900, type: 'triangle', dur: 0.18, vol: 0.09 }),
  close: () => tone({ freq: 900, to: 300, type: 'triangle', dur: 0.16, vol: 0.08 }),
  whoosh: () => whoosh(0.07, 0.55),
  success: () => [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone({ freq: f, type: 'triangle', dur: 0.32, vol: 0.09, delay: i * 0.07 })),
  error: () => { tone({ freq: 220, to: 160, type: 'sawtooth', dur: 0.18, vol: 0.06 }); tone({ freq: 233, to: 170, type: 'sawtooth', dur: 0.18, vol: 0.05, delay: 0.02 }); },
  hello: () => [659.25, 880, 1174.66].forEach((f, i) => tone({ freq: f, type: 'sine', dur: 0.22, vol: 0.12, delay: i * 0.09 })),
};

/** Play a named effect (ignored when muted or before the first interaction). */
export function play(name) {
  if (mode === 'off' || !unlocked || !ctx) return;
  SFX[name]?.();
}

// ---------------------------------------------------------------- ambient pad
// A slow lo-fi chord loop (Am9 → Fmaj7 → Cmaj7 → G6) through a breathing low-pass filter,
// plus an occasional soft "pluck" from the pentatonic scale. Very quiet on purpose.
const CHORDS = [
  [110.0, 164.81, 196.0, 246.94, 261.63],  // Am9
  [87.31, 130.81, 164.81, 220.0, 261.63],  // Fmaj7
  [130.81, 164.81, 196.0, 246.94, 329.63], // Cmaj7
  [98.0, 146.83, 196.0, 246.94, 329.63],   // G6
];
const PENTA = [440, 523.25, 587.33, 659.25, 783.99, 880];

function startAmbient() {
  if (ambient || !ctx) return;
  const filter = ctx.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 650; filter.Q.value = 3;
  const lfo = ctx.createOscillator(), lfoGain = ctx.createGain();
  lfo.frequency.value = 0.07; lfoGain.gain.value = 260; lfo.connect(lfoGain).connect(filter.frequency); lfo.start();
  filter.connect(ambBus);
  const voices = CHORDS[0].map((f, i) => {
    const osc = ctx.createOscillator(), g = ctx.createGain();
    osc.type = i === 0 ? 'sine' : 'sawtooth';
    osc.frequency.value = f; osc.detune.value = (i % 2 ? 7 : -7);
    g.gain.value = i === 0 ? 0.5 : 0.12;
    osc.connect(g).connect(filter); osc.start();
    return osc;
  });
  let step = 0;
  const chordTimer = setInterval(() => {
    step = (step + 1) % CHORDS.length;
    voices.forEach((o, i) => o.frequency.setTargetAtTime(CHORDS[step][i], ctx.currentTime, 0.8));
  }, 8000);
  const pluck = () => {
    if (!ambient) return;
    const f = PENTA[Math.floor(Math.random() * PENTA.length)];
    tone({ freq: f, type: 'sine', dur: 1.6, vol: 0.05, attack: 0.01, bus: ambBus });
    ambient.pluckTimer = setTimeout(pluck, 1800 + Math.random() * 2600);
  };
  ambient = { voices, lfo, filter, chordTimer, pluckTimer: 0 };
  ambBus.gain.cancelScheduledValues(ctx.currentTime);
  ambBus.gain.setTargetAtTime(0.16, ctx.currentTime, 1.5); // slow fade-in
  pluck();
}

function stopAmbient() {
  if (!ambient || !ctx) return;
  const a = ambient; ambient = null;
  clearInterval(a.chordTimer); clearTimeout(a.pluckTimer);
  ambBus.gain.setTargetAtTime(0, ctx.currentTime, 0.4);
  setTimeout(() => { a.voices.forEach((o) => o.stop()); a.lfo.stop(); a.filter.disconnect(); }, 1600);
}

function apply() {
  if (!unlocked) return;
  if (mode === 'all') startAmbient(); else stopAmbient();
}

/** Cycle All → Effects only → Muted. Returns the new mode. */
export function cycleSound() {
  mode = MODES[(MODES.indexOf(mode) + 1) % MODES.length];
  storage.set(KEY, mode);
  unlock();
  apply();
  if (mode !== 'off') play('toggle');
  listeners.forEach((fn) => fn(mode));
  return mode;
}

function unlock() {
  if (unlocked) return;
  if (!ensure()) return;
  unlocked = true;
  apply();
}

/** Wire global listeners once (called by layout.js on every page). */
export function initSound() {
  for (const evt of ['pointerdown', 'keydown', 'touchstart']) addEventListener(evt, unlock, { once: true, passive: true });

  // hover blips on interactive things (mouse only), clicks on press
  const SEL = 'a, button, summary, [role="button"], .pcard, .chip, input[type="range"], .phone-slot';
  let lastHover = null, lastT = 0;
  if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.addEventListener('pointerover', (e) => {
      const el = e.target.closest(SEL);
      if (!el || el === lastHover) return;
      lastHover = el;
      const now = performance.now();
      if (now - lastT > 70) { lastT = now; play('hover'); }
    });
    document.addEventListener('pointerout', (e) => { if (!e.relatedTarget || !e.relatedTarget.closest?.(SEL)) lastHover = null; });
  }
  document.addEventListener('click', (e) => {
    if (e.target.closest('.sound-toggle')) return; // the toggle plays its own sound
    if (e.target.closest(SEL)) play('click');
  });

  // other modules ask for sounds with:  dispatchEvent(new CustomEvent('ui-sound', { detail: 'success' }))
  let lastWhoosh = 0;
  addEventListener('ui-sound', (e) => {
    if (e.detail === 'whoosh') { const n = performance.now(); if (n - lastWhoosh < 700) return; lastWhoosh = n; }
    play(e.detail);
  });

  // be polite: go quiet when the tab is hidden
  document.addEventListener('visibilitychange', () => {
    if (!ctx) return;
    if (document.hidden) ctx.suspend(); else if (mode !== 'off') ctx.resume();
  });
}
