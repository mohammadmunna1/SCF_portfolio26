// The world around the journey: the sky, the distant ranges and hills (parallax layers, in their own x), the
// countryside, the road and the sea.

import { Drawing, Ink, Label, Paper, Region } from "./draw";
import { DEPTH, ROAD, WATER, X } from "./layout";
import { pencil, random } from "./pen";
import { rectPath } from "./shapes";

const r1 = (value) => Math.round(value * 10) / 10;

/** Points of a rolling line from x0 to x1, around `base`, rising up to `amp` above it. */
function rolling(seed, x0, x1, step, base, amp) {
  const rnd = random(seed);
  const points = [];
  for (let x = x0; x < x1; x += step * (0.7 + rnd() * 0.6)) points.push([x, base - rnd() * amp]);
  points.push([x1, base - rnd() * amp]);
  return points;
}

/** Height of a polyline at x (linear between its points). */
function heightAt(points, x) {
  for (let i = 1; i < points.length; i++) {
    if (points[i][0] >= x) {
      const [x0, y0] = points[i - 1];
      const [x1, y1] = points[i];
      return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0 || 1);
    }
  }
  return points[points.length - 1][1];
}

/**
 * A long line drawn in pieces, so each piece can be skipped off screen and the pencil draws it continuously:
 * each piece's reveal runs across its own width. Smooth pieces share their tangents, so the joins don't show.
 */
function Line({ points, seed, size = 640, curved = true, weight = "line" }) {
  const pieces = [];
  let start = 0;
  for (let i = 1; i < points.length; i++) {
    if (points[i][0] - points[start][0] >= size || i === points.length - 1) {
      pieces.push([start, i]);
      start = i;
    }
  }
  return pieces.map(([from, to], k) => {
    let d = `M${r1(points[from][0])} ${r1(points[from][1])}`;
    let length = 0;
    for (let i = from; i < to; i++) {
      const [x0, y0] = points[Math.max(0, i - 1)];
      const [x1, y1] = points[i];
      const [x2, y2] = points[i + 1];
      const [x3, y3] = points[Math.min(points.length - 1, i + 2)];
      d += curved
        ? `C${r1(x1 + (x2 - x0) / 6)} ${r1(y1 + (y2 - y0) / 6)} ${r1(x2 - (x3 - x1) / 6)} ${r1(y2 - (y3 - y1) / 6)} ${r1(x2)} ${r1(y2)}`
        : `L${r1(x2)} ${r1(y2)}`;
      length += Math.hypot(x2 - x1, y2 - y1);
    }
    const x0 = points[from][0];
    const x1 = points[to][0];
    return (
      <Drawing key={k} at={x0} len={x1 - x0} x={[x0, x1]}>
        <Ink pen={pencil(seed + k).raw(d, length)} weight={weight} w="0 1" />
      </Drawing>
    );
  });
}

/** A loose closed blob through points around (cx, cy) — tree crowns, bushes, clouds. */
function blob(seed, cx, cy, rx, ry, bumps = 9, flatBottom = false) {
  const rnd = random(seed);
  const points = [];
  for (let k = 0; k <= bumps + 1; k++) {
    const a = Math.PI / 2 + (k / bumps) * Math.PI * 2;
    const wobble = 0.86 + rnd() * 0.24;
    let y = cy + Math.sin(a) * ry * wobble;
    if (flatBottom) y = Math.min(y, cy + ry * 0.35);
    points.push([cx + Math.cos(a) * rx * wobble, y]);
  }
  return points;
}

const closedPath = (points) => {
  let d = `M${r1(points[0][0])} ${r1(points[0][1])}`;
  for (let i = 0; i < points.length - 1; i++) {
    const [x0, y0] = points[Math.max(0, i - 1)];
    const [x1, y1] = points[i];
    const [x2, y2] = points[i + 1];
    const [x3, y3] = points[Math.min(points.length - 1, i + 2)];
    d += `C${r1(x1 + (x2 - x0) / 6)} ${r1(y1 + (y2 - y0) / 6)} ${r1(x2 - (x3 - x1) / 6)} ${r1(y2 - (y3 - y1) / 6)} ${r1(x2)} ${r1(y2)}`;
  }
  return `${d}Z`;
};

/** A broad tree: a lumpy crown with shade hatched on its right, on a short trunk. */
export function Tree({ x, base = ROAD.far, size = 1, seed }) {
  const R = 40 * size;
  const cy = base - 46 * size - R * 0.8;
  const crown = closedPath(blob(seed, x, cy, R, R * 0.82, 10));
  const trunk = pencil(seed + 1)
    .line(x - 5 * size, base, x - 3 * size, cy + R * 0.5, 1)
    .line(x + 6 * size, base, x + 4 * size, cy + R * 0.5, 1);
  trunk.line(x - 2 * size, cy + R * 0.62, x - 14 * size, cy + R * 0.2, 0.5);
  const shade = pencil(seed + 2).hatch(
    [
      [x + R * 0.15, cy - R * 0.5],
      [x + R * 0.8, cy - R * 0.1],
      [x + R * 0.7, cy + R * 0.55],
      [x + R * 0.05, cy + R * 0.6],
    ],
    5.5,
    -50,
  );
  return (
    <Drawing at={x - R} len={2.4 * R + 80} x={[x - R - 10, x + R + 10]}>
      <Ink pen={trunk} weight="line" />
      <Paper d={crown} />
      <Ink pen={pencil(seed + 3).raw(crown, 7 * R)} weight="line" />
      <Ink pen={shade} weight="hatch" />
    </Drawing>
  );
}

/** A tall, narrow poplar. */
export function Poplar({ x, base = ROAD.far, size = 1, seed }) {
  const h = 120 * size;
  const crown = closedPath(blob(seed, x, base - 18 * size - h / 2, 15 * size, h / 2, 12));
  const trunk = pencil(seed + 1).line(x, base, x, base - 30 * size, 0.5);
  const middle = pencil(seed + 2).stroke(
    [
      [x + 2, base - 24 * size],
      [x + 1, base - h * 0.55],
      [x + 3, base - h * 0.9],
    ],
    true,
  );
  return (
    <Drawing at={x - 20} len={140} x={[x - 20, x + 20]}>
      <Ink pen={trunk} weight="line" />
      <Paper d={crown} />
      <Ink pen={pencil(seed + 3).raw(crown, 2.4 * h)} weight="line" />
      <Ink pen={middle} weight="fine" />
    </Drawing>
  );
}

/** A pine: stacked zigzag tiers on a trunk. */
export function Pine({ x, base = ROAD.far, size = 1, seed }) {
  const pen = pencil(seed).line(x, base, x, base - 20 * size, 0.5);
  const tiers = [
    [-20, 34],
    [-50, 28],
    [-76, 21],
    [-98, 13],
  ];
  let paper = "";
  for (const [y, w] of tiers) {
    const points = [
      [x - w * size, base + (y + 6) * size],
      [x, base + (y - 30) * size],
      [x + w * size, base + (y + 6) * size],
    ];
    pen.lines(points, true, 1);
    paper += `M${points.map(([px, py]) => `${r1(px)} ${r1(py)}`).join("L")}Z`;
  }
  return (
    <Drawing at={x - 40} len={160} x={[x - 40, x + 40]}>
      <Paper d={paper} />
      <Ink pen={pen} weight="line" />
    </Drawing>
  );
}

export function Bush({ x, base = ROAD.far, w = 34, seed }) {
  const crown = closedPath(blob(seed, x, base - w * 0.32, w, w * 0.45, 8, true));
  return (
    <Drawing at={x - w} len={120} x={[x - w, x + w]}>
      <Paper d={crown} />
      <Ink pen={pencil(seed + 1).raw(crown, 5 * w)} weight="line" />
    </Drawing>
  );
}

/** Power poles along the road with their wires sagging between them. */
function PowerLine({ poles, seed }) {
  return poles.map((x, k) => {
    const pole = pencil(seed + k * 3).line(x, ROAD.far, x - 2, -150, 1).line(x - 18, -140, x + 16, -141, 1.5);
    pole.line(x - 14, -141, x - 14, -146, 0).line(x + 12, -141, x + 12, -146, 0);
    const next = poles[k + 1];
    const wires = pencil(seed + k * 3 + 1);
    if (next) {
      for (const dx of [-14, 12]) {
        const points = [];
        for (let i = 0; i <= 12; i++) {
          const t = i / 12;
          points.push([x + dx + (next - x) * t, -146 + 22 * 4 * t * (1 - t)]);
        }
        wires.stroke(points, true);
      }
    }
    return (
      <Drawing key={x} at={x - 18} len={next ? next - x : 60} x={[x - 20, next ?? x + 20]}>
        <Ink pen={pole} weight="line" />
        <Ink pen={wires} weight="fine" w="0 1" />
      </Drawing>
    );
  });
}

/** A fence along the far side of the road, from x0 to x1: posts and two rails. */
function Fence({ x0, x1, seed }) {
  const pieces = [];
  for (let start = x0; start < x1; start += 240) {
    const end = Math.min(x1, start + 240);
    const pen = pencil(seed + start);
    for (let x = start; x < end; x += 48) pen.line(x, ROAD.far, x + 1, -40, 1);
    const rails = pencil(seed + start + 1).line(start - 4, -24, end + 4, -25, 0).line(start - 4, -34, end + 4, -33, 0);
    pieces.push(
      <Drawing key={start} at={start} len={end - start + 40} x={[start, end]}>
        <Ink pen={rails} weight="fine" w="0 1" />
        <Ink pen={pen} weight="line" />
      </Drawing>,
    );
  }
  return pieces;
}

/** A barn and silo at the start of the road: where the first load is picked up. */
function Farm() {
  const x = X.farm;
  const base = ROAD.far;
  const walls = [
    [x, base],
    [x, base - 70],
    [x + 60, base - 112],
    [x + 120, base - 70],
    [x + 120, base],
  ];
  const barn = pencil(101).lines(walls, false, 3).line(x - 8, base - 64, x + 60, base - 116, 2);
  barn.line(x + 60, base - 116, x + 128, base - 64, 2);
  const door = pencil(102).rect(x + 36, base - 54, 48, 54, 1).line(x + 36, base - 54, x + 84, base, 0);
  door.line(x + 84, base - 54, x + 36, base, 0).rect(x + 52, base - 92, 16, 13, 0.5);
  const silo = pencil(103).rect(x + 140, base - 136, 40, 136, 2).arc(x + 160, base - 136, 20, 180, 360, 14);
  for (const y of [-112, -88, -64, -40]) silo.line(x + 140, base + y, x + 180, base + y, 0);
  const shade = pencil(104)
    .hatch(
      [
        [x + 168, base - 136],
        [x + 180, base - 136],
        [x + 180, base],
        [x + 168, base],
      ],
      6,
      -60,
    )
    .hatch(
      [
        [x + 60, base - 112],
        [x + 120, base - 70],
        [x + 120, base - 64],
        [x + 92, base - 82],
      ],
      6,
      -60,
    );
  const paper = `M${walls.map(([px, py]) => `${px} ${py}`).join("L")}Z${rectPath(x + 140, base - 136, 40, 136)}`;
  return (
    <Drawing at={x - 20} len={260} x={[x - 20, x + 190]}>
      <Paper d={paper} />
      <Ink pen={barn} weight="bold" />
      <Ink pen={silo} weight="line" />
      <Ink pen={door} weight="fine" />
      <Ink pen={shade} weight="hatch" />
    </Drawing>
  );
}

/** Rows of crops behind the fence. */
function Fields({ x0, x1, seed }) {
  const pieces = [];
  for (let start = x0; start < x1; start += 280) {
    const end = Math.min(x1, start + 280);
    const pen = pencil(seed + start);
    [
      [-46, 15, 7],
      [-55, 12, 5.5],
      [-62, 10, 4],
    ].forEach(([y, step, h]) => {
      for (let x = start; x < end; x += step) pen.line(x, y, x + 1.5, y - h, 0);
    });
    pieces.push(
      <Drawing key={start} at={start} len={end - start} x={[start, end]}>
        <Ink pen={pen} weight="hatch" />
      </Drawing>,
    );
  }
  return pieces;
}

/** A road sign: a post and a board. */
export function Sign({ x, text, base = ROAD.far, seed }) {
  const pen = pencil(seed).line(x, base, x, base - 64, 1).rect(x - 34, base - 92, 68, 26, 1.5);
  return (
    <Drawing at={x - 34} len={160} x={[x - 40, x + 40]}>
      <Paper d={rectPath(x - 34, base - 92, 68, 26)} />
      <Ink pen={pen} weight="line" />
      <Label x={x} y={base - 74.5} size={11} anchor="middle">
        {text}
      </Label>
    </Drawing>
  );
}

/** The road from x0 to x1: its far and near edges. */
export function Road({ x0, x1, seed }) {
  return (
    <>
      <Line points={splitEvenly(x0, x1, ROAD.far).concat([[x1, ROAD.far]])} seed={seed} curved={false} weight="fine" />
      <Line points={splitEvenly(x0, x1, ROAD.near).concat([[x1, ROAD.near]])} seed={seed + 50} curved={false} weight="bold" />
    </>
  );
}

/** Points every ~320 units along a straight line at height y, so it can be drawn in pieces. */
function splitEvenly(x0, x1, y) {
  const points = [];
  for (let x = x0; x < x1; x += 320) points.push([x, y]);
  return points;
}

/** The countryside the journey starts in. */
export function Countryside() {
  return (
    <Region x0={-2400} x1={3200}>
      <Fence x0={650} x1={1820} seed={120} />
      <Farm />
      <Tree x={740} size={1.05} seed={131} />
      <Poplar x={900} seed={141} />
      <Poplar x={936} size={0.86} seed={144} />
      <Fields x0={900} x1={1480} seed={150} />
      <Pine x={1560} seed={161} />
      <Bush x={1640} seed={165} />
      <Sign x={1745} text="HUB  →" seed={171} />
      <PowerLine poles={[700, 1120, 1540]} seed={180} />
      <Tree x={2330} size={0.8} seed={191} />
      <Bush x={2420} w={26} seed={195} />
      <PowerLine poles={[2520, 2940]} seed={200} />
      <Pine x={2700} size={0.9} seed={211} />
      <Sign x={3080} text="FACTORY" seed={215} />
    </Region>
  );
}

/** The sea from the quay to the far quay: its surface and scattered waves. */
export function Sea() {
  const waves = [];
  const rnd = random(301);
  for (let start = X.quay; start < X.destQuay; start += 220) {
    const pen = pencil(310 + start);
    for (let k = 0; k < 5; k++) {
      const x = start + rnd() * 200;
      const y = WATER + 14 + rnd() * 70;
      const w = 8 + rnd() * 10;
      pen.arc(x, y + w * 0.6, w, 230, 310, w * 0.7);
    }
    waves.push(
      <Drawing key={start} at={start} len={240} x={[start, start + 240]}>
        <Ink pen={pen} weight="fine" />
      </Drawing>,
    );
  }
  return (
    <Region x0={X.quay} x1={X.destQuay}>
      <Line points={splitEvenly(X.quay, X.destQuay, WATER).concat([[X.destQuay, WATER]])} seed={300} curved={false} />
      {waves}
    </Region>
  );
}

/** A lighthouse on a rocky islet off the port. */
export function Lighthouse() {
  const x = X.lighthouse;
  const rocks = pencil(401).stroke(
    [
      [x - 110, WATER],
      [x - 86, WATER - 10],
      [x - 60, WATER - 4],
      [x - 34, WATER - 18],
      [x - 10, WATER - 12],
      [x + 22, WATER - 22],
      [x + 50, WATER - 8],
      [x + 80, WATER - 12],
      [x + 108, WATER],
    ],
    true,
  );
  const tower = [
    [x - 17, WATER - 16],
    [x - 9, WATER - 150],
    [x + 9, WATER - 150],
    [x + 17, WATER - 16],
  ];
  const pen = pencil(402).lines(tower, false, 2).rect(x - 9, WATER - 172, 18, 22, 1).line(x - 14, WATER - 150, x + 14, WATER - 150, 2);
  pen.arc(x, WATER - 172, 9, 180, 360, 7).line(x, WATER - 179, x, WATER - 186, 0);
  const bands = pencil(403)
    .hatch(
      [
        [x - 14, WATER - 60],
        [x + 14, WATER - 60],
        [x + 13, WATER - 80],
        [x - 13, WATER - 80],
      ],
      5,
      -55,
    )
    .hatch(
      [
        [x - 11, WATER - 110],
        [x + 11, WATER - 110],
        [x + 10, WATER - 130],
        [x - 10, WATER - 130],
      ],
      5,
      -55,
    );
  const rays = pencil(404).line(x - 18, WATER - 164, x - 40, WATER - 170, 0).line(x + 18, WATER - 164, x + 40, WATER - 170, 0);
  rays.line(x - 16, WATER - 156, x - 34, WATER - 152, 0).line(x + 16, WATER - 156, x + 34, WATER - 152, 0);
  return (
    <Drawing at={x - 120} len={300} x={[x - 120, x + 120]}>
      <Paper d={`M${tower.map(([px, py]) => `${px} ${py}`).join("L")}Z${rectPath(x - 9, WATER - 172, 18, 22)}`} />
      <Ink pen={rocks} weight="line" />
      <Ink pen={pen} weight="line" />
      <Ink pen={bands} weight="hatch" />
      <Ink pen={rays} weight="fine" w="0.7 1" />
    </Drawing>
  );
}

// ——— Parallax layers: x in each layer's own units (a layer of depth d is seen at the camera's x × d) ———

/** The sky: a sun and a few clouds, barely moving. */
export function SkyLayer() {
  const clouds = [
    [240, -500, 70],
    [760, -440, 52],
    [1260, -560, 64],
    [1720, -470, 48],
    [-520, -600, 56],
    [-120, -660, 40],
  ];
  return (
    <>
      <Drawing at={300} len={200}>
        <Ink pen={pencil(501).circle(400, -600, 34, 34, 0.015)} weight="line" />
        <Ink pen={pencil(502).circle(400, -600, 41, 41, 0.03)} weight="hatch" w="0.5 1" />
      </Drawing>
      {clouds.map(([x, y, w], k) => {
        const points = blob(510 + k, x, y, w, w * 0.38, 9, true);
        return (
          <Drawing key={k} at={x - w} len={2 * w + 60}>
            <Ink pen={pencil(520 + k).stroke(points, true)} weight="fine" />
          </Drawing>
        );
      })}
    </>
  );
}

/** Far mountain ranges, giving way to the sea's horizon, and the far coast across the water. */
export function FarLayer() {
  const peaks = [];
  const rnd = random(601);
  for (let x = -1700; x < 2050; x += 70 + rnd() * 90) peaks.push([x, -140 - rnd() * 120]);
  peaks.push([2050, -60], [2140, -24]);
  const shade = pencil(602);
  for (let i = 1; i < peaks.length - 2; i += 3) {
    const [x, y] = peaks[i];
    if (y > -190) continue;
    shade.hatch(
      [
        [x, y + 4],
        [x + 46, y + 70],
        [x + 18, y + 80],
      ],
      7,
      -60,
    );
  }
  const farCoast = rolling(603, 2880, 4400, 120, -24, 70);
  farCoast[0] = [2880, -22];
  return (
    <>
      <Line points={peaks} seed={610} curved={false} weight="fine" />
      <Drawing at={-1700} len={3800}>
        <Ink pen={shade} weight="hatch" />
      </Drawing>
      <Line points={splitEvenly(2140, 4400, -22).concat([[4400, -22]])} seed={640} curved={false} weight="fine" />
      <Line points={farCoast} seed={660} weight="fine" />
    </>
  );
}

/** Nearer hills with trees and farmhouses, the coast, and the destination city's skyline. */
export function MidLayer() {
  const d = DEPTH.mid;
  const hills = rolling(701, -1700, 3880, 150, -50, 64);
  hills.push([3990, -10], [4060, 10]);
  const trees = [];
  const rnd = random(702);
  for (let x = -1600; x < 3700; x += 90 + rnd() * 170) {
    const y = heightAt(hills, x);
    trees.push(
      <Drawing key={x} at={x - 10} len={90}>
        <Ink pen={pencil(710 + Math.round(x)).circle(x, y - 17, 8, 9).line(x, y, x, y - 9, 0)} weight="fine" />
      </Drawing>,
    );
  }
  const houses = [260, 1220, 2380].map((x, k) => {
    const y = heightAt(hills, x) + 4;
    const pen = pencil(760 + k).lines(
      [
        [x, y],
        [x, y - 18],
        [x + 14, y - 30],
        [x + 28, y - 18],
        [x + 28, y],
      ],
      false,
      1.2,
    );
    pen.rect(x + 10, y - 12, 7, 7, 0);
    return (
      <Drawing key={x} at={x - 10} len={90}>
        <Paper d={`M${x} ${y}V${y - 18}L${x + 14} ${y - 30}L${x + 28} ${y - 18}V${y}Z`} />
        <Ink pen={pen} weight="fine" />
      </Drawing>
    );
  });
  const swell = pencil(780);
  for (let x = 4120; x < 5560; x += 60 + random(Math.round(x))() * 80) swell.line(x, 8 + (x % 3) * 6, x + 14, 8 + (x % 3) * 6, 0);
  const shore = rolling(790, 5560, 7700, 140, -44, 60);
  shore[0] = [5560, 10];
  return (
    <>
      <Line points={hills} seed={720} />
      {trees}
      {houses}
      <Drawing at={4120} len={1440}>
        <Ink pen={swell} weight="hatch" />
      </Drawing>
      <Line points={shore} seed={800} />
      <City x0={X.destQuay * d + 80} />
    </>
  );
}

/** The destination city: a skyline of towers, some with rows of windows, and a tall spire. */
function City({ x0 }) {
  const rnd = random(901);
  const outline = pencil(902);
  const windows = pencil(903);
  let paper = "";
  let x = x0;
  const heights = [96, 150, 120, 210, 136, 250, 170, 112, 190, 132, 86];
  heights.forEach((h, k) => {
    const w = 44 + Math.round(rnd() * 30);
    const base = -30;
    outline.rect(x, base - h, w, h, 1.5);
    paper += rectPath(x, base - h, w, h);
    if (k % 2 === 0) {
      for (let y = base - h + 14; y < base - 10; y += 16) windows.line(x + 8, y, x + w - 8, y, 0);
    } else {
      for (let wx = x + 9; wx < x + w - 6; wx += 12) windows.line(wx, base - h + 12, wx, base - 10, 0);
    }
    if (k === 5) outline.line(x + w / 2, base - h, x + w / 2, base - h - 60, 0).line(x + w / 2 - 6, base - h - 30, x + w / 2 + 6, base - h - 30, 0);
    x += w + 6 + Math.round(rnd() * 18);
  });
  return (
    <Drawing at={x0 - 20} len={x - x0 + 40}>
      <Paper d={paper} />
      <Ink pen={outline} weight="fine" />
      <Ink pen={windows} weight="hatch" w="0.4 1" />
    </Drawing>
  );
}
