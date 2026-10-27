// The pencil the background sketch is drawn with. Lines bow a little and run just past their ends, loops
// overshoot where they started and shading is hatched, so the drawing looks made by hand — the same way on
// every load, as each pencil is seeded.
//
// A pencil collects strokes into one path. Browsers restart a dash pattern at every stroke (subpath), so
// `done()` gives the path a length that makes a "1 1" dash draw all of its strokes at the same speed, the
// longest finishing last: the reveal then only has to slide the dash offset from 1 to 0.

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
const pt = (x, y) => `${r1(x)} ${r1(y)}`;

/** Length of a polyline. */
export const lengthOf = (points) =>
  points.reduce((sum, [x, y], i) => (i ? sum + Math.hypot(x - points[i - 1][0], y - points[i - 1][1]) : 0), 0);

/** A smooth curve through points (Catmull-Rom as cubic Béziers), as path commands after the first point. */
export function smooth(points) {
  let d = "";
  for (let i = 0; i < points.length - 1; i++) {
    const [x0, y0] = points[Math.max(0, i - 1)];
    const [x1, y1] = points[i];
    const [x2, y2] = points[i + 1];
    const [x3, y3] = points[Math.min(points.length - 1, i + 2)];
    d += `C${pt(x1 + (x2 - x0) / 6, y1 + (y2 - y0) / 6)} ${pt(x2 - (x3 - x1) / 6, y2 - (y3 - y1) / 6)} ${pt(x2, y2)}`;
  }
  return d;
}

/** Path data for one continuous stroke through points, straight or smooth. */
export const strokeThrough = (points, curved = false) =>
  `M${pt(...points[0])}${curved ? smooth(points) : points.slice(1).map((p) => `L${pt(...p)}`).join("")}`;

export function pencil(seed = 1) {
  const rnd = random(seed);
  const spread = (amount) => (rnd() * 2 - 1) * amount;
  const strokes = [];
  let total = 0;
  let longest = 0;
  const add = (d, length) => {
    strokes.push(d);
    total += length;
    longest = Math.max(longest, length);
  };

  const pen = {
    /** A straight line, slightly bowed, running up to `over` past each end. */
    line(x1, y1, x2, y2, over = 2.5) {
      const length = Math.hypot(x2 - x1, y2 - y1);
      if (length < 0.05) return pen;
      const ux = (x2 - x1) / length;
      const uy = (y2 - y1) / length;
      const a = over * (0.3 + rnd() * 0.7);
      const b = over * (0.3 + rnd() * 0.7);
      const bow = spread(Math.min(1.3, length * 0.012));
      const [sx, sy, ex, ey] = [x1 - ux * a, y1 - uy * a, x2 + ux * b, y2 + uy * b];
      add(`M${pt(sx, sy)}Q${pt((sx + ex) / 2 - uy * bow, (sy + ey) / 2 + ux * bow)} ${pt(ex, ey)}`, length + a + b);
      return pen;
    },

    /** Straight lines between points, each its own stroke, so corners cross like a quick sketch. */
    lines(points, closed = false, over = 2.5) {
      const count = closed ? points.length : points.length - 1;
      for (let i = 0; i < count; i++) {
        const [x1, y1] = points[i];
        const [x2, y2] = points[(i + 1) % points.length];
        pen.line(x1, y1, x2, y2, over);
      }
      return pen;
    },

    rect(x, y, width, height, over = 2.5) {
      return pen.lines(
        [
          [x, y],
          [x + width, y],
          [x + width, y + height],
          [x, y + height],
        ],
        true,
        over,
      );
    },

    /** One continuous stroke through points — straight segments, or a smooth curve. */
    stroke(points, curved = false) {
      add(strokeThrough(points, curved), lengthOf(points));
      return pen;
    },

    /** A loop that runs a little past where it started, its radius wavering slightly. */
    circle(cx, cy, rx, ry = rx, waver = 0.02) {
      const start = rnd() * Math.PI * 2;
      const sweep = Math.PI * 2 + 0.3 + rnd() * 0.3;
      const steps = Math.max(8, Math.round(Math.max(rx, ry) / 2.5));
      const points = [];
      for (let i = 0; i <= steps; i++) {
        const angle = start + (sweep * i) / steps;
        const k = 1 + spread(waver);
        points.push([cx + Math.cos(angle) * rx * k, cy + Math.sin(angle) * ry * k]);
      }
      return pen.stroke(points, true);
    },

    /** A true circle (for wheels and anything that turns, where a wobble would show). */
    ring(cx, cy, r) {
      add(
        `M${pt(cx + r, cy)}A${r1(r)} ${r1(r)} 0 1 1 ${pt(cx - r, cy)}A${r1(r)} ${r1(r)} 0 1 1 ${pt(cx + r, cy)}`,
        Math.PI * 2 * r,
      );
      return pen;
    },

    /** Part of a circle from angle `a0` to `a1` (degrees, clockwise on screen from 3 o'clock). */
    arc(cx, cy, r, a0, a1, ry = r) {
      const steps = Math.max(4, Math.round((Math.abs(a1 - a0) / 360) * 24));
      const points = [];
      for (let i = 0; i <= steps; i++) {
        const angle = ((a0 + ((a1 - a0) * i) / steps) * Math.PI) / 180;
        points.push([cx + Math.cos(angle) * r, cy + Math.sin(angle) * ry]);
      }
      return pen.stroke(points, true);
    },

    /**
     * Hatching across a convex polygon: parallel strokes `gap` apart at `angle` degrees (negative angles
     * rise to the right, like "///"), each stopping a little short of the edges at random.
     */
    hatch(points, gap = 6, angle = -50) {
      const radians = (angle * Math.PI) / 180;
      const cos = Math.cos(radians);
      const sin = Math.sin(radians);
      // Turned so the strokes run along u, at constant v.
      const turned = points.map(([x, y]) => [x * cos + y * sin, -x * sin + y * cos]);
      const vs = turned.map((p) => p[1]);
      const [v0, v1] = [Math.min(...vs), Math.max(...vs)];
      for (let v = v0 + gap * (0.4 + rnd() * 0.3); v < v1; v += gap) {
        const crossings = [];
        for (let i = 0; i < turned.length; i++) {
          const [ua, va] = turned[i];
          const [ub, vb] = turned[(i + 1) % turned.length];
          if ((va <= v && vb > v) || (vb <= v && va > v)) crossings.push(ua + ((v - va) / (vb - va)) * (ub - ua));
        }
        if (crossings.length < 2) continue;
        const lo = Math.min(...crossings);
        const hi = Math.max(...crossings);
        const span = hi - lo;
        if (span < 3) continue;
        const s = lo + 1 + rnd() * span * 0.1;
        const e = hi - 1 - rnd() * span * 0.1;
        if (e - s < 2) continue;
        const at = (u) => [u * cos - v * sin, u * sin + v * cos];
        add(`M${pt(...at(s))}L${pt(...at(e))}`, e - s);
      }
      return pen;
    },

    /** Path data drawn as it is, with its length. */
    raw(d, length) {
      add(d, length);
      return pen;
    },

    /** The collected strokes: path data and the path length that times the reveal (see above). */
    done() {
      return { d: strokes.join(""), pathLength: longest ? Math.round((total / longest) * 1000) / 1000 : 1 };
    },
  };
  return pen;
}
