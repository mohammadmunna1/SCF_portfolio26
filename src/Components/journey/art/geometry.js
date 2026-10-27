// Shapes and transforms shared by the vehicles' artwork and the director that moves them.

import { clamp } from "../keyframes";
import { random } from "./shapes";

const n1 = (value) => Math.round(value * 10) / 10;

/** Wheel transform: at (x, -r), rolled by `angle` degrees, scaled from the radius-16 drawing to `r`. */
export const wheelTransform = (x, r, angle) =>
  `translate(${n1(x)} ${n1(-r)}) rotate(${Math.round(angle % 360)}) scale(${Math.round((r / 16) * 1000) / 1000})`;

/** Leg swing for a walk (degrees): `phase` advances with distance walked. */
export const legSwing = (phase) => Math.sin(phase) * 22;

/** Rounded-corner cab outline from its key points (the van's and the truck's share one structure, so they morph). */
export function cabPath({ x0, yb, yr, xw0, xw1, yw1, yh, xf }) {
  return `M${n1(x0)} ${n1(yb)}V${n1(yr + 8)}Q${n1(x0)} ${n1(yr)} ${n1(x0 + 8)} ${n1(yr)}H${n1(xw0)}L${n1(xw1)} ${n1(yw1)}L${n1(
    xf - 6,
  )} ${n1(yh)}Q${n1(xf)} ${n1(yh)} ${n1(xf)} ${n1(yh + 6)}V${n1(yb)}Z`;
}

export const polygon = (points) => `M${points.map(([x, y]) => `${n1(x)} ${n1(y)}`).join("L")}Z`;

/**
 * The first-mile van (m = 0) and the line-haul truck it becomes (m = 1): every part is interpolated, the
 * box stretching into a trailer, the cab growing into a cab-over, and each axle splitting in two.
 * Returns attribute values per part, keyed by part name.
 */
export function rigShape(m) {
  const L = (van, truck) => van + (truck - van) * m;
  const box = { x: L(-92, -338), y: L(-100, -154), w: L(112, 366), h: L(78, 114) };
  const cab = {
    x0: L(20, 38),
    yb: L(-22, -30),
    yr: L(-86, -146),
    xw0: L(54, 104),
    xw1: L(80, 114),
    yw1: L(-56, -104),
    yh: L(-50, -100),
    xf: L(96, 120),
  };
  const truckOnly = String(clamp((m - 0.55) / 0.45));
  const vanOnly = String(1 - clamp(m / 0.45));
  const bottom = box.y + box.h;
  return {
    shadow: { cx: n1((box.x + cab.xf) / 2), rx: n1((cab.xf - box.x) / 2 + 12) },
    chassis: { x: n1(box.x + 2), y: n1(bottom - 4), width: n1(L(186, 368)), height: n1(L(8, 10)) },
    tractor: {
      x: n1(cab.x0 - 38 * m),
      y: n1(cab.yb - 6),
      width: n1(cab.xf - cab.x0 + 38 * m),
      height: "10",
      opacity: truckOnly,
    },
    box: { x: n1(box.x), y: n1(box.y), width: n1(box.w), height: n1(box.h) },
    boxTop: { x: n1(box.x), y: n1(box.y), width: n1(box.w), height: "5" },
    boxShade: { x: n1(box.x), y: n1(bottom - 10), width: n1(box.w), height: "10" },
    stripe: { x: n1(box.x), y: n1(bottom - L(22, 30)), width: n1(box.w), height: n1(L(7, 9)) },
    logo: {
      transform: `translate(${n1(box.x + box.w * L(0.56, 0.62))} ${n1(box.y + box.h * 0.42)}) scale(${n1(L(1, 1.6) * 10) / 10})`,
    },
    seam: {
      d: `M${n1(box.x + 7)} ${n1(box.y + 8)}V${n1(bottom - 6)}M${n1(box.x + box.w * 0.5 * m + 7)} ${n1(box.y + 8)}V${n1(bottom - 6)}`,
    },
    tail: { x: n1(box.x - 2), y: n1(bottom - 20), height: n1(L(10, 12)) },
    rear: { x: n1(box.x), y: n1(box.y + 5), width: "16", height: n1(box.h - 12) },
    cab: { d: cabPath(cab) },
    skirt: { d: `M${n1(cab.x0)} ${n1(cab.yb - 13)}H${n1(cab.xf)}V${n1(cab.yb)}H${n1(cab.x0)}Z` },
    deflector: {
      d: polygon([
        [cab.x0 + 4, cab.yr + 1],
        [cab.x0 + 16, cab.yr - 22 * m],
        [cab.xw0 - 16, cab.yr - 22 * m],
        [cab.xw0 - 4, cab.yr + 1],
      ]),
    },
    window: {
      d: polygon([
        [L(26, 46), L(-80, -138)],
        [L(52, 98), L(-80, -138)],
        [L(72, 106), L(-58, -108)],
        [L(26, 46), L(-58, -108)],
      ]),
    },
    door: { d: `M${n1(L(58, 100))} ${n1(cab.yr + 10)}V${n1(cab.yb - 6)}` },
    light: { x: n1(cab.xf - 6), y: n1(cab.yh + 12), height: n1(L(7, 9)) },
    bumper: { x: n1(cab.xf - 12), y: n1(cab.yb - 9), width: "15", height: n1(L(11, 13)) },
    mirror: { x: n1(cab.xw1 - 1), y: n1(cab.yw1 - 4), height: n1(L(14, 18)) },
    tank: { x: n1(L(30, 44)), y: n1(cab.yb - 14), width: n1(L(18, 34)), opacity: truckOnly },
    sideDoor: { opacity: vanOnly },
    wheels: [
      [L(-58, -294), L(15, 19)],
      [L(-58, -252), L(15, 19)],
      [L(64, 24), L(15, 19)],
      [L(64, 96), L(15, 19)],
    ],
  };
}

/** Applies a rigShape() result to the rig's parts (wheels are rolled separately). */
export function applyShape(nodes, j, shape, set) {
  for (const [name, values] of Object.entries(shape)) {
    if (name === "wheels") continue;
    const node = nodes[`${j}.${name}`];
    if (!node) continue;
    for (const [key, value] of Object.entries(values)) set(node, key, String(value));
  }
}

export const CONTAINER_COLORS = [
  "#2F4A6E",
  "#3A7A78",
  "#C2A15E",
  "#8A949F",
  "#5D7F5A",
  "#E0DED7",
  "#46607E",
  "#7E8C74",
];

/** A colour for stacked containers, never the accent (that one is the shipment). */
export const containerColor = (seed) => CONTAINER_COLORS[Math.floor(random(seed)() * CONTAINER_COLORS.length)];

/** Where the shipment's container rides on the ship: the middle of its floor, on top of the first bay. */
export const SHIP_SLOT = { x: 462, y: -264 };
