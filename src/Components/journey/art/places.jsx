// The places along the journey: the logistics hub, the factory and its production line, the warehouse, the
// two distribution channels (the climb to the shop, the road on to the port), the port and its cranes, and
// the distribution centre across the sea. Moving parts carry a data-j for the director.

import { Drawing, Ink, Label, Paper, Region } from "./draw";
import { Bush, Poplar, Tree } from "./landscape";
import { BOOM, ROAD, TERRACE, UPHILL, X } from "./layout";
import { pencil, random } from "./pen";
import { Person } from "./people";
import { containerStrokes, polyPath, rectPath } from "./shapes";
import { Pallet } from "./vehicles";

const BASE = ROAD.far;

/** A section's broken edge, like a cutaway in a technical drawing: up from the base, across, and down. */
function cutaway(seed, x0, x1, top) {
  const rnd = random(seed);
  const points = [
    [x0, BASE],
    [x0 + 3, top + 14],
  ];
  for (let x = x0 + 20; x < x1 - 14; x += 14 + rnd() * 16) points.push([x, top + (rnd() < 0.5 ? 0 : 9) + rnd() * 4]);
  points.push([x1 - 3, top + 10], [x1, BASE]);
  return points;
}

/** Slatted roller doors. */
function doors(pen, slats, xs, width, height) {
  for (const x of xs) {
    pen.rect(x, BASE - height, width, height, 1);
    for (let y = BASE - height + 8; y < BASE - 4; y += 9) slats.line(x + 3, y, x + width - 3, y, 0);
  }
}

/** A board on two short posts, with lettering. */
function Board({ x, y, w, h = 22, text, size = 12, seed, posts = 0 }) {
  const pen = pencil(seed).rect(x, y, w, h, 1.5);
  if (posts) pen.line(x + 12, y + h, x + 12, y + h + posts, 0).line(x + w - 12, y + h, x + w - 12, y + h + posts, 0);
  return (
    <>
      <Paper d={rectPath(x, y, w, h)} />
      <Ink pen={pen} weight="line" />
      <Label x={x + w / 2} y={y + h / 2 + size * 0.36} size={size} anchor="middle">
        {text}
      </Label>
    </>
  );
}

/** The logistics hub: a low depot with loading doors and parcels waiting outside. */
export function Hub() {
  const x = X.hub;
  const end = X.hubEnd;
  const top = BASE - 114;
  const walls = pencil(1001).rect(x, top, end - x, BASE - top, 3);
  walls.line(x - 6, top - 9, end + 6, top - 9, 2).line(x - 6, top - 9, x - 6, top, 0).line(end + 6, top - 9, end + 6, top, 0);
  const frames = pencil(1002);
  const slats = pencil(1003);
  doors(frames, slats, [x + 46, x + 138, x + 230], 62, 76);
  const crates = pencil(1004);
  let paper = rectPath(x - 6, top - 9, end - x + 12, BASE - top + 9);
  for (const [cx, w, h, lift] of [
    [x - 54, 26, 24, 0],
    [x - 28, 24, 24, 0],
    [x - 44, 24, 22, 24],
  ]) {
    const cy = BASE - lift;
    crates.rect(cx, cy - h, w, h, 1).line(cx, cy - h, cx + w, cy, 0).line(cx + w, cy - h, cx, cy, 0);
    paper += rectPath(cx, cy - h, w, h);
  }
  const soffit = pencil(1005).hatch(
    [
      [x, top],
      [end, top],
      [end, top + 9],
      [x, top + 9],
    ],
    5,
    -60,
  );
  return (
    <Region x0={x - 70} x1={end + 20}>
      <Drawing at={x - 60} len={420}>
        <Paper d={paper} />
        <Ink pen={walls} weight="bold" />
        <Ink pen={frames} weight="line" />
        <Ink pen={slats} weight="hatch" />
        <Ink pen={crates} weight="line" />
        <Ink pen={soffit} weight="hatch" />
        <Board x={end - 112} y={top - 40} w={96} text="HUB" seed={1006} posts={9} />
      </Drawing>
    </Region>
  );
}

const FACTORY_TOP = BASE - 160;
const TOOTH = 120;

/** The factory: walls under a sawtooth roof, the chimney, and a cutaway onto the production line. */
export function Factory() {
  const x = X.factory;
  const end = X.factoryEnd;
  const top = FACTORY_TOP;
  const chimney = pencil(1101).rect(3856, -336, 30, 336 + top, 2).line(3851, -336, 3891, -336, 1);
  chimney.line(3856, -306, 3886, -306, 0).line(3856, -282, 3886, -282, 0);
  const roof = [[x, top]];
  const shade = pencil(1102);
  for (let k = 0; k < (end - x) / TOOTH; k++) {
    const x0 = x + k * TOOTH;
    roof.push([x0 + TOOTH, top - 50], [x0 + TOOTH, top]);
    shade.hatch(
      [
        [x0 + 8, top - 2],
        [x0 + TOOTH - 2, top - 47],
        [x0 + TOOTH - 2, top - 2],
      ],
      8,
      -62,
    );
  }
  const walls = pencil(1103).rect(x, top, end - x, BASE - top, 3).stroke(roof);
  const cut = cutaway(1104, X.line - 20, end - 14, top + 16);
  const slats = pencil(1105);
  const frames = pencil(1106);
  doors(frames, slats, [X.receiving], 80, 88);
  const interior = pencil(1107);
  for (const cx of [3610, 3720, 3830]) interior.line(cx, top + 30, cx, BASE, 0);
  for (const lx of [3586, 3866]) interior.line(lx, top + 22, lx, top + 40, 0).lines([[lx - 9, top + 50], [lx - 5, top + 40], [lx + 5, top + 40], [lx + 9, top + 50]], false, 0.5);
  const belt = pencil(1108).line(X.line, -46, end - 10, -46, 1).line(X.line, -38, end - 10, -38, 1);
  for (let lx = X.line + 20; lx < end - 10; lx += 68) belt.line(lx, -38, lx, BASE, 0);
  const press = pencil(1109).line(X.press - 26, BASE, X.press - 26, -140, 1).line(X.press + 26, BASE, X.press + 26, -140, 1);
  const crown = pencil(1110).rect(X.press - 36, -152, 72, 20, 1.5);
  const crownShade = pencil(1111).hatch(
    [
      [X.press - 36, -152],
      [X.press + 36, -152],
      [X.press + 36, -132],
      [X.press - 36, -132],
    ],
    5,
    -55,
  );
  const ram = pencil(1112).line(X.press, -200, X.press, -126, 0).rect(X.press - 13, -126, 26, 20, 1);
  return (
    <Region x0={x - 20} x1={end + 20}>
      <Drawing at={x - 20} len={520}>
        <Ink pen={chimney} weight="line" />
        <Paper d={`${rectPath(x, top, end - x, BASE - top)}${polyPath(roof.concat([[end, top]]))}`} />
        <Ink pen={walls} weight="bold" />
        <Ink pen={shade} weight="hatch" />
        <Ink pen={frames} weight="line" />
        <Ink pen={slats} weight="hatch" />
        <Label x={X.receiving + 40} y={-112} size={9} anchor="middle">
          RECEIVING
        </Label>
        <Board x={3700} y={top + 3} w={112} h={20} text="FACTORY" seed={1113} />
        <Ink pen={pencil(1114).stroke(cut)} weight="bold" w="0.1 0.7" />
        <Ink pen={interior} weight="hatch" w="0.3 1" />
        <g transform={`translate(3732 ${BASE})`}>
          <Person seed={1115} cap />
        </g>
        <Ink pen={belt} weight="line" w="0.3 0.9" />
        <Ink pen={press} weight="line" w="0.3 0.9" />
        <g data-j="ram">
          <Paper d={rectPath(X.press - 13, -126, 26, 20)} />
          <Ink pen={ram} weight="line" w="0.3 0.9" />
        </g>
        <Paper d={rectPath(X.press - 36, -152, 72, 20)} />
        <Ink pen={crown} weight="line" w="0.3 0.9" />
        <Ink pen={crownShade} weight="hatch" w="0.5 1" />
      </Drawing>
      <g data-j="smoke">
        <Drawing at={3700} len={300}>
          <Ink
            pen={pencil(1116)
              .stroke(
                [
                  [3871, -346],
                  [3861, -368],
                  [3880, -388],
                  [3866, -410],
                  [3893, -430],
                  [3881, -454],
                  [3910, -474],
                ],
                true,
              )
              .stroke(
                [
                  [3886, -352],
                  [3903, -372],
                  [3892, -394],
                  [3918, -416],
                ],
                true,
              )}
            weight="fine"
          />
        </Drawing>
      </g>
    </Region>
  );
}

/** The packing machine's housing: drawn over the production line, so goods go in loose and come out boxed. */
export function Packer() {
  const pen = pencil(1121).rect(X.packer - 32, -110, 64, 64, 1.5).rect(X.packer - 16, -100, 32, 14, 0.5);
  return (
    <Drawing at={X.factory - 20} len={520}>
      <Paper d={rectPath(X.packer - 32, -110, 64, 64)} />
      <Ink pen={pen} weight="line" w="0.3 0.9" />
      <Label x={X.packer} y={-58} size={9} anchor="middle">
        PACK
      </Label>
    </Drawing>
  );
}

/** One unit of goods on the production line: a raw blank, then a machined part, then a carton. */
export function Item({ j, seed }) {
  const hex = [
    [-11, -8],
    [-6, -16],
    [6, -16],
    [11, -8],
    [6, 0],
    [-6, 0],
  ];
  return (
    <g data-j={j}>
      <g data-j={`${j}.raw`}>
        <circle className="sk-paper" cy="-8" r="8" />
        <Ink pen={pencil(seed).circle(0, -8, 8)} weight="line" />
      </g>
      <g data-j={`${j}.part`}>
        <Paper d={polyPath(hex)} />
        <Ink pen={pencil(seed + 1).lines(hex, true, 0.8).circle(0, -8, 3)} weight="line" />
      </g>
      <g data-j={`${j}.box`}>
        <Paper d={rectPath(-14, -18, 28, 18)} />
        <Ink pen={pencil(seed + 2).rect(-14, -18, 28, 18, 0.8).line(0, -18, 0, -11, 0)} weight="line" />
      </g>
    </g>
  );
}

/** The covered conveyor carrying finished goods across from the factory to the warehouse. */
export function Bridge() {
  const x0 = X.bridge - 14;
  const x1 = X.warehouse + 14;
  const pen = pencil(1131).line(x0, -72, x1, -72, 2).line(x0, -66, x1, -66, 1).line(x0, -34, x1, -34, 1);
  pen.line(x0, -46, x1, -46, 0);
  const truss = [];
  for (let x = x0; x <= x1; x += 26) truss.push([x, (x - x0) % 52 ? -34 : -66]);
  const legs = pencil(1132).line(3966, -34, 3966, BASE, 1).line(4050, -34, 4050, BASE, 1);
  legs.line(3966, -34, 4050, BASE, 0).line(4050, -34, 3966, BASE, 0);
  return (
    <Drawing at={x0} len={240} x={[x0, x1]}>
      <Ink pen={pen} weight="line" />
      <Ink pen={pencil(1133).stroke(truss)} weight="fine" w="0.2 1" />
      <Ink pen={legs} weight="fine" />
    </Drawing>
  );
}

const RACK_LEVELS = [BASE, -66, -116];

/** The warehouse: a barrel-roofed shed, cut away to show the racks, with the export door at its end. */
export function Warehouse() {
  const x = X.warehouse;
  const end = X.warehouseEnd;
  const top = -196;
  const arch = [];
  for (let k = 0; k <= 16; k++) {
    const t = k / 16;
    arch.push([x - 8 + t * (end - x + 16), top - 50 * Math.sin(Math.PI * t)]);
  }
  const walls = pencil(1201).rect(x, top, end - x, BASE - top, 3).stroke(arch, true).line(x - 8, top, end + 8, top, 0);
  const roofShade = pencil(1202);
  for (let k = 9; k < 16; k++) roofShade.line(arch[k][0], arch[k][1] + 4, arch[k][0] - 6, top - 2, 0);
  const cut = cutaway(1203, x + 18, X.racks + 260, top + 14);
  const inside = pencil(1204);
  for (const cx of [4180, 4300]) inside.line(cx, top + 34, cx, BASE, 0);
  const conveyor = pencil(1205).line(x, -46, X.palletStation - 23, -46, 1).line(x, -38, X.palletStation - 23, -38, 1);
  conveyor.line(x + 40, -38, x + 40, BASE, 0).line(x + 90, -38, x + 90, BASE, 0);
  const rack = pencil(1206);
  for (const ux of [X.racks, X.racks + 110, X.racks + 220]) rack.line(ux, BASE, ux, -170, 1).line(ux + 4, BASE, ux + 4, -170, 1);
  for (const by of [-66, -116, -166]) rack.line(X.racks, by, X.racks + 224, by, 1).line(X.racks, by + 4, X.racks + 224, by + 4, 0);
  const door = pencil(1207).rect(X.exportDoor, BASE - 90, 80, 90, 1.5);
  const dark = pencil(1208).hatch(
    [
      [X.exportDoor, BASE - 90],
      [X.exportDoor + 80, BASE - 90],
      [X.exportDoor + 80, BASE],
      [X.exportDoor, BASE],
    ],
    6,
    -60,
  );
  const slot = (column, level) => [X.racks + 25 + column * 110, RACK_LEVELS[level]];
  return (
    <Region x0={x - 20} x1={end + 20}>
      <Drawing at={x - 20} len={560}>
        <Paper d={`${rectPath(x, top, end - x, BASE - top)}${polyPath(arch)}`} />
        <Ink pen={walls} weight="bold" />
        <Ink pen={roofShade} weight="hatch" />
        <Board x={4360} y={-238} w={140} text="WAREHOUSE" seed={1209} />
        <Ink pen={door} weight="line" />
        <Ink pen={dark} weight="hatch" />
        <Label x={X.exportDoor + 40} y={BASE - 98} size={9} anchor="middle">
          EXPORT
        </Label>
        <Ink pen={pencil(1210).stroke(cut)} weight="bold" w="0.1 0.7" />
        <Ink pen={inside} weight="hatch" w="0.3 1" />
        <Ink pen={conveyor} weight="line" w="0.3 0.9" />
        <Ink pen={rack} weight="line" w="0.3 0.9" />
        {[
          [0, 0],
          [0, 1],
          [1, 1],
          [1, 2],
        ].map(([column, level]) => {
          const [px, py] = slot(column, level);
          return <Pallet key={`${column}${level}`} x={px} y={py} seed={1220 + column * 10 + level} />;
        })}
      </Drawing>
      {/* The pallets the forklift moves: one waiting at the station, one taken from the rack, one put away */}
      <g data-j="station">
        <Ink pen={pencil(1240).rect(X.palletStation - 30, BASE - 8, 60, 8, 1)} weight="line" />
      </g>
      <Pallet j="rackTake" x={slot(1, 0)[0]} y={BASE} seed={1242} />
      <Pallet j="rackPut" x={slot(0, 2)[0]} y={-116} seed={1244} />
    </Region>
  );
}

/** The local-delivery dock: a canopy beside the warehouse, where the van loads. */
export function Canopy() {
  const x0 = X.canopy - 10;
  const x1 = X.canopy + 230;
  const pen = pencil(1301).rect(x0, -138, x1 - x0, 12, 2).line(X.canopy + 2, BASE, X.canopy + 2, -126, 1);
  pen.line(x1 - 12, BASE, x1 - 12, -126, 1);
  const soffit = pencil(1302).hatch(
    [
      [x0 + 4, -126],
      [x1 - 4, -126],
      [x1 - 4, -120],
      [x0 + 4, -120],
    ],
    5,
    -60,
  );
  return (
    <Drawing at={x0} len={300} x={[x0, x1]}>
      <Paper d={rectPath(x0, -138, x1 - x0, 12)} />
      <Ink pen={pen} weight="line" />
      <Ink pen={soffit} weight="hatch" />
      <Board x={X.canopy + 50} y={-166} w={100} text="LOCAL" seed={1303} posts={6} />
    </Drawing>
  );
}

const CLIMB = [];
for (let d = 0; d <= UPHILL.length; d += 10) CLIMB.push(UPHILL.at(d));

/** Where the climb's near edge (the wall's top) is at height y, from the left. */
function climbX(y) {
  for (let i = 1; i < CLIMB.length; i++) {
    const a = CLIMB[i - 1].y + ROAD.near;
    const b = CLIMB[i].y + ROAD.near;
    if (a >= y && b <= y) return CLIMB[i - 1].x + ((CLIMB[i].x - CLIMB[i - 1].x) * (a - y)) / (a - b || 1);
  }
  return X.terrace;
}

/**
 * The fork: the road splits, one branch climbing to the shop on the terrace, the other running on below
 * it to the port. The terrace is held up by a stone wall, and a signpost points the two ways.
 */
export function Fork() {
  const climbing = CLIMB.filter((s) => s.x >= X.fork && s.x <= X.terrace);
  const farEdge = climbing.filter((s) => s.y < -2).map((s) => [s.x, s.y + ROAD.far]);
  const nearEdge = climbing.filter((s) => s.y + ROAD.near < BASE).map((s) => [s.x, s.y + ROAD.near]);
  farEdge.push([X.terraceEnd, TERRACE + ROAD.far]);
  nearEdge.push([X.terraceEnd, TERRACE + ROAD.near]);
  const slopeNear = [
    [X.terraceEnd, TERRACE + ROAD.near],
    [X.terraceEnd + 50, -110],
    [X.terraceEnd + 92, -48],
    [X.terraceEnd + 122, BASE],
  ];
  const slopeFar = [
    [X.terraceEnd, TERRACE + ROAD.far],
    [X.terraceEnd + 64, -140],
    [X.terraceEnd + 124, -70],
    [X.terraceEnd + 160, BASE],
  ];
  const slopeAt = (y) => {
    for (let i = 1; i < slopeNear.length; i++) {
      const [x0, y0] = slopeNear[i - 1];
      const [x1, y1] = slopeNear[i];
      if (y >= y0 && y <= y1) return x0 + ((x1 - x0) * (y - y0)) / (y1 - y0);
    }
    return X.terraceEnd;
  };
  // Stone courses, the joints staggered
  const stones = pencil(1401);
  let row = 0;
  for (let y = BASE - 14; y > TERRACE + ROAD.near + 6; y -= 16, row++) {
    const left = climbX(y) + 4;
    const right = slopeAt(y) - 4;
    if (right - left < 20) continue;
    stones.line(left, y, right, y, 0);
    for (let jx = left + (row % 2 ? 22 : 44); jx < right - 10; jx += 46) stones.line(jx, y, jx, Math.min(BASE, y + 16), 0);
  }
  const post = pencil(1402).line(X.fork - 30, BASE, X.fork - 30, -120, 1);
  const up = [
    [X.fork - 24, -120],
    [X.fork + 44, -120],
    [X.fork + 56, -111],
    [X.fork + 44, -102],
    [X.fork - 24, -102],
  ];
  const on = [
    [X.fork - 24, -94],
    [X.fork + 34, -94],
    [X.fork + 46, -85],
    [X.fork + 34, -76],
    [X.fork - 24, -76],
  ];
  post.lines(on, true, 1);
  const tilted = pencil(1403).lines(up, true, 1);
  return (
    <Region x0={X.fork - 80} x1={X.terraceEnd + 180}>
      <Drawing at={X.fork - 60} len={640}>
        <Paper
          d={polyPath(
            [[X.fork, BASE]].concat(
              nearEdge,
              slopeNear.slice(1),
              [[X.terraceEnd + 122, BASE]],
            ),
          )}
        />
        <Ink pen={pencil(1404).stroke(farEdge, true).stroke(slopeFar, true)} weight="fine" w="0 0.8" />
        <Ink pen={pencil(1405).stroke(nearEdge, true).stroke(slopeNear, true)} weight="bold" w="0 0.8" />
        <Ink pen={stones} weight="hatch" w="0.4 1" />
        <Paper d={`${polyPath(on)}`} />
        <Ink pen={post} weight="line" />
        <Label x={X.fork + 8} y={-81.5} size={9} anchor="middle">
          PORT
        </Label>
        <g transform={`rotate(-12 ${X.fork - 24} -111)`}>
          <Paper d={polyPath(up)} />
          <Ink pen={tilted} weight="line" />
          <Label x={X.fork + 14} y={-107.5} size={9} anchor="middle">
            RETAIL
          </Label>
        </g>
      </Drawing>
    </Region>
  );
}

/** Products filling one shelf of the shop window (x0 to x1, around the window's middle bar at gap), at height y. */
function shelf(seed, x0, x1, gap, y) {
  const rnd = random(seed);
  const pen = pencil(seed);
  for (let x = x0; x < x1; ) {
    if (x > gap - 10 && x < gap + 8) {
      x = gap + 8;
      continue;
    }
    const kind = Math.floor(rnd() * 4);
    const [w, h] = [
      [8, 12],
      [10, 15],
      [14, 17],
      [6, 18],
    ][kind];
    pen.rect(x, y - h, w, h, 0.4);
    if (kind === 1) pen.line(x - 1, y - h + 3, x + w + 1, y - h + 3, 0);
    if (kind === 3) pen.line(x + 3, y - h, x + 3, y - h - 5, 0);
    x += w + 3 + rnd() * 5;
  }
  return pen;
}

/** The shop at the end of the local channel, on the terrace; its shelves fill once the van has been. */
export function Shop() {
  const base = TERRACE + ROAD.far;
  const x = X.shop;
  const end = x + 320;
  const top = base - 130;
  const walls = pencil(1501).rect(x, top, end - x, base - top, 3).line(x - 6, top - 8, end + 6, top - 8, 2);
  walls.line(x - 6, top - 8, x - 6, top, 0).line(end + 6, top - 8, end + 6, top, 0);
  const front = pencil(1502).rect(x + 24, base - 78, 172, 60, 1).line(x + 110, base - 78, x + 110, base - 18, 0.5);
  front.rect(x + 226, base - 84, 52, 84, 1).rect(x + 12, base - 96, 196, 16, 1);
  const fine = pencil(1503).line(x + 28, base - 58, x + 192, base - 58, 0).line(x + 28, base - 38, x + 192, base - 38, 0);
  fine.line(x + 234, base - 46, x + 234, base - 34, 0);
  for (let sx = x + 26; sx < x + 208; sx += 14) fine.line(sx, base - 94, sx, base - 82, 0);
  for (let sx = x + 19; sx < x + 208; sx += 14) fine.arc(sx, base - 80, 7, 0, 180, 5);
  fine.rect(x + 236, base - 74, 32, 12, 0.4);
  const planter = pencil(1504).lines(
    [
      [x + 290, base],
      [x + 287, base - 14],
      [x + 315, base - 14],
      [x + 312, base],
    ],
    false,
    0.5,
  );
  planter.circle(x + 301, base - 26, 14, 11);
  return (
    <Region x0={x - 20} x1={end + 120}>
      <Drawing at={x - 20} len={420}>
        <Paper d={rectPath(x - 6, top - 8, end - x + 12, base - top + 8)} />
        <Ink pen={walls} weight="bold" />
        <Ink pen={front} weight="line" />
        <Ink pen={fine} weight="fine" />
        <Ink pen={planter} weight="fine" />
        <Board x={x + 60} y={top + 6} w={200} h={20} text="MARKET" size={13} seed={1505} />
        <Label x={x + 252} y={base - 65} size={8} anchor="middle">
          OPEN
        </Label>
      </Drawing>
      {[18, 38, 58].map((rise, k) => (
        <Drawing key={rise} during={[0.596 + k * 0.009, 0.608 + k * 0.009]}>
          <Ink pen={shelf(1510 + k, x + 32, x + 186, x + 110, base - rise)} weight="fine" />
        </Drawing>
      ))}
    </Region>
  );
}

/** The port's gatehouse and barrier, and the container yard. */
export function Port() {
  const booth = pencil(1601).rect(6150, -84, 40, 68, 1.5).line(6144, -86, 6196, -86, 2).rect(6158, -74, 24, 16, 0.5);
  booth.line(6198, BASE, 6198, -52, 1);
  const arm = pencil(1602).line(0, 0, 104, 0, 1);
  for (let k = 10; k < 100; k += 18) arm.line(k, 3, k + 6, -3, 0);
  const yard = pencil(1603);
  const ribs = pencil(1604);
  let paper = "";
  for (const [x, y, tiers] of [
    [6262, -30, 2],
    [6200, BASE, 1],
  ]) {
    for (let t = 0; t < tiers; t++) {
      containerStrokes(yard, ribs, x, y - t * 62);
      paper += rectPath(x, y - t * 62 - 62, 150, 62);
    }
  }
  const quay = pencil(1605).line(X.quay, ROAD.near, X.quay, 70, 2).rect(X.quay - 22, 4, 10, 8, 0.5).line(X.quay - 26, 4, X.quay - 8, 4, 0);
  quay.rect(X.quay, 22, 6, 14, 0).rect(X.quay, 46, 6, 14, 0);
  return (
    <Region x0={6120} x1={7420}>
      <Drawing at={6100} len={420}>
        <Paper d={`${paper}${rectPath(6150, -84, 40, 68)}`} />
        <Ink pen={yard} weight="line" />
        <Ink pen={ribs} weight="fine" />
        <Ink pen={booth} weight="line" />
        <Label x={6170} y={-94} size={11} anchor="middle">
          PORT
        </Label>
        <Ink pen={quay} weight="line" />
      </Drawing>
      <g data-j="gateArm" transform="translate(6198 -52)">
        <Drawing at={6100} len={420}>
          <Ink pen={arm} weight="line" />
        </Drawing>
      </g>
    </Region>
  );
}

// The cranes' portal over the quay and apex above, set from the boom (see layout.js).
const PORTAL = BOOM + 18;
const APEX = BOOM - 110;

/**
 * A ship-to-shore crane: legs over the quay, a boom reaching out over the water (to the right, or to the
 * left with dir = -1), and its machinery house. The trolley and spreader are separate (CraneRig).
 */
export function Crane({ j, x, dir = 1, seed }) {
  const at = (dx) => x + dx * dir;
  const top = BOOM - 12;
  const pen = pencil(seed);
  for (const leg of [-90, 90]) {
    pen.line(at(leg - 4), ROAD.near, at(leg - 4), PORTAL, 2).line(at(leg + 4), ROAD.near, at(leg + 4), PORTAL, 2);
  }
  pen.line(at(-100), PORTAL, at(100), PORTAL, 2).line(at(-100), PORTAL + 8, at(100), PORTAL + 8, 1);
  pen.line(at(-240), top, at(640), top, 2).line(at(-240), BOOM, at(640), BOOM, 1);
  pen.line(at(-90), top, at(-22), APEX, 1.5).line(at(90), top, at(22), APEX, 1.5).line(at(-22), APEX, at(22), APEX, 1);
  const lattice = [];
  for (let dx = -240; dx <= 640; dx += 32) lattice.push([at(dx), (dx + 240) % 64 ? BOOM : top]);
  const fine = pencil(seed + 1).stroke(lattice);
  fine.line(at(22), APEX, at(640), top, 0).line(at(-22), APEX, at(-240), top, 0);
  const brace = PORTAL + 80;
  fine.line(at(-86), PORTAL + 8, at(86), brace, 0).line(at(-86), brace, at(86), PORTAL + 8, 0).line(at(-86), brace, at(86), brace, 0);
  const house = [Math.min(at(-212), at(-132)), top - 28, 80, 28];
  const bogies = [Math.min(at(-104), at(-76)), Math.min(at(76), at(104))];
  pen.rect(...house, 1.5);
  for (const bx of bogies) pen.rect(bx, ROAD.near - 8, 28, 10, 0.5);
  const shade = pencil(seed + 2).hatch(
    [
      [house[0], house[1]],
      [house[0] + 80, house[1]],
      [house[0] + 80, house[1] + 28],
      [house[0], house[1] + 28],
    ],
    5,
    -60,
  );
  const left = Math.min(at(-240), at(640));
  return (
    <Drawing at={left - 20} len={560} x={[left - 20, Math.max(at(-240), at(640)) + 20]} data-j={j}>
      <Paper d={`${rectPath(...house)}${bogies.map((bx) => rectPath(bx, ROAD.near - 8, 28, 10)).join("")}`} />
      <Ink pen={pen} weight="line" />
      <Ink pen={fine} weight="fine" w="0.2 1" />
      <Ink pen={shade} weight="hatch" w="0.5 1" />
    </Drawing>
  );
}

/** A crane's trolley, hoist cables and spreader — placed by the director, shown once its crane is drawn. */
export function CraneRig({ j }) {
  return (
    <g data-j={j}>
      <path data-j={`${j}.cables`} className="sk-fine" />
      <g data-j={`${j}.trolley`}>
        <Paper d={rectPath(-22, BOOM, 44, 14)} />
        <Ink pen={pencil(1701).rect(-22, BOOM, 44, 14, 0.5)} weight="line" />
      </g>
      <g data-j={`${j}.spreader`}>
        <Paper d={`${rectPath(-77, -9, 154, 9)}${rectPath(-14, -18, 28, 9)}`} />
        <Ink pen={pencil(1702).rect(-77, -9, 154, 9, 1).rect(-14, -18, 28, 9, 0.5)} weight="line" />
      </g>
    </g>
  );
}

/** A street lamp. */
function Lamp({ x, seed }) {
  const pen = pencil(seed).line(x, BASE, x, -132, 1).line(x, -132, x + 20, -138, 0.5);
  pen.lines(
    [
      [x + 14, -136],
      [x + 28, -136],
      [x + 25, -130],
      [x + 17, -130],
    ],
    true,
    0,
  );
  return (
    <Drawing at={x - 10} len={120}>
      <Ink pen={pen} weight="line" />
    </Drawing>
  );
}

/** The far quay, its customs gate, the distribution centre and the "delivered" stamp at the very end. */
export function Destination() {
  const quay = pencil(1801).line(X.destQuay, ROAD.near, X.destQuay, 70, 2).rect(X.destQuay + 12, 4, 10, 8, 0.5);
  quay.line(X.destQuay + 8, 4, X.destQuay + 26, 4, 0).rect(X.destQuay - 6, 22, 6, 14, 0).rect(X.destQuay - 6, 46, 6, 14, 0);
  const booth = pencil(1802).rect(10250, -84, 44, 68, 1.5).line(10244, -86, 10300, -86, 2).rect(10258, -74, 28, 16, 0.5);
  const x = X.dc;
  const end = X.dc + 480;
  const top = -150;
  const dc = pencil(1803).rect(x, top, end - x, BASE - top, 3).line(x - 6, top - 8, end + 6, top - 8, 2);
  dc.line(x - 6, top - 8, x - 6, top, 0).line(end + 6, top - 8, end + 6, top, 0).rect(end - 80, top + 18, 58, 30, 0.5);
  const frames = pencil(1804);
  const slats = pencil(1805);
  doors(frames, slats, [x + 60, x + 170, x + 280], 70, 82);
  const windows = pencil(1806).line(end - 61, top + 18, end - 61, top + 48, 0).line(end - 41, top + 18, end - 41, top + 48, 0);
  const stamp = pencil(1807).rect(10668, -262, 144, 40, 1.5).rect(10673, -257, 134, 30, 0.5);
  stamp.stroke([
    [10684, -244],
    [10690, -236],
    [10702, -252],
  ]);
  return (
    <Region x0={X.destQuay - 40} x1={X.end}>
      <Drawing at={X.destQuay - 40} len={600}>
        <Paper d={`${rectPath(x - 6, top - 8, end - x + 12, BASE - top + 8)}${rectPath(10250, -84, 44, 68)}`} />
        <Ink pen={quay} weight="line" />
        <Ink pen={booth} weight="line" />
        <Label x={10272} y={-94} size={10} anchor="middle">
          CUSTOMS
        </Label>
        <Ink pen={dc} weight="bold" />
        <Ink pen={frames} weight="line" />
        <Ink pen={slats} weight="hatch" />
        <Ink pen={windows} weight="fine" />
        <Board x={x + 120} y={top - 38} w={240} h={24} text="DISTRIBUTION CENTRE" size={11} seed={1808} posts={6} />
      </Drawing>
      <Lamp x={10400} seed={1811} />
      <Lamp x={11030} seed={1812} />
      <Bush x={11050} w={26} seed={1813} />
      <Tree x={11120} size={0.9} seed={1815} />
      <Poplar x={11200} seed={1818} />
      <Drawing during={[0.968, 0.992]}>
        <Paper d={rectPath(10668, -262, 144, 40)} />
        <Ink pen={stamp} weight="line" />
        <Label x={10752} y={-237} size={13} anchor="middle">
          DELIVERED
        </Label>
      </Drawing>
    </Region>
  );
}

/** A marker buoy, bobbing on the swell (placed by the director). */
export function Buoy() {
  const pen = pencil(1901).lines(
    [
      [-9, 0],
      [0, -26],
      [9, 0],
    ],
    true,
    1,
  );
  pen.line(0, -26, 0, -40, 0).circle(0, -44, 4);
  return (
    <g data-j="buoy">
      <Drawing at={X.buoy - 20} len={120}>
        <Paper d="M-9 0L0 -26L9 0Z" />
        <Ink pen={pen} weight="line" />
      </Drawing>
    </g>
  );
}

/** A few birds flying in a loose V (the director moves them). */
export function Birds({ j, count = 3, seed }) {
  const pen = pencil(seed);
  const rnd = random(seed);
  for (let k = 0; k < count; k++) {
    const bx = k * 34 + rnd() * 10;
    const by = (k % 2) * 16 + rnd() * 6;
    const w = 7 + rnd() * 3;
    pen.raw(
      `M${(bx - w).toFixed(1)} ${by.toFixed(1)}Q${(bx - w / 2).toFixed(1)} ${(by - 5).toFixed(1)} ${bx.toFixed(1)} ${by.toFixed(1)}Q${(bx + w / 2).toFixed(1)} ${(by - 5).toFixed(1)} ${(bx + w).toFixed(1)} ${by.toFixed(1)}`,
      w * 2.3,
    );
  }
  return (
    <g data-j={j}>
      <Ink pen={pen} weight="line" />
    </g>
  );
}

