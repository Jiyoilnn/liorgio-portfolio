/**
 * color.js — colour maths for the Color Lab (pure functions, unit-tested).
 */
export const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));

/** HSL (h 0-360, s/l 0-100) -> "#RRGGBB" */
export function hslToHex(h, s, l) {
  s /= 100; l /= 100;
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const hex = (x) => Math.round(x * 255).toString(16).padStart(2, '0');
  return `#${hex(f(0))}${hex(f(8))}${hex(f(4))}`.toUpperCase();
}

export function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

export function hexToHsl(hex) {
  let { r, g, b } = hexToRgb(hex);
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  const l = (max + min) / 2;
  let h = 0, s = 0;
  if (d) {
    s = d / (1 - Math.abs(2 * l - 1));
    h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
    h *= 60; if (h < 0) h += 360;
  }
  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
}

/** WCAG relative luminance: how bright a colour looks to the human eye (0 = black, 1 = white). */
export function luminance(hex) {
  const { r, g, b } = hexToRgb(hex);
  const lin = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

/** WCAG contrast ratio, from 1 (identical) to 21 (black on white). */
export function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** Which WCAG level a ratio reaches for normal-size text. */
export function wcagLevel(ratio) {
  return ratio >= 7 ? 'AAA' : ratio >= 4.5 ? 'AA' : ratio >= 3 ? 'AA Large' : 'Fail';
}

export const readableOn = (hex) => (contrast(hex, '#000000') >= contrast(hex, '#FFFFFF') ? '#000000' : '#FFFFFF');

/**
 * Build a palette of `count` colours.
 * "Harmony" = hue relationships on the colour wheel (the same idea designers use).
 * `rand` is injectable so tests can pass a predictable generator.
 */
export function generatePalette(mode = 'analogous', count = 5, rand = Math.random) {
  const base = rand() * 360;
  const jitter = (n) => (rand() - 0.5) * n;
  const make = (h, s, l) => hslToHex(((h % 360) + 360) % 360, clamp(s, 8, 95), clamp(l, 8, 94));

  const hues = {
    analogous: (i) => base + i * 28,
    complementary: (i) => base + (i % 2 ? 180 : 0) + jitter(14),
    triad: (i) => base + (i % 3) * 120 + jitter(10),
    monochrome: () => base,
    random: () => rand() * 360,
  }[mode] ?? ((i) => base + i * 28);

  return Array.from({ length: count }, (_, i) => {
    const light = mode === 'monochrome' ? 18 + (i / (count - 1)) * 68 : 30 + rand() * 45;
    return make(hues(i), 45 + rand() * 40, light);
  });
}
