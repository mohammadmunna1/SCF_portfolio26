// Deterministic generators for the organic parts of the journey's landscape (ridges, hills, scatter), so the
// artwork is identical on every load.

/** Seeded random numbers (mulberry32): the same seed always gives the same sequence. */
export function random(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const r1 = (value) => Math.round(value * 10) / 10;

/** Smooth closed-at-the-bottom path through points (Catmull-Rom turned into cubic Béziers). */
export function smoothPath(points, bottom) {
  if (points.length < 2) return "";
  let d = `M${r1(points[0][0])} ${r1(bottom)}L${r1(points[0][0])} ${r1(points[0][1])}`;
  for (let i = 0; i < points.length - 1; i++) {
    const [x0, y0] = points[Math.max(0, i - 1)];
    const [x1, y1] = points[i];
    const [x2, y2] = points[i + 1];
    const [x3, y3] = points[Math.min(points.length - 1, i + 2)];
    const c1 = [x1 + (x2 - x0) / 6, y1 + (y2 - y0) / 6];
    const c2 = [x2 - (x3 - x1) / 6, y2 - (y3 - y1) / 6];
    d += `C${r1(c1[0])} ${r1(c1[1])} ${r1(c2[0])} ${r1(c2[1])} ${r1(x2)} ${r1(y2)}`;
  }
  return `${d}L${r1(points[points.length - 1][0])} ${r1(bottom)}Z`;
}

/**
 * The same smooth outline as smoothPath, cut into closed pieces about `width` wide that overlap by one step
 * (no seams), each with its x extent — the director skips pieces that are off screen.
 */
export function smoothChunks(points, bottom, width = 1200) {
  const segment = (i) => {
    const [x0, y0] = points[Math.max(0, i - 1)];
    const [x1, y1] = points[i];
    const [x2, y2] = points[i + 1];
    const [x3, y3] = points[Math.min(points.length - 1, i + 2)];
    return `C${r1(x1 + (x2 - x0) / 6)} ${r1(y1 + (y2 - y0) / 6)} ${r1(x2 - (x3 - x1) / 6)} ${r1(y2 - (y3 - y1) / 6)} ${r1(x2)} ${r1(y2)}`;
  };
  const chunks = [];
  let start = 0;
  while (start < points.length - 1) {
    let end = start + 1;
    while (end < points.length - 1 && points[end][0] - points[start][0] < width) end++;
    const last = Math.min(points.length - 1, end + 1);
    let d = `M${r1(points[start][0])} ${r1(bottom)}L${r1(points[start][0])} ${r1(points[start][1])}`;
    for (let i = start; i < last; i++) d += segment(i);
    d += `L${r1(points[last][0])} ${r1(bottom)}Z`;
    chunks.push({ d, x0: points[start][0], x1: points[last][0] });
    start = end;
  }
  return chunks;
}

/**
 * A ridge line from x0 to x1: height above `base` comes from a few layered waves (`height` at most), with
 * `profile(x)` (0–1) shaping where it rises and falls. Returns the outline closed down to `bottom` and
 * `at(x)`, the ridge's y at any x (to stand trees and buildings on it) — and the outline in `chunks`.
 */
export function ridge({ x0, x1, base, height, step = 60, seed = 1, bottom = 4000, profile = () => 1 }) {
  const rand = random(seed);
  const waves = [0.0011, 0.0023, 0.0051].map((frequency, i) => ({
    frequency: frequency * (0.8 + rand() * 0.4),
    phase: rand() * Math.PI * 2,
    weight: [0.55, 0.3, 0.15][i],
  }));
  const at = (x) => {
    let wave = 0;
    for (const { frequency, phase, weight } of waves) wave += weight * (0.5 + 0.5 * Math.sin(x * frequency + phase));
    return base - height * wave * profile(x);
  };
  const points = [];
  for (let x = x0; x <= x1 + 0.1; x += step) points.push([x, at(x)]);
  return { d: smoothPath(points, bottom), chunks: smoothChunks(points, bottom), at };
}

/** `count` items spread between x0 and x1 with some jitter, each with its own random numbers. */
export function scatter(x0, x1, count, seed) {
  const rand = random(seed);
  const gap = (x1 - x0) / count;
  return Array.from({ length: count }, (_, i) => ({
    x: x0 + gap * (i + 0.15 + rand() * 0.7),
    a: rand(),
    b: rand(),
    c: rand(),
  }));
}

/** A tent-shaped profile: 0 outside [from, to], rising to 1 across `ramp` at both ends. */
export const plateau = (from, to, ramp) => (x) => Math.max(0, Math.min(1, (x - from) / ramp, (to - x) / ramp));
