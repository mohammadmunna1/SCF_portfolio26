// Outlines and layouts shared by the sketch's drawings and the director that moves them: path data for
// paper, vehicle bodies (the small cargo truck's grows into the delivery truck's), and the strokes of containers and pallets.

import { BOX } from "./layout";

const r1 = (value) => Math.round(value * 10) / 10;

export const rectPath = (x, y, width, height) => `M${r1(x)} ${r1(y)}h${r1(width)}v${r1(height)}h${r1(-width)}Z`;
export const polyPath = (points) => `M${points.map(([x, y]) => `${r1(x)} ${r1(y)}`).join("L")}Z`;

/**
 * A body's outline: its profile from the rear bottom over the top to the front bottom, then back along the
 * bottom with an arch over each wheel ({ x, r }) — wheels close together share one arch.
 */
export function outline(top, wheels) {
  const bottom = top[top.length - 1][1];
  let d = `M${top.map(([x, y]) => `${r1(x)} ${r1(y)}`).join("L")}`;
  const arches = [];
  for (const { x, r } of [...wheels].sort((a, b) => b.x - a.x)) {
    const R = r + 3.5;
    const dy = bottom + r; // from the wheel's centre (y = -r) down to the bottom edge
    const dx = Math.sqrt(Math.max(0, R * R - dy * dy));
    const last = arches[arches.length - 1];
    if (last && x + dx > last.left) {
      last.left = x - dx;
      last.centres.push(x);
    } else arches.push({ right: x + dx, left: x - dx, centres: [x], R, r, large: dy > 0 ? 1 : 0 });
  }
  for (const { right, left, centres, R, r, large } of arches) {
    d += `L${r1(right)} ${r1(bottom)}`;
    if (centres.length === 1) d += `A${r1(R)} ${r1(R)} 0 ${large} 0 ${r1(left)} ${r1(bottom)}`;
    else {
      const top = r1(-r - R);
      d += `A${r1(R)} ${r1(R)} 0 0 0 ${r1(centres[0])} ${top}L${r1(centres[centres.length - 1])} ${top}`;
      d += `A${r1(R)} ${r1(R)} 0 0 0 ${r1(left)} ${r1(bottom)}`;
    }
  }
  return `${d}L${r1(top[0][0])} ${r1(top[0][1])}Z`;
}

// The small open-bed cargo truck and the delivery truck it becomes share one structure: ten points from the
// rear bottom over the bed rail and the cab to the front bottom, and three wheels (the small truck's third
// hides in its rear wheel until it splits off). The open bed's rail rises into the closed box.
const PICKUP = [
  [-96, -18],
  [-96, -50],
  [-92, -52],
  [-40, -52],
  [2, -52],
  [8, -88],
  [50, -88],
  [66, -60],
  [94, -56],
  [96, -18],
];
const TRUCK = [
  [-196, -22],
  [-196, -150],
  [-190, -154],
  [-70, -154],
  [36, -154],
  [40, -112],
  [84, -112],
  [106, -70],
  [112, -60],
  [112, -22],
];
const PICKUP_WHEELS = [
  [64, 14],
  [-58, 14],
  [-58, 14],
];
const TRUCK_WHEELS = [
  [72, 17],
  [-112, 17],
  [-150, 17],
];

/** The small cargo truck (m = 0) on its way to becoming the delivery truck (m = 1): outline and wheels. */
export function rigShape(m) {
  const mix = (a, b) => a + (b - a) * m;
  const top = PICKUP.map(([x, y], i) => [mix(x, TRUCK[i][0]), mix(y, TRUCK[i][1])]);
  const wheels = PICKUP_WHEELS.map(([x, r], i) => ({ x: mix(x, TRUCK_WHEELS[i][0]), r: mix(r, TRUCK_WHEELS[i][1]) }));
  return { wheels, d: outline(top, wheels) };
}

export const VAN = [
  [-95, -14],
  [-96, -80],
  [-90, -88],
  [28, -88],
  [58, -80],
  [82, -52],
  [93, -46],
  [95, -14],
];
export const VAN_WHEELS = [
  { x: 62, r: 14 },
  { x: -60, r: 14 },
];

export const CAB = [
  [112, -28],
  [112, -112],
  [118, -120],
  [166, -120],
  [177, -98],
  [181, -62],
  [181, -28],
];
export const TRACTOR_WHEELS = [
  { x: -52, r: 15 },
  { x: -18, r: 15 },
  { x: 100, r: 16 },
  { x: 160, r: 16 },
];

export const FORKLIFT = [
  [-46, -12],
  [-46, -44],
  [-38, -54],
  [30, -54],
  [36, -44],
  [36, -12],
];
export const FORKLIFT_WHEELS = [
  { x: 22, r: 12 },
  { x: -26, r: 10 },
];

/** A container's outline and corrugations, its bottom-left corner at (x, y). */
export function containerStrokes(outlinePen, finePen, x, y) {
  outlinePen.rect(x, y - BOX.h, BOX.w, BOX.h, 1.5);
  for (let k = 15; k < BOX.w - 5; k += 15) finePen.line(x + k, y - BOX.h + 5, x + k, y - 5, 0);
}

/** A pallet of four cartons, its bottom-left corner at (x, y): strokes added to the given pencils. */
export function palletStrokes(outlinePen, finePen, x, y) {
  outlinePen.rect(x, y - 8, 60, 8, 1);
  finePen.line(x + 8, y - 8, x + 8, y, 0).line(x + 30, y - 8, x + 30, y, 0).line(x + 52, y - 8, x + 52, y, 0);
  for (const [bx, by] of [
    [x + 2, y - 26],
    [x + 30, y - 26],
    [x + 2, y - 44],
    [x + 30, y - 44],
  ]) {
    outlinePen.rect(bx, by, 28, 18, 0.8);
    finePen.line(bx + 14, by, bx + 14, by + 6, 0);
  }
}

export const palletPaper = (x, y) => `${rectPath(x, y - 8, 60, 8)}${rectPath(x + 2, y - 44, 56, 36)}`;
