// The journey's director: from one progress value (0–1) it places every actor and the camera. Nothing
// here keeps state between frames, so any frame can be drawn at any time — scrolling back simply draws
// earlier frames — and a resize redraws the current one.

import { applyShape, legSwing, rigShape, SHIP_SLOT, wheelTransform } from "./art/geometry";
import { DEPTH, PITCH, PORT, RAMP, ROAD, WATER, X } from "./art/layout";
import { alpha, attr, clamp, css, curve, ease, lerp, move, presence, span, track } from "./keyframes";
import { SUN_X } from "./overlay";
import { route } from "./route";

const DEG = 180 / Math.PI;
const FLOOR = -6;
const BELT = -92;
const ITEMS = 4;
const LINE_END = X.line[0] + 7 * PITCH; // goods leave the belt here for the pallet
const SLOT_X = SHIP_SLOT.x; // the container's place on the ship, from the stern
const SLOT_BOTTOM = WATER + SHIP_SLOT.y;
const CHASSIS = PORT.lane - 42; // a container's floor on a truck chassis (port road)
const ORIGIN_SHIP = X.berth;
const DEST_SHIP = X.destQuay - 20 - 1620; // stern of the ship once berthed at the destination
const DEST_TRUCK = X.destCrane + 186; // the destination truck, its container under the crane

// ——— Timings and paths ———

// 1–2 The van down the country road, through the hub (where it becomes a truck), to the plant's door.
const RIG_X = curve([
  [0, X.start],
  [0.02, X.start],
  [0.112, 2860],
  [0.135, 3060],
  [0.19, 3420],
  [0.215, 3900],
  [0.245, 4898],
]);

// 3 The line runs from 0.262 to 0.355: the belt slows almost to a stop with goods at each station.
const BELT_TRAVEL = (7 + ITEMS - 1) * PITCH;
function beltOffset(p) {
  const u = span(p, 0.262, 0.355, ease.linear) * BELT_TRAVEL;
  return u - 0.9 * (PITCH / (2 * Math.PI)) * Math.sin((2 * Math.PI * u) / PITCH);
}

// 4 Forklift one (it works in reverse, forks to the left): finished pallet from the plant into the racks.
const FORK1_X = curve([
  [0.35, 6820],
  [0.366, 6518],
  [0.372, 6518],
  [0.398, 7110],
  [0.412, 7713],
  [0.443, 7713],
  [0.458, 7810],
]);
const FORK1_LIFT = curve([
  [0.366, 0],
  [0.372, 18],
  [0.412, 18],
  [0.43, 160],
  [0.44, 160],
  [0.443, 152],
  [0.458, 0],
]);
const RACK_SLOT = { x: X.racks[0] + 265 + 70, y: -166 };
// Forklift two loads the export pallet into the container.
const FORK2_X = curve([
  [0.468, 8600],
  [0.488, 8722],
  [0.5, 8640],
]);
const PORTER_A = curve([
  [0.472, X.doorLocal[0] + 70],
  [0.486, X.van - 94],
]);

// 5 Two channels: the van straight on into town; the container truck down the ramp to the port.
const VAN_X = curve([
  [0.508, X.van],
  [0.585, 10900],
]);
const TRUCK_ROUTE = route(
  [X.containerTruck, ROAD.lane],
  [RAMP[0][0], RAMP[0][1]],
  ["C", RAMP[1], RAMP[2], RAMP[3]],
  [X.pick + 186, PORT.lane],
);
const TRUCK_GATE = TRUCK_ROUTE.distanceAtX(10780);
const TRUCK_D = curve([
  [0.505, 0],
  [0.548, TRUCK_GATE],
  [0.658, TRUCK_GATE],
  [0.68, TRUCK_ROUTE.length],
]);

// 6 Retail: a box carried into the shop, the shelves filling, a shopper.
const PORTER_B = curve([
  [0.588, 10808],
  [0.612, 11070],
]);
const SHOPPER = curve([
  [0.618, 10600],
  [0.648, 10850],
]);

// 7 The crane lifts the container onto the ship, which sails at 0.74 …
const CRANE1_X = curve([
  [0.705, X.pick],
  [0.722, ORIGIN_SHIP + SLOT_X],
]);
const CRANE1_Y = curve([
  [0.68, 230],
  [0.69, 445],
  [0.692, 445],
  [0.705, 215],
  [0.722, 215],
  [0.73, 291],
  [0.733, 291],
  [0.742, 200],
]);
const SHIP_X = curve([
  [0.74, ORIGIN_SHIP],
  [0.765, 12360],
  [0.84, 14820],
  [0.866, DEST_SHIP],
]);

// 8 … to the destination, where a second crane sets it on a truck for the distribution centre.
const CRANE2_X = curve([
  [0.866, 17150],
  [0.874, DEST_SHIP + SLOT_X],
  [0.884, DEST_SHIP + SLOT_X],
  [0.894, X.destCrane],
]);
const CRANE2_Y = curve([
  [0.866, 215],
  [0.874, 215],
  [0.879, 291],
  [0.881, 291],
  [0.887, 215],
  [0.894, 215],
  [0.9, 445],
  [0.902, 445],
  [0.908, 215],
]);
const TRUCK3_X = curve([
  [0.906, DEST_TRUCK],
  [0.93, 18736],
]);
const LAST_MILE = [
  curve([
    [0.925, 19160],
    [0.952, 20200],
  ]),
  curve([
    [0.932, 19420],
    [0.958, 20640],
  ]),
];

/** A point on a vehicle (local x, y), given its position and heading. */
const onVehicle = (vehicle, lx, ly) => {
  const a = (vehicle.angle * Math.PI) / 180;
  return { x: vehicle.x + lx * Math.cos(a) - ly * Math.sin(a), y: vehicle.y + lx * Math.sin(a) + ly * Math.cos(a) };
};

/** Two-link arm: angles (degrees) to reach a target from a shoulder, elbow up. */
function reach(sx, sy, tx, ty, l1, l2) {
  const dx = tx - sx;
  const dy = ty - sy;
  const d = clamp(Math.hypot(dx, dy), Math.abs(l1 - l2) + 1, l1 + l2 - 1);
  const theta = Math.atan2(dy, dx);
  const alphaAngle = Math.acos((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d));
  const a1 = theta - alphaAngle;
  const ex = sx + l1 * Math.cos(a1);
  const ey = sy + l1 * Math.sin(a1);
  const a2 = Math.atan2(ty - ey, tx - ex) - a1;
  return [a1 * DEG, a2 * DEG];
}

/** Everything the camera follows, worked out first. */
function actors(p) {
  const truckD = TRUCK_D(p);
  return {
    rigX: RIG_X(p),
    fork1X: FORK1_X(p),
    vanX: VAN_X(p),
    truck: { ...TRUCK_ROUTE.at(truckD), d: truckD },
    shipX: SHIP_X(p),
    truck3X: TRUCK3_X(p),
  };
}

// ——— Camera ———
// Shots in order; where two overlap the camera blends between them. Each gives the world point at the
// frame's centre and the zoom, for wide (landscape) and narrow (portrait) screens. `w` is the frame's
// width in world units at zoom 1.

const SHOTS = [
  {
    to: 0.252,
    wide: (p, a, w) => ({
      x:
        a.rigX +
        w *
          track(p, [
            [0, 0.1],
            [0.03, 0.1],
            [0.1, 0.14],
            [0.15, 0.08],
            [0.2, 0.04],
          ]),
      y: track(p, [
        [0, -370],
        [0.05, -300],
      ]),
      z: track(p, [
        [0, 0.85],
        [0.05, 1],
      ]),
    }),
    narrow: (p, a) => ({
      x:
        a.rigX +
        track(p, [
          [0, 10],
          [0.13, 0],
          [0.19, -110],
          [0.24, -140],
        ]),
      y: track(p, [
        [0, -335],
        [0.04, -230],
      ]),
      z: track(p, [
        [0, 1.15],
        [0.13, 1.15],
        [0.19, 0.86],
      ]),
    }),
  },
  {
    from: 0.236,
    to: 0.366,
    wide: (p) => ({
      x: track(p, [
        [0.236, 4900],
        [0.265, 5000],
        [0.352, 6180],
        [0.366, 6420],
      ]),
      y: -250,
      z: track(p, [
        [0.236, 1],
        [0.27, 0.9],
      ]),
    }),
    narrow: (p) => ({
      x: track(p, [
        [0.236, 4880],
        [0.262, 4760],
        [0.355, 6260],
        [0.366, 6380],
      ]),
      y: -190,
      z: track(p, [
        [0.236, 0.86],
        [0.262, 0.82],
      ]),
    }),
  },
  {
    from: 0.354,
    to: 0.5,
    wide: (p, a) => ({
      x: lerp(a.fork1X - 60, 8760, span(p, 0.452, 0.472)),
      y: -260,
      z: track(p, [
        [0.354, 0.9],
        [0.4, 0.86],
      ]),
    }),
    narrow: (p, a) => ({
      x: lerp(a.fork1X - 70, 8700, span(p, 0.452, 0.472)),
      y: -180,
      z: 0.82,
    }),
  },
  {
    from: 0.495,
    to: 0.566,
    wide: () => ({ x: 10280, y: 60, z: 0.42 }),
    narrow: () => ({ x: 9800, y: 300, z: 0.46 }),
  },
  {
    from: 0.556,
    to: 0.66,
    wide: (p, a) => ({ x: Math.max(a.vanX + 60, 10560), y: -180, z: 0.95 }),
    narrow: (p, a) => ({ x: Math.max(a.vanX + 40, 10600), y: -150, z: 0.95 }),
  },
  {
    from: 0.648,
    to: 0.752,
    wide: (p) => ({
      x: track(p, [
        [0.648, 11780],
        [0.69, 11860],
        [0.735, 12160],
      ]),
      y: 440,
      z: 0.72,
    }),
    narrow: (p) => ({
      x: track(p, [
        [0.648, 11520],
        [0.7, 11560],
        [0.724, 12350],
        [0.74, 12500],
      ]),
      y: 330,
      z: 0.58,
    }),
  },
  {
    from: 0.738,
    to: 0.876,
    wide: (p, a) => ({ x: a.shipX + 840, y: 300, z: 0.6 }),
    narrow: (p, a) => ({ x: a.shipX + 820, y: 330, z: 0.46 }),
  },
  {
    from: 0.862,
    to: 0.958,
    wide: (p) => ({
      x: track(p, [
        [0.862, 16500],
        [0.886, 16620],
        [0.9, 16980],
        [0.935, 18400],
        [0.958, 18800],
      ]),
      y: 300,
      z: 0.62,
    }),
    narrow: (p, a) => ({
      x:
        track(p, [
          [0.862, 16000],
          [0.886, 16200],
          [0.9, 17240],
          [0.906, 17240],
        ]) + (p > 0.906 ? a.truck3X - 17426 : 0),
      y: 320,
      z: 0.58,
    }),
  },
  {
    from: 0.946,
    to: 1,
    wide: (p) => ({
      x: 18900,
      y: track(p, [
        [0.946, 300],
        [1, -260],
      ]),
      z: 0.62,
    }),
    narrow: (p) => ({
      x: 19000,
      y: track(p, [
        [0.946, 320],
        [1, -160],
      ]),
      z: 0.58,
    }),
  },
];

function camera(p, a, view) {
  const pick = (shot) => {
    const z0 = view.wide ? shot.wide(p, a, view.w).z : shot.narrow(p, a, view.w).z;
    return view.wide ? shot.wide(p, a, view.w / z0) : shot.narrow(p, a, view.w / z0);
  };
  let index = SHOTS.findIndex((shot) => p <= shot.to);
  if (index === -1) index = SHOTS.length - 1;
  const current = pick(SHOTS[index]);
  const next = SHOTS[index + 1];
  if (!next || p < next.from) return current;
  const t = ease.inOut((p - next.from) / (SHOTS[index].to - next.from));
  const other = pick(next);
  return {
    x: lerp(current.x, other.x, t),
    y: lerp(current.y, other.y, t),
    z: Math.exp(lerp(Math.log(current.z), Math.log(other.z), t)),
  };
}

// ——— Painting ———

/** Collects the scene's moving parts once; `paint(p)` then draws any frame. */
export function createDirector(root) {
  const n = {};
  for (const element of root.querySelectorAll("[data-j]")) n[element.dataset.j] = element;
  const layers = [...root.querySelectorAll("[data-layer]")].map((element) => {
    // Parts drawn with an x extent (data-x) are skipped while off screen: less to paint every frame
    const parts = [...element.querySelectorAll("[data-x]")].map((part) => {
      const [x0, x1] = part.dataset.x.split(" ").map(Number);
      return { part, x0, x1 };
    });
    // Layered mode: the layer is an SVG whose top-left corner is `origin` (its own units)
    const origin = element.dataset.origin?.split(" ").map(Number);
    return { element, parts, origin, depth: DEPTH[element.dataset.layer] ?? { x: 1, y: 1 } };
  });
  let view = { width: 1, height: 1, wide: true, w: 1600 };

  const opacity = (name, value) => attr(n[name], "opacity", alpha(value));
  // Shown or not (display, so nothing is painted while off); fades hide the element entirely at zero —
  // an opacity below 1 on a group costs an offscreen buffer every frame, so it's used only mid-fade.
  const show = (name, on) => attr(n[name], "display", on ? "inline" : "none");
  const fade = (name, value) => {
    show(name, value > 0.001);
    attr(n[name], "opacity", value > 0.999 ? "1" : alpha(value));
  };
  const place = (name, x, y, rotate = 0, scale = 1) => attr(n[name], "transform", move(x, y, rotate, scale));
  const wheels = (j, positions, distance) =>
    positions.forEach(([wx, r], i) => attr(n[`${j}.w${i}`], "transform", wheelTransform(wx, r, (distance / r) * DEG)));
  const walk = (j, distance) => {
    const swing = legSwing(distance / 9);
    attr(n[`${j}.legA`], "transform", `translate(0 -26) rotate(${swing.toFixed(1)})`);
    attr(n[`${j}.legB`], "transform", `translate(0 -26) rotate(${(-swing).toFixed(1)})`);
  };

  return {
    measure() {
      const width = root.clientWidth || 1;
      const height = root.clientHeight || 1;
      const wide = width >= height;
      view = { width, height, wide, w: wide ? (width / height) * 900 : 640 };
    },

    paint(p) {
      const a = actors(p);

      // — Camera: world units to pixels; on portrait screens the frame's centre sits low (captions on top)
      const cam = camera(p, a, view);
      const scale = view.wide ? (view.height / 900) * cam.z : (view.width / 640) * cam.z;
      const cx = view.width / 2;
      const cy = view.height * (view.wide ? 0.5 : 0.6);
      const reachX = (view.width * 0.65) / scale + 150; // half the frame, plus a margin, in world units
      for (const { element, parts, origin, depth } of layers) {
        if (origin) {
          // A GPU layer: translate its corner to where the camera puts it, then scale (transform-origin 0 0)
          const tx = cx + (origin[0] - cam.x * depth.x) * scale;
          const ty = cy + (origin[1] - cam.y * depth.y) * scale;
          css(
            element,
            "transform",
            `translate3d(${tx.toFixed(1)}px, ${ty.toFixed(1)}px, 0) scale(${scale.toFixed(4)})`,
          );
        } else {
          const tx = cx - cam.x * depth.x * scale;
          const ty = cy - cam.y * depth.y * scale;
          attr(element, "transform", `translate(${tx.toFixed(1)} ${ty.toFixed(1)}) scale(${scale.toFixed(4)})`);
        }
        const centre = cam.x * depth.x;
        for (const { part, x0, x1 } of parts)
          attr(part, "display", x1 > centre - reachX && x0 < centre + reachX ? "inline" : "none");
      }
      // Actors are skipped too while off screen (x0–x1: their extent now)
      const inView = (name, x0, x1) =>
        attr(n[name], "display", x1 > cam.x - reachX && x0 < cam.x + reachX ? "inline" : "none");
      // Foreground grass only along the first, ground-level stretch
      fade("fore", 1 - span(p, 0.488, 0.502));

      // — 1–2 The van, becoming a truck, to the plant
      const shape = rigShape(span(p, 0.14, 0.188));
      applyShape(n, "rig", shape, attr);
      place("rig", a.rigX, ROAD.lane);
      inView("rig", a.rigX - 350, a.rigX + 130);
      wheels("rig", shape.wheels, a.rigX);
      opacity("rig.rear", span(p, 0.247, 0.252));

      // — 3 Manufacturing: the facade opens, raw stock is unloaded, the line runs
      const plantWall = 1 - span(p, 0.248, 0.27) + span(p, 0.43, 0.44);
      fade("plant.wall", plantWall);
      show("plant.inside", plantWall < 0.999);
      opacity("plant.inOpen", span(p, 0.246, 0.251));
      opacity("plant.outOpen", span(p, 0.352, 0.358) * (1 - span(p, 0.4, 0.41)));
      for (let k = 0; k < 3; k++) {
        const t = span(p, 0.25 + k * 0.004, 0.259 + k * 0.004, ease.linear);
        place(`crate${k}`, lerp(4566, 4496, t), lerp(10, FLOOR, t) - Math.sin(Math.PI * t) * 24);
        fade(`crate${k}`, t > 0 ? 1 - span(t, 0.7, 1) : 0);
      }
      const offset = beltOffset(p);
      let pressGap = Infinity;
      let robotGap = Infinity;
      let robotHolding = false;
      for (let i = 0; i < ITEMS; i++) {
        const bx = X.line[0] + offset - i * PITCH;
        const name = `item${i}`;
        const slotX = X.pallet - 25 + (i % 2) * 50;
        const slotY = FLOOR - 14 - Math.floor(i / 2) * 37;
        const toPallet = clamp((bx - LINE_END) / 120);
        let x = bx;
        let y = BELT;
        if (toPallet > 0) {
          x = lerp(LINE_END, slotX, toPallet);
          y = lerp(BELT, slotY, toPallet) - Math.sin(Math.PI * toPallet) * 30;
        }
        place(name, x, y);
        show(name, toPallet < 1 && bx >= X.line[0] - 20);
        show(`goods.b${i}`, toPallet >= 1);
        const boxed = bx >= X.packer;
        show(`${name}.raw`, bx < X.press);
        show(`${name}.part`, bx >= X.press && !boxed);
        show(`${name}.cap`, bx >= X.robot && !boxed);
        show(`${name}.box`, boxed);
        if (bx > X.line[0] - 40 && toPallet <= 0) {
          pressGap = Math.min(pressGap, Math.abs(bx - X.press));
          const gap = Math.abs(bx - X.robot);
          if (gap < robotGap) {
            robotGap = gap;
            robotHolding = bx < X.robot;
          }
        }
      }
      place("press.ram", 0, 52 * ease.inOut(1 - clamp(pressGap / 60)));
      const extend = ease.inOut(1 - clamp(robotGap / 110));
      const [a1, a2] = reach(X.robot - 60, -240, lerp(X.robot + 60, X.robot, extend), lerp(-232, -151, extend), 90, 80);
      attr(n["robot.upper"], "transform", `translate(${X.robot - 60} -240) rotate(${a1.toFixed(1)})`);
      attr(n["robot.fore"], "transform", `translate(90 0) rotate(${a2.toFixed(1)})`);
      attr(n["robot.grip"], "transform", `translate(80 0) rotate(${(-(a1 + a2)).toFixed(1)})`);
      show("robot.cap", robotHolding);

      // — 4 Warehousing: the pallet into the racks; stock on hand; loading for two channels
      const lift1 = FORK1_LIFT(p);
      attr(n.fork1, "transform", `translate(${a.fork1X.toFixed(1)} ${FLOOR}) scale(-1 1)`);
      inView("fork1", a.fork1X - 140, a.fork1X + 80);
      place("fork1.forks", 0, -lift1);
      wheels(
        "fork1",
        [
          [-30, 13],
          [38, 16],
        ],
        -a.fork1X,
      );
      if (p < 0.443) place("goods", p < 0.366 ? X.pallet : a.fork1X - 98, FLOOR - (p < 0.366 ? 0 : lift1));
      else place("goods", RACK_SLOT.x, RACK_SLOT.y);
      show("goods", p > 0.262 && p < 0.53);
      const storeWall = 1 - span(p, 0.392, 0.408) + span(p, 0.53, 0.54);
      fade("store.wall", storeWall);
      show("store.inside", storeWall < 0.999);
      opacity("store.inOpen", span(p, 0.392, 0.398) * (1 - span(p, 0.45, 0.46)));
      const stock = p < 0.443 ? "1,244" : p < 0.49 ? "1,248" : "1,242";
      if (n.stock && n.stock.textContent !== `${stock} units`) n.stock.textContent = `${stock} units`;

      const porterA = PORTER_A(p);
      place("porterA", porterA, FLOOR);
      walk("porterA", porterA);
      fade("porterA", span(p, 0.468, 0.472) * (1 - span(p, 0.486, 0.49)));
      const fork2X = FORK2_X(p);
      place("fork2", fork2X, FLOOR);
      inView("fork2", fork2X - 80, fork2X + 140);
      place("fork2.forks", 0, -30);
      wheels(
        "fork2",
        [
          [-30, 13],
          [38, 16],
        ],
        fork2X,
      );
      place("pallet2", fork2X + 98, FLOOR - 30);
      show("pallet2", p < 0.49);

      // — 5 Two channels
      place("van2", a.vanX, ROAD.lane);
      inView("van2", a.vanX - 100, a.vanX + 100);
      wheels("van2", rigShape(0).wheels, a.vanX);
      place("truck2", a.truck.x, a.truck.y, a.truck.angle);
      inView("truck2", a.truck.x - 370, a.truck.x + 130);
      wheels(
        "truck2",
        [
          [-312, 19],
          [-270, 19],
          [24, 19],
          [96, 19],
        ],
        a.truck.d,
      );

      // — 6 Retail
      const porterB = PORTER_B(p);
      place("porterB", porterB, FLOOR);
      walk("porterB", porterB);
      fade("porterB", span(p, 0.584, 0.588) * (1 - span(p, 0.612, 0.616)));
      for (let k = 0; k < 9; k++) fade(`market.stock${k}`, span(p, 0.598 + k * 0.0035, 0.604 + k * 0.0035));
      opacity("market.glare", 1 - 0.6 * span(p, 0.59, 0.6));
      opacity("market.open", 0.35 + 0.65 * span(p, 0.632, 0.64));
      const shopper = SHOPPER(p);
      place("shopper", shopper, FLOOR);
      walk("shopper", shopper);
      place("cart", shopper + 16, FLOOR);

      // — 7–8 Port, sea crossing, destination: the container changes hands crane → ship → crane → truck
      const shipX = a.shipX;
      place("ship", shipX, WATER);
      inView("ship", shipX - 600, shipX + 1720);
      const speed = Math.abs(SHIP_X(p + 0.001) - SHIP_X(p - 0.001)) / 0.002;
      fade("ship.wake", clamp(speed / 30000));
      fade("ship.lights", span(p, 0.82, 0.86));
      fade("moorings", 1 - span(p, 0.736, 0.742));

      const trolley1 = CRANE1_X(p);
      const spreader1 = CRANE1_Y(p);
      place("crane1.trolley", trolley1, 0);
      place("crane1.spreader", trolley1, spreader1);
      attr(
        n["crane1.cables"],
        "d",
        `M${(trolley1 - 22).toFixed(1)} 191V${spreader1 - 12}M${(trolley1 + 22).toFixed(1)} 191V${spreader1 - 12}`,
      );
      const trolley2 = CRANE2_X(p);
      const spreader2 = CRANE2_Y(p);
      place("crane2.trolley", trolley2, 0);
      place("crane2.spreader", trolley2, spreader2);
      attr(
        n["crane2.cables"],
        "d",
        `M${(trolley2 - 22).toFixed(1)} 191V${spreader2 - 12}M${(trolley2 + 22).toFixed(1)} 191V${spreader2 - 12}`,
      );

      let box;
      if (p < 0.692) {
        const point = onVehicle(a.truck, -186, -42);
        box = { x: point.x, y: point.y, angle: a.truck.angle };
      } else if (p < 0.733) box = { x: trolley1, y: spreader1 + 85, angle: 0 };
      else if (p < 0.881) box = { x: shipX + SLOT_X, y: SLOT_BOTTOM, angle: 0 };
      else if (p < 0.902) box = { x: trolley2, y: spreader2 + 85, angle: 0 };
      else box = { x: a.truck3X - 186, y: CHASSIS, angle: 0 };
      place("box", box.x, box.y, box.angle);
      inView("box", box.x - 180, box.x + 180);

      place("truck3", a.truck3X, PORT.lane);
      inView("truck3", a.truck3X - 370, a.truck3X + 380);
      wheels(
        "truck3",
        [
          [-312, 19],
          [-270, 19],
          [24, 19],
          [96, 19],
        ],
        a.truck3X,
      );
      place("beam3", a.truck3X + 120, PORT.lane - 84);
      LAST_MILE.forEach((path, i) => {
        const x = path(p);
        place(`lm${i}`, x, PORT.lane);
        inView(`lm${i}`, x - 100, x + 360);
        wheels(`lm${i}`, rigShape(0).wheels, x);
        place(`beamLm${i}`, x + 96, PORT.lane - 34);
      });

      // The setting sun's glitter on the water, kept under the sun as the camera moves
      const sunWorldX = cam.x + ((SUN_X(p) / 100 - 0.5) * view.width) / scale;
      place("glitter", sunWorldX, 0);
      fade("glitter", presence(p, 0.775, 0.855, 0.03) * 0.9);
      place("farShip", 3400 - (p - 0.74) * 2400, 54);
    },
  };
}
