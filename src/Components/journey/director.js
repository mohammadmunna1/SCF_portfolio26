// Directs the background sketch. Everything on screen is a pure function of the journey's progress p (0–1,
// from the page's scroll), so scrolling back plays the journey exactly in reverse. The camera follows the
// shipment; the pencil draws each part of the world just before the camera gets there, and rubs it out
// again on the way back.

import { BOOM, BOX, DEPTH, ROAD, SHIP_SLOT, TERRACE, UPHILL, WATER, X } from "./art/layout";
import { FORKLIFT_WHEELS, TRACTOR_WHEELS, VAN_WHEELS, rigShape } from "./art/shapes";
import { attr, clamp, css, curve, ease, lerp, move, span, track } from "./keyframes";
import { route } from "./route";
import { HERO_END } from "./stages";

const LEAD = 0.06; // the camera runs this far (a share of the view) ahead of a vehicle it follows
const SAMPLES = 600; // the camera and the pencil are precomputed at this many points along the journey
const SMOOTHING = 0.018; // the camera eases between subjects over this much progress, either side
const AHEAD = 0.4; // the pencil draws up to this far right of the screen's centre (a share of the view)
const MARGIN = 140; // world units beyond the screen still treated as on screen

// The small open-bed cargo truck, growing into the delivery truck on its way past the hub, to the factory's
// receiving door (the first stretch, across the hero screen, is set per screen size in measure()).
const MORPH = [0.155, 0.205];

// Production: four units of goods start down the line one after another, are pressed and packed, cross to
// the warehouse and are stacked on a pallet.
const ITEM_STARTS = [0.287, 0.301, 0.315, 0.329];
const ITEM_SPEED = 6600;
const STACK = [
  [-15, -24],
  [15, -24],
  [-15, -42],
  [15, -42],
];
const ITEM_ROUTES = STACK.map(([dx, y]) =>
  route([X.line, -46], [X.palletStation - 24, -46], [X.palletStation + dx, y]),
);

// The forklift: takes the new pallet into the racks, then brings a stored one to the export door.
const PICK = 0.446;
const PUT = 0.472;
const TAKE = 0.486;
const LOAD = 0.505;
const FORK_AT = (palletLeft) => palletLeft - 48;
const FORK_X = curve([
  [0.436, FORK_AT(X.palletStation - 30) - 40],
  [0.444, FORK_AT(X.palletStation - 30)],
  [0.448, FORK_AT(X.palletStation - 30)],
  [0.462, FORK_AT(X.racks + 25)],
  [0.474, FORK_AT(X.racks + 25)],
  [0.484, FORK_AT(X.racks + 135)],
  [0.488, FORK_AT(X.racks + 135)],
  [0.502, FORK_AT(X.exportDoor + 10)],
  [0.506, FORK_AT(X.exportDoor + 10)],
  [0.52, FORK_AT(X.exportDoor + 10) - 80],
]);
const FORK_LIFT = [
  [0.444, 0],
  [0.448, 8],
  [0.462, 8],
  [0.47, 100],
  [0.474, 92],
  [0.484, 0],
  [0.488, 8],
  [0.502, 8],
  [0.506, 0],
];

// The two channels: the van climbs to the shop, the container truck takes the road below to the port.
const VAN_D = curve([
  [0.512, 0],
  [0.6, UPHILL.length],
]);
// The truck sets off once the van is up the climb, so the two channels part without crossing.
const TRUCK2_X = curve([
  [0.552, X.exportTruck],
  [0.582, 5300],
  [0.624, 6150],
  [0.665, X.crane],
]);
const GATE = [
  [0.598, 0],
  [0.61, -78],
  [0.635, -78],
  [0.648, 0],
];
const SHOPPER = [0.618, 0.65];

// The cranes and the ship. Spreader heights are the container's top; DECK is a container's bottom on a truck.
const HIGH = BOOM + 40;
const DECK = -36;
const ON_TRUCK = DECK - BOX.h;
const ON_SHIP = WATER + SHIP_SLOT.y - BOX.h;
const TROLLEY1 = curve([
  [0.686, X.crane],
  [0.71, X.berth + SHIP_SLOT.x],
]);
const SPREADER1 = [
  [0.665, HIGH],
  [0.674, ON_TRUCK],
  [0.686, HIGH],
  [0.71, HIGH],
  [0.722, ON_SHIP],
  [0.732, HIGH],
];
const SHIP_X = curve([
  [0.734, X.berth],
  [0.756, X.berth + 260],
  [0.88, X.destBerth - 260],
  [0.9, X.destBerth],
]);
const TROLLEY2 = curve([
  [0.922, X.destBerth + SHIP_SLOT.x],
  [0.944, X.destCrane],
]);
const SPREADER2 = [
  [0.9, HIGH],
  [0.91, ON_SHIP],
  [0.922, HIGH],
  [0.944, HIGH],
  [0.954, ON_TRUCK],
  [0.962, HIGH],
];
const TRUCK3_X = curve([
  [0.956, X.destCrane],
  [0.985, X.dcTruck],
]);

// When each part of a drawing is drawn, within the drawing's reveal: outlines first, then details and shade.
const WINDOWS = { "sk-bold": [0, 0.75], "sk-line": [0, 0.75], "sk-fine": [0.25, 0.95], "sk-hatch": [0.5, 1] };

const DEG = 180 / Math.PI;
const round = (value) => Math.round(value * 100) / 100;

/** Linear interpolation in samples taken every 1/(n-1) of progress. */
const sampled = (samples) => (p) => {
  const at = clamp(p) * (samples.length - 1);
  const i = Math.min(samples.length - 2, Math.floor(at));
  return lerp(samples[i], samples[i + 1], at - i);
};

export function createDirector(root) {
  const nodes = {};
  for (const el of root.querySelectorAll("[data-j]")) nodes[el.dataset.j] = el;
  const depthOf = (el) => DEPTH[el.closest("[data-layer]")?.dataset.layer ?? "world"];

  const layers = [...root.querySelectorAll("[data-layer]")].map((el) => ({
    el,
    depth: DEPTH[el.dataset.layer],
    box: el.dataset.box.split(" ").map(Number),
  }));
  const regions = [...root.querySelectorAll("[data-x]")].map((el) => {
    const [x0, x1] = el.dataset.x.split(" ").map(Number);
    return { el, x0, x1, depth: depthOf(el), visible: true };
  });
  const regionOf = new Map(regions.map((region) => [region.el, region]));

  const drawings = [...root.querySelectorAll("[data-draw], [data-during]")].map((el) => {
    const [a, b] = (el.dataset.draw ?? el.dataset.during).split(" ").map(Number);
    const parts = [];
    for (const part of el.querySelectorAll("path, text")) {
      if (part.closest("[data-draw], [data-during]") !== el || part.hasAttribute("data-own")) continue;
      if (part.tagName === "text") parts.push({ el: part, kind: "text", w: [0.55, 1] });
      else if (part.classList.contains("sk-paper")) parts.push({ el: part, kind: "paper", w: [0, 0.3] });
      else if (part.hasAttribute("pathLength")) {
        const w = part.dataset.w?.split(" ").map(Number) ?? WINDOWS[part.classList[0]] ?? [0, 1];
        parts.push({ el: part, kind: "stroke", w });
      }
    }
    // The regions it sits in (itself included): it's left alone while any of them is off screen.
    const within = [];
    for (let node = el; node && node !== root; node = node.parentElement) {
      if (regionOf.has(node)) within.push(regionOf.get(node));
    }
    return { el, during: el.hasAttribute("data-during"), a, b, depth: depthOf(el), parts, within, r: -1 };
  });
  const drawingOf = new Map(drawings.map((drawing) => [drawing.el, drawing]));
  const revealOf = (name) => drawingOf.get(nodes[name])?.r ?? 1;

  // Strokes that aren't part of any drawing are always drawn in full.
  for (const path of root.querySelectorAll("path[pathLength]")) {
    if (!path.closest("[data-draw], [data-during]")) path.setAttribute("stroke-dasharray", "none");
  }

  let view = null;
  let camera = () => 0;
  let frontier = {};
  let rigX = () => 0;
  let rigWheels = rigShape(0).wheels;
  let lastMorph = -1;

  /** Draws a part to `t` (0 = not at all, 1 = in full), in steps fine enough to look continuous. */
  function reveal(part, value) {
    const t = Math.round(value * 80) / 80;
    if (t === part.t) return;
    part.t = t;
    const { el, kind } = part;
    if (kind === "stroke") {
      attr(el, "visibility", t <= 0 ? "hidden" : "visible");
      if (t <= 0) return;
      attr(el, "stroke-dasharray", t >= 1 ? "none" : "1 2");
      attr(el, "stroke-dashoffset", t >= 1 ? "0" : (1 - t).toFixed(4));
    } else attr(el, "fill-opacity", t.toFixed(3));
  }

  const own = (name, t) => {
    const el = nodes[name];
    if (!el) return;
    const part = (el.__part ??= { el, kind: "stroke" });
    reveal(part, clamp(t));
  };

  // Actors are hidden with display (a hidden parent can't hide strokes the reveal marks visible).
  const show = (name, visible) => {
    attr(nodes[name], "display", visible ? "inline" : "none");
    return visible;
  };
  const place = (name, x, y, rotate = 0) => attr(nodes[name], "transform", move(x, y, rotate));

  /** Places a vehicle's wheels ({ x, r } each, drawn at radius 16), rolled by the distance it has covered. */
  function wheels(name, specs, distance) {
    specs.forEach(({ x, r }, k) => {
      const angle = Math.round(((distance / r) * DEG) % 360);
      attr(nodes[`${name}.w${k}`], "transform", `translate(${round(x)} ${round(-r)}) rotate(${angle}) scale(${round(r / 16)})`);
    });
  }

  /** The world's x range on screen, for a layer of depth d. */
  const range = (cx, depth) => [cx * depth - view.U / 2, cx * depth + view.U / 2];

  return {
    measure() {
      const { width, height } = root.getBoundingClientRect();
      const s = Math.min(height / 1000, width / 620);
      view = { W: width, H: height, s, U: width / s, GY: height * 0.93 };
      root.style.setProperty("--u", `${(1 / s).toFixed(4)}px`);
      // Each layer is drawn at the sketch's scale, so the GPU only has to move it.
      for (const { el, box } of layers) {
        el.setAttribute("width", String(Math.ceil(box[2] * s)));
        el.setAttribute("height", String(Math.ceil(box[3] * s)));
      }

      // While the hero is on screen the camera holds still on the open road (the farm just past the right
      // edge, coming into view once the camera moves), and the cargo truck drives from just right of the hero's
      // buttons (stacked wider on phones) towards the screen's right edge, under the portrait.
      const { U } = view;
      const heroLeft = X.farm - 1.05 * U;
      const start = heroLeft + U / 2;
      const [from, to] = width < 640 ? [0.7, 0.94] : [0.56, 0.9];
      rigX = curve([
        [0, heroLeft + from * U],
        [HERO_END, heroLeft + to * U],
        [MORPH[0], 1780],
        [MORPH[1], 2150],
        [0.275, X.parked],
      ]);

      // What the camera follows: the cargo truck, the goods down the line, the forklift, both channels at the fork,
      // the shop, then the container — on the crane, aboard the ship, and on the last truck.
      const subject = (p) => {
        if (p <= HERO_END) return start;
        if (p < 0.275) return rigX(p) + LEAD * U;
        if (p < 0.39) return Math.max(3600, itemAt(0, p).x + 60);
        if (p < 0.436) return X.palletStation;
        if (p < 0.506) return Math.max(X.palletStation, FORK_X(p) + 60);
        if (p < 0.6) return (UPHILL.at(VAN_D(p)).x + TRUCK2_X(p)) / 2 + 60;
        if (p < 0.63) return X.shop + 160;
        if (p < 0.734 || (p >= 0.9 && p < 0.956)) return boxAt(p).x;
        if (p < 0.9) return SHIP_X(p) + 330;
        // Last, the distribution centre settles left of centre, clear of what usually sits on the right there
        return lerp(TRUCK3_X(p) + 60, X.dc + 240 + 0.2 * U, span(p, 0.956, 0.99));
      };
      const raw = Array.from({ length: SAMPLES + 1 }, (_, i) => subject(i / SAMPLES));
      const reach = Math.round(SMOOTHING * SAMPLES);
      const smooth = raw.map((_, i) => {
        let sum = 0;
        for (let k = -reach; k <= reach; k++) sum += raw[Math.min(SAMPLES, Math.max(0, i + k))];
        return sum / (2 * reach + 1);
      });
      camera = sampled(smooth);

      // How far right each layer has been drawn: everything in the first view, then up to AHEAD of the
      // camera's furthest point so far.
      frontier = {};
      for (const depth of new Set(Object.values(DEPTH))) {
        const first = smooth[0] * depth + U / 2 + 60;
        let best = first;
        const marks = smooth.map((cx) => (best = Math.max(best, cx * depth + AHEAD * U)));
        frontier[depth] = { at: sampled(marks), left: smooth[0] * depth - U / 2 - 60 };
      }
    },

    /** Paints the journey at progress p; `intro` (0–1) sketches the first view in when the page opens. */
    paint(p, intro = 1) {
      if (!view) return;
      const { s, W, GY } = view;
      const cx = camera(p);

      for (const { el, depth, box } of layers) {
        const x = W / 2 + (box[0] - cx * depth) * s;
        css(el, "transform", `translate3d(${round(x)}px, ${round(GY + box[1] * s)}px, 0)`);
      }

      for (const region of regions) {
        const [left, right] = range(cx, region.depth);
        const visible = region.x1 > left - MARGIN && region.x0 < right + MARGIN;
        if (visible !== region.visible) {
          region.visible = visible;
          attr(region.el, "display", visible ? "inline" : "none");
        }
      }

      const sweep = ease.inOut(clamp(intro));
      for (const drawing of drawings) {
        if (drawing.within.some((region) => !region.visible)) continue;
        let r;
        if (drawing.during) r = span(p, drawing.a, drawing.b, ease.linear);
        else {
          const { at, left } = frontier[drawing.depth];
          const reach = at(p);
          const pencilAt = sweep < 1 ? left + (reach - left) * sweep : reach;
          r = clamp((pencilAt - drawing.a) / drawing.b);
        }
        if (r === drawing.r) continue;
        drawing.r = r;
        for (const part of drawing.parts) reveal(part, span(r, part.w[0], part.w[1], ease.linear));
      }

      const [left, right] = range(cx, 1);
      const inView = (x0, x1) => x1 > left - MARGIN && x0 < right + MARGIN;

      // The small cargo truck becoming the delivery truck
      const x = rigX(p);
      const m = span(p, MORPH[0], MORPH[1]);
      if (show("rig", inView(x - 200, x + 120))) {
        place("rig", x, ROAD.lane);
        if (m !== lastMorph) {
          lastMorph = m;
          const shape = rigShape(m);
          attr(nodes["rig.body"], "d", shape.d);
          attr(nodes["rig.paper"], "d", shape.d);
          rigWheels = shape.wheels;
        }
        wheels("rig", rigWheels, x);
        const rig = revealOf("rig");
        own("rig.pickup", Math.min(rig, 1 - span(m, 0, 0.45)));
        own("rig.pickupShade", Math.min(rig, 1 - span(m, 0, 0.3)));
        own("rig.truck", Math.min(rig, span(m, 0.45, 1)));
        own("rig.truckShade", Math.min(rig, span(m, 0.5, 1)));
      }

      // Down the production line: pressed, packed, across to the warehouse, stacked on the pallet
      let ram = 0;
      ITEM_STARTS.forEach((start, k) => {
        const name = `item${k}`;
        const active = p >= start && p < PICK;
        if (!active) return show(name, false);
        const { x: ix, y: iy } = itemAt(k, p);
        if (!show(name, inView(ix - 20, ix + 20))) return;
        place(name, ix, iy);
        show(`${name}.raw`, ix < X.press);
        show(`${name}.part`, ix >= X.press && ix < X.packer);
        show(`${name}.box`, ix >= X.packer);
        ram = Math.max(ram, clamp(1 - Math.abs(ix - X.press) / 24));
      });
      place("ram", 0, ram * 46);
      place("smoke", clamp((p - 0.3) * 160, -24, 24), clamp(-(p - 0.3) * 90, -14, 14));

      // The forklift: the new pallet into the racks, a stored one out to the export door
      const fx = FORK_X(p);
      if (show("fork", inView(fx - 50, fx + 110))) {
        place("fork", fx, ROAD.far);
        attr(nodes["fork.forks"], "transform", `translate(0 ${round(-track(p, FORK_LIFT))})`);
        wheels("fork", FORKLIFT_WHEELS, fx);
        show("fork.load", (p >= PICK && p < PUT) || (p >= TAKE && p < LOAD));
      }
      show("station", p < PICK);
      show("rackPut", p >= PUT);
      show("rackTake", p < TAKE);

      // The local channel: the van up to the shop, where a shopper comes out
      const van = UPHILL.at(VAN_D(p));
      if (show("van", inView(van.x - 100, van.x + 100))) {
        place("van", van.x, van.y, van.angle);
        wheels("van", VAN_WHEELS, VAN_D(p));
      }
      const walk = span(p, SHOPPER[0], SHOPPER[1], ease.linear);
      const sx = lerp(X.shop + 252, X.shop + 350, walk);
      if (show("shopper", p >= SHOPPER[0] - 0.004 && inView(sx - 20, sx + 20))) {
        place("shopper", sx, TERRACE + ROAD.far);
        const swing = walk > 0 && walk < 1 ? Math.sin((sx - X.shop) / 7) * 24 : 0;
        attr(nodes["shopper.legA"], "transform", `translate(0 -24) rotate(${round(swing)})`);
        attr(nodes["shopper.legB"], "transform", `translate(0 -24) rotate(${round(-swing)})`);
      }

      // The export channel: the container truck through the port gate to the crane
      const t2 = TRUCK2_X(p);
      if (show("truck2", inView(t2 - 90, t2 + 190))) {
        place("truck2", t2, ROAD.lane);
        wheels("truck2", TRACTOR_WHEELS, t2);
      }
      attr(nodes.gateArm, "transform", `translate(6198 -52) rotate(${round(track(p, GATE))})`);

      // Aboard, across the sea, and ashore
      const bob = span(p, 0.74, 0.76) * (1 - span(p, 0.88, 0.9));
      const shipX = SHIP_X(p);
      const heave = Math.sin(p * 260) * 1.8 * bob;
      if (show("ship", inView(shipX - 20, shipX + 660))) place("ship", shipX, WATER + heave);
      crane("crane1", TROLLEY1(p), track(p, SPREADER1));
      crane("crane2", TROLLEY2(p), track(p, SPREADER2));
      const t3 = TRUCK3_X(p);
      if (show("truck3", inView(t3 - 90, t3 + 190))) {
        place("truck3", t3, ROAD.lane);
        wheels("truck3", TRACTOR_WHEELS, t3);
      }
      const box = boxAt(p);
      if (show("box", inView(box.x - 80, box.x + 80))) {
        place("box", box.x, box.y + (p >= 0.722 && p < 0.91 ? heave : 0));
      }

      // Life along the way
      if (show("buoy", inView(X.buoy - 20, X.buoy + 20))) {
        place("buoy", X.buoy, WATER + Math.sin(p * 300) * 2.2, Math.sin(p * 240) * 5);
      }
      if (show("birds", p < 0.3)) place("birds", 420 + p * 6400, -430 + Math.sin(p * 30) * 8);
      if (show("gulls", p > 0.7 && p < 0.95)) {
        place("gulls", shipX + 430 + Math.sin(p * 50) * 40, -300 + Math.cos(p * 40) * 14);
      }

      function crane(name, tx, top) {
        if (!show(`${name}Rig`, revealOf(name) > 0.6 && inView(tx - 100, tx + 100))) return;
        place(`${name}Rig.trolley`, tx, 0);
        place(`${name}Rig.spreader`, tx, top);
        const from = BOOM + 14;
        attr(nodes[`${name}Rig.cables`], "d", `M${round(tx - 12)} ${from}V${round(top - 18)}M${round(tx + 12)} ${from}V${round(top - 18)}`);
      }
    },
  };
}

/** Where unit of goods `k` is on its way down the line at progress p (its bottom centre). */
function itemAt(k, p) {
  const path = ITEM_ROUTES[k];
  return path.at(Math.min(path.length, Math.max(0, (p - ITEM_STARTS[k]) * ITEM_SPEED)));
}

/** Where the shipment's container is (its bottom centre): on the truck, the cranes, the ship, the last truck. */
function boxAt(p) {
  if (p < 0.674) return { x: TRUCK2_X(p), y: DECK };
  if (p < 0.722) return { x: TROLLEY1(p), y: track(p, SPREADER1) + BOX.h };
  if (p < 0.91) return { x: SHIP_X(p) + SHIP_SLOT.x, y: WATER + SHIP_SLOT.y };
  if (p < 0.954) return { x: TROLLEY2(p), y: track(p, SPREADER2) + BOX.h };
  return { x: TRUCK3_X(p), y: DECK };
}
