// The landscape the shipment travels through: sky-side layers (clouds, far ranges, hills) drawn in their
// own parallax coordinates, and the countryside, roads and ground of the world itself. Distant layers are
// paler and bluer (atmospheric perspective); colours shift from dawn through day to dusk along x, matching
// the time the camera passes each place.

import { DEPTH, PORT, RAMP, ROAD, WATER, X } from "./layout";
import { plateau, random, ridge, scatter } from "./shapes";

// The layers' own x for a world x — where to put something so it shows behind that place.
const far = (worldX) => worldX * DEPTH.far.x;
const hills = (worldX) => worldX * DEPTH.hills.x;

/** A group the director hides while it's off screen (x0–x1 in the layer's own units). */
export const Cull = ({ x0, x1, children }) => <g data-x={`${Math.round(x0)} ${Math.round(x1)}`}>{children}</g>;

/** A ridge drawn in pieces, so only the part on screen is painted. */
const Ridge = ({ ridge: { chunks }, fill }) =>
  chunks.map((chunk) => (
    <path key={chunk.x0} data-x={`${Math.round(chunk.x0)} ${Math.round(chunk.x1)}`} d={chunk.d} fill={fill} />
  ));

const circles = (list) =>
  list.map(([cx, cy, r]) => `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`).join("");

/** Shared gradients (in world or layer units, so colour follows place, not each shape). */
export function LandscapeDefs() {
  return (
    <>
      <linearGradient id="j-glass" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#5C7389" />
        <stop offset="0.55" stopColor="#2C3D52" />
        <stop offset="1" stopColor="#223146" />
      </linearGradient>
      {/* Far ranges: dawn blue-grey, day, then dusk violet over the destination */}
      <linearGradient id="j-far-back" gradientUnits="userSpaceOnUse" x1={far(-3000)} y1="0" x2={far(21000)} y2="0">
        <stop offset="0" stopColor="#B4BFCC" />
        <stop offset="0.3" stopColor="#ADBDCD" />
        <stop offset="0.55" stopColor="#B3BCC8" />
        <stop offset="0.8" stopColor="#7D7896" />
        <stop offset="1" stopColor="#4D5274" />
      </linearGradient>
      <linearGradient id="j-far-front" gradientUnits="userSpaceOnUse" x1={far(-3000)} y1="0" x2={far(21000)} y2="0">
        <stop offset="0" stopColor="#97A8BA" />
        <stop offset="0.3" stopColor="#93A8BC" />
        <stop offset="0.55" stopColor="#99A6B6" />
        <stop offset="0.8" stopColor="#5E6084" />
        <stop offset="1" stopColor="#373E5E" />
      </linearGradient>
      <linearGradient
        id="j-hills-back"
        gradientUnits="userSpaceOnUse"
        x1={hills(-3000)}
        y1="0"
        x2={hills(21000)}
        y2="0"
      >
        <stop offset="0" stopColor="#8EA595" />
        <stop offset="0.45" stopColor="#8FA58F" />
        <stop offset="0.55" stopColor="#93A38E" />
        <stop offset="0.8" stopColor="#4A5370" />
        <stop offset="1" stopColor="#363E5C" />
      </linearGradient>
      <linearGradient
        id="j-hills-front"
        gradientUnits="userSpaceOnUse"
        x1={hills(-3000)}
        y1="0"
        x2={hills(21000)}
        y2="0"
      >
        <stop offset="0" stopColor="#7A9580" />
        <stop offset="0.45" stopColor="#7D987C" />
        <stop offset="0.55" stopColor="#7F937A" />
        <stop offset="0.8" stopColor="#353F5B" />
        <stop offset="1" stopColor="#283049" />
      </linearGradient>
      {/* Haze where land meets the distance */}
      <linearGradient id="j-haze" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#EEF0EC" stopOpacity="0" />
        <stop offset="1" stopColor="#EEF0EC" stopOpacity="0.55" />
      </linearGradient>
      <linearGradient id="j-cloud" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.95" />
        <stop offset="1" stopColor="#F3EEE6" stopOpacity="0.75" />
      </linearGradient>
    </>
  );
}

/** Soft cumulus made of overlapping circles with a flat, shaded base. */
function Cloud({ x, y, s = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path
        d={circles([
          [-70, -6, 30],
          [-30, -22, 40],
          [20, -30, 46],
          [66, -12, 32],
          [92, 2, 20],
        ])}
        fill="url(#j-cloud)"
      />
      <path d="M-104 6H116Q118 14 108 16H-96Q-106 14 -104 6Z" fill="#E2DFDA" opacity="0.7" />
    </g>
  );
}

export function Clouds() {
  const list = scatter(-2600, 3800, 16, 41);
  return (
    <g>
      {list.map(({ x, a, b, c }) => (
        <Cloud key={x} x={x} y={-640 + a * 300} s={0.55 + b * 0.75 + (c > 0.8 ? 0.4 : 0)} />
      ))}
    </g>
  );
}

const FAR = {
  back: ridge({
    x0: far(-14000),
    x1: far(12600),
    base: 150,
    height: 330,
    step: 26,
    seed: 11,
    profile: plateau(-9999, far(12450), 160),
  }),
  front: ridge({
    x0: far(-14000),
    x1: far(12500),
    base: 150,
    height: 210,
    step: 22,
    seed: 23,
    profile: plateau(-9999, far(12300), 140),
  }),
  destBack: ridge({
    x0: far(12800),
    x1: far(36000),
    base: 60,
    height: 250,
    step: 26,
    seed: 31,
    profile: plateau(far(16400), 99999, 300),
  }),
  destFront: ridge({
    x0: far(12900),
    x1: far(36000),
    base: 60,
    height: 150,
    step: 22,
    seed: 37,
    profile: plateau(far(16600), 99999, 240),
  }),
};

/** The far ranges: mountains behind the countryside and the plant, falling to the coast; hills across the sea. */
export function FarRange() {
  return (
    <>
      <Ridge ridge={FAR.back} fill="url(#j-far-back)" />
      <Ridge ridge={FAR.front} fill="url(#j-far-front)" />
      <rect x={far(-14000)} y="40" width={far(12600) - far(-14000)} height="120" fill="url(#j-haze)" />
      <Ridge ridge={FAR.destBack} fill="url(#j-far-back)" />
      <Ridge ridge={FAR.destFront} fill="url(#j-far-front)" />
      {/* A ship far off on the horizon (placed by the director) */}
      <g data-j="farShip">
        <path d="M0 0h60l-4 -5h-52z" fill="#55607A" fillOpacity="0.5" />
        <path d="M7 -5h40v-5h-40zM10 -10h9v-5h-9z" fill="#5F6B84" fillOpacity="0.5" />
      </g>
    </>
  );
}

/** A wind turbine on the hills (its rotor turns slowly, unless motion is reduced). */
function Turbine({ x, y, s = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-3 0L-1.6 -150H1.6L3 0Z" fill="#E7EAEC" />
      <rect x="-5" y="-156" width="14" height="7" rx="3" fill="#DDE1E4" />
      <g transform="translate(0 -152)">
        <g className="j-spin">
          <circle r="64" fill="none" />
          <path d="M0 0L-3 -62L3 -62Z M0 0L55.2 28.4L52.2 33.6Z M0 0L-52.2 33.6L-55.2 28.4Z" fill="#F1F3F4" />
          <circle r="4" fill="#C9CED3" />
        </g>
      </g>
    </g>
  );
}

const HILLS = {
  back: ridge({
    x0: hills(-9000),
    x1: hills(12500),
    base: 70,
    height: 150,
    step: 30,
    seed: 5,
    profile: plateau(-99999, hills(12350), 220),
  }),
  front: ridge({
    x0: hills(-9000),
    x1: hills(12300),
    base: 80,
    height: 92,
    step: 26,
    seed: 9,
    profile: plateau(-99999, hills(12150), 200),
  }),
  destBack: ridge({
    x0: hills(13500),
    x1: hills(30000),
    base: 170,
    height: 170,
    step: 30,
    seed: 13,
    profile: plateau(hills(16700), 99999, 320),
  }),
};

/** Clumps of small, distant trees standing on a ridge: a shaded mass with a sunlit side. */
function Grove({ x0, x1, count, seed, at, fill }) {
  const clumps = scatter(x0, x1, count, seed);
  const rand = random(seed + 100);
  const pieces = [];
  for (const { x, a } of clumps) {
    const key = Math.floor(x / 1200);
    if (!pieces.length || pieces[pieces.length - 1].key !== key)
      pieces.push({ key, x0: x - 60, x1: x + 60, shade: [], light: [] });
    const piece = pieces[pieces.length - 1];
    piece.x1 = x + 60;
    const { shade, light } = piece;
    const size = 2 + Math.floor(a * 5);
    for (let k = 0; k < size; k++) {
      const tx = x + (k - size / 2) * 7 + rand() * 4;
      const r = 4 + rand() * 4;
      const y = at(tx) - r * 0.6;
      shade.push([Math.round(tx), Math.round(y), Math.round(r)]);
      if (rand() < 0.6)
        light.push([Math.round(tx + r * 0.35), Math.round(y - r * 0.35), Math.max(2, Math.round(r * 0.55))]);
    }
  }
  return pieces.map((piece) => (
    <Cull key={piece.key} x0={piece.x0} x1={piece.x1}>
      <path d={circles(piece.shade)} fill={fill} />
      <path d={circles(piece.light)} fill="#FFFFFF" opacity="0.1" />
    </Cull>
  ));
}

/** Industry on the horizon behind the plant: stacks, tanks and sheds, in haze. */
function DistantIndustry({ x, y }) {
  return (
    <g transform={`translate(${x} ${y})`} fill="#9AA9B4">
      <path d="M0 0V-38H70V0Z M80 0V-24H150V0Z M24 -38V-92H32V-38Z M44 -38V-74H50V-38Z" />
      <path
        d={circles([
          [190, -18, 18],
          [228, -18, 18],
        ])}
      />
      <rect x="172" y="-18" width="74" height="18" />
    </g>
  );
}

/** Distant town on the coastal hills: pale houses with darker roofs. */
function DistantTown({ x0, x1, at, seed }) {
  const list = scatter(x0, x1, Math.round((x1 - x0) / 22), seed);
  const walls = [];
  const roofs = [];
  for (const { x, a, b } of list) {
    const w = 12 + a * 10;
    const h = 10 + b * 14;
    const y = at(x) + 4;
    walls.push(`M${x.toFixed(1)} ${y.toFixed(1)}h${w.toFixed(1)}v${(-h).toFixed(1)}h${(-w).toFixed(1)}z`);
    roofs.push(
      `M${(x - 1.5).toFixed(1)} ${(y - h).toFixed(1)}l${(w / 2 + 1.5).toFixed(1)} -7l${(w / 2 + 1.5).toFixed(1)} 7z`,
    );
  }
  return (
    <>
      <path d={walls.join("")} fill="#E3DDD2" />
      <path d={roofs.join("")} fill="#A08A7C" />
    </>
  );
}

/** The destination city on its hills at dusk: dark towers with lit windows. */
function DistantCity({ x0, x1, base, seed }) {
  const rand = random(seed);
  const towers = [];
  const windows = [];
  for (let x = x0; x < x1;) {
    const w = 26 + rand() * 40;
    const h = 40 + rand() * (x > (x0 + x1) / 2 - 300 && x < (x0 + x1) / 2 + 300 ? 230 : 110);
    towers.push(`M${x.toFixed(1)} ${base}v${(-h).toFixed(1)}h${w.toFixed(1)}v${h.toFixed(1)}z`);
    for (let wy = base - h + 10; wy < base - 8; wy += 12) {
      for (let wx = x + 5; wx < x + w - 6; wx += 9)
        if (rand() > 0.62) windows.push(`M${wx.toFixed(1)} ${wy.toFixed(1)}h4v5h-4z`);
    }
    x += w + 4 + rand() * 18;
  }
  return (
    <>
      <path d={towers.join("")} fill="#2D3550" />
      <path data-j="cityLightsFar" d={windows.join("")} fill="#F2CF8A" opacity="0.85" />
    </>
  );
}

/** Rolling hills: farms and turbines behind the countryside, industry behind the plant, a town on the coast. */
export function Hills() {
  return (
    <>
      <Ridge ridge={HILLS.back} fill="url(#j-hills-back)" />
      {[hills(700), hills(1180), hills(1720), hills(-400)].map((x, i) => (
        <Cull key={x} x0={x - 60} x1={x + 60}>
          <Turbine x={x} y={HILLS.back.at(x) + 6} s={0.62 - i * 0.05} />
        </Cull>
      ))}
      <Grove x0={hills(-2600)} x1={hills(4200)} count={60} seed={3} at={HILLS.back.at} fill="#7E9785" />
      {[hills(5200), hills(6100), hills(7300), hills(8200)].map((x) => (
        <Cull key={x} x0={x} x1={x + 250}>
          <DistantIndustry x={x} y={HILLS.back.at(x) + 8} />
        </Cull>
      ))}
      <Ridge ridge={HILLS.front} fill="url(#j-hills-front)" />
      <Grove x0={hills(-2400)} x1={hills(9000)} count={80} seed={7} at={HILLS.front.at} fill="#668469" />
      <Cull x0={hills(9400)} x1={hills(12000) + 30}>
        <DistantTown x0={hills(9400)} x1={hills(12000)} at={HILLS.front.at} seed={17} />
      </Cull>
      <rect x={hills(-9000)} y="20" width={hills(12300) - hills(-9000)} height="90" fill="url(#j-haze)" opacity="0.6" />
      <Ridge ridge={HILLS.destBack} fill="url(#j-hills-back)" />
      <Cull x0={hills(17300)} x1={hills(21400) + 80}>
        <DistantCity x0={hills(17300)} x1={hills(21400)} base={HILLS.destBack.at(hills(19000)) + 30} seed={21} />
      </Cull>
    </>
  );
}

// ——— The world ———

/** Round-crowned tree: shade on the left, sunlit on the right (the sun stays to the right all day). */
export function Tree({ x, y, s = 1, seed = 1 }) {
  const rand = random(seed);
  const dx = (rand() - 0.5) * 8;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cy="1" rx="30" ry="4" fill="#0B1220" opacity="0.15" />
      <path d="M-4 0L-3 -44H3L4 0Z" fill="#5A4636" />
      <path
        d={circles([
          [-16 + dx, -56, 22],
          [14, -60, 25],
          [dx, -84, 25],
        ])}
        fill="#4C6A4C"
      />
      <path
        d={circles([
          [10, -80, 17],
          [20, -58, 14],
        ])}
        fill="#6A8C62"
      />
    </g>
  );
}

/** Lombardy poplar: tall and narrow, a classic roadside tree. */
export function Poplar({ x, y, s = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cy="1" rx="18" ry="3" fill="#0B1220" opacity="0.15" />
      <rect x="-2.5" y="-20" width="5" height="20" fill="#5A4636" />
      <ellipse cy="-82" rx="17" ry="66" fill="#4F6E4E" />
      <ellipse cx="6" cy="-86" rx="9" ry="54" fill="#6A8C62" />
    </g>
  );
}

/** A low hedge or shrub. */
export function Shrub({ x, y, s = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path
        d={circles([
          [-14, -10, 12],
          [2, -16, 15],
          [18, -9, 11],
        ])}
        fill="#53704F"
      />
      <path d={circles([[8, -18, 9]])} fill="#6C8D63" />
    </g>
  );
}

// Rows of crops from the road (y = -4) to the horizon (y = -96), each a little narrower than the one before.
const FIELD_ROWS = (() => {
  const count = 12;
  const ratio = 0.84;
  const total = (1 - ratio ** count) / (1 - ratio);
  const rows = [];
  let y = -4;
  for (let i = 0; i < count; i++) {
    const thickness = (92 * ratio ** i) / total;
    rows.push([y - thickness, y]);
    y -= thickness;
  }
  return rows;
})();

const CROPS = {
  wheat: ["#D6C188", "#C8B077"],
  green: ["#A2B579", "#91A76B"],
  plowed: ["#B59C74", "#A58A63"],
  pasture: ["#ABBA81", "#A3B379"],
};

/** Fields running to the horizon behind the road: rows narrow as they recede. */
function Fields({ patches }) {
  const byColour = {};
  for (const [x0, x1, crop] of patches) {
    FIELD_ROWS.forEach(([top, bottom], i) => {
      const colour = CROPS[crop][i % 2];
      (byColour[colour] ??= []).push(`M${x0} ${bottom.toFixed(1)}H${x1}V${top.toFixed(1)}H${x0}Z`);
    });
  }
  const hedges = patches.slice(1).map(([x0]) => `M${x0 - 7} -4L${x0 - 2} -96H${x0 + 2}L${x0 + 7} -4Z`);
  return (
    <>
      {Object.entries(byColour).map(([colour, parts]) => (
        <path key={colour} d={parts.join("")} fill={colour} />
      ))}
      <path d={hedges.join("")} fill="#61805A" />
    </>
  );
}

/** The tree line along the horizon, where the fields end. */
function HorizonTrees({ x0, x1, seed }) {
  const list = scatter(x0, x1, Math.round((x1 - x0) / 16), seed);
  return (
    <path d={circles(list.map(({ x, a }) => [Math.round(x), -96 - a * 3, Math.round(6 + a * 6)]))} fill="#6D8A68" />
  );
}

/** Wooden power poles along the far side of the road, wires sagging between them. */
function PowerLine({ x0, x1, gap = 420 }) {
  const poles = [];
  for (let x = x0; x <= x1; x += gap) poles.push(x);
  const wires = [];
  for (let i = 0; i < poles.length - 1; i++) {
    const [a, b] = [poles[i], poles[i + 1]];
    for (const [ox, y] of [
      [-16, -150],
      [16, -150],
      [0, -162],
    ]) {
      wires.push(`M${a + ox} ${y}Q${(a + b) / 2 + ox} ${y + 18} ${b + ox} ${y}`);
    }
  }
  return (
    <>
      <path d={wires.join("")} stroke="#3A3F47" strokeOpacity="0.55" strokeWidth="1.4" fill="none" />
      <path
        d={poles.map((x) => `M${x - 3} -8V-164H${x + 3}V-8ZM${x - 22} -152H${x + 22}V-147H${x - 22}Z`).join("")}
        fill="#6B5845"
      />
      <path d={poles.map((x) => `M${x - 18} -156h4v-4h-4zM${x + 14} -156h4v-4h-4z`).join("")} fill="#D8D5CE" />
    </>
  );
}

/** A small farm far across the fields, at the end of the lane. */
function Farm({ x, y, s }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M0 0V-46L36 -70L72 -46V0Z" fill="#9C5B48" />
      <path d="M-4 -44L36 -74L76 -44" stroke="#5E4A44" strokeWidth="7" fill="none" />
      <rect x="26" y="-30" width="20" height="30" fill="#5E4A44" />
      <rect x="84" y="-86" width="26" height="86" fill="#C9CDD1" />
      <path d="M84 -86a13 9 0 0 1 26 0z" fill="#AEB4BA" />
      <path d="M96 -86V0" stroke="#AEB4BA" strokeWidth="2" />
    </g>
  );
}

/** A road sign on a post: white text on teal. */
export function RoadSign({ x, y = -4, lines, arrow = "→", width = 168 }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="-3" y="-118" width="6" height="118" fill="#8C939C" />
      <rect
        x={-width / 2}
        y={-118 - 22 - lines.length * 20}
        width={width}
        height={22 + lines.length * 20}
        rx="6"
        fill="#1F5E5B"
      />
      <rect
        x={-width / 2 + 4}
        y={-114 - 22 - lines.length * 20}
        width={width - 8}
        height={14 + lines.length * 20}
        rx="4"
        fill="none"
        stroke="#F4F1EA"
        strokeWidth="1.5"
        opacity="0.8"
      />
      {lines.map((line, i) => (
        <text
          key={line}
          x={-width / 2 + 16}
          y={-118 - lines.length * 20 + i * 20 + 6}
          className="j-text"
          fontSize="15"
          fontWeight="600"
          fill="#F4F1EA"
        >
          {line}
        </text>
      ))}
      <text
        x={width / 2 - 16}
        y={-118 - lines.length * 10 + 2}
        className="j-text"
        fontSize="22"
        fontWeight="600"
        fill="#F4F1EA"
        textAnchor="end"
      >
        {arrow}
      </text>
    </g>
  );
}

/** The open country before the hub: fields, a lane to a farm, roadside trees and a power line. */
export function Countryside() {
  const patches = [
    [-3200, -2400, "green"],
    [-2400, -1650, "wheat"],
    [-1650, -980, "pasture"],
    [-980, -260, "plowed"],
    [-260, 520, "wheat"],
    [520, 1190, "green"],
    [1190, 1900, "wheat"],
    [1900, 2500, "pasture"],
    [2500, X.hub[0], "green"],
  ];
  return (
    <>
      <rect x="-3200" y="-104" width={X.hub[0] + 3200} height="104" fill="#A9B47E" />
      <Fields patches={patches} />
      <HorizonTrees x0={-3200} x1={X.hub[0]} seed={2} />
      <path d="M1166 -4C1250 -30 1384 -62 1438 -96H1450C1404 -60 1300 -30 1244 -4Z" fill="#8E9094" />
      <path
        d="M1205 -4C1290 -32 1400 -64 1444 -96"
        stroke="#E6E0D2"
        strokeOpacity="0.55"
        strokeWidth="1.6"
        strokeDasharray="8 10"
        fill="none"
      />
      <Farm x={1462} y={-94} s={0.48} />
      <Farm x={-1880} y={-95} s={0.4} />
      <PowerLine x0={-2400} x1={X.hub[0] + 60} />
      {[
        [-2260, 1.05],
        [-1500, 0.9],
        [-1180, 1.2],
        [-640, 0.95],
        [-300, 1.1],
        [330, 1.25],
        [1890, 1.1],
        [2330, 0.95],
      ].map(([x, s], i) => (
        <Tree key={x} x={x} y={-6} s={s} seed={i + 4} />
      ))}
      {[-2020, -1960, -880, -840, 860, 905, 950, 2060].map((x, i) => (
        <Poplar key={x} x={x} y={-6} s={0.85 + (i % 3) * 0.12} />
      ))}
      {[-2600, -1720, -40, 640, 1580, 2470].map((x) => (
        <Shrub key={x} x={x} y={-4} s={0.9} />
      ))}
      <RoadSign x={2150} lines={["Logistics hub", "1 km"]} />
    </>
  );
}

/** Asphalt with a dashed centre line, kerbs and verges. */
function RoadStrip({ x0, x1, y }) {
  return (
    <>
      <rect x={x0} y={y - 6} width={x1 - x0} height="6" fill="#B9B3A6" />
      <rect x={x0} y={y} width={x1 - x0} height="70" fill="#454C59" />
      <rect x={x0} y={y} width={x1 - x0} height="30" fill="#4C5361" />
      <path d={`M${x0} ${y + 33}H${x1}`} stroke="#E7E0CF" strokeWidth="4" strokeDasharray="44 46" />
      <path d={`M${x0} ${y + 64}H${x1}`} stroke="#E7E0CF" strokeOpacity="0.8" strokeWidth="3" />
      <rect x={x0} y={y + 70} width={x1 - x0} height="7" fill="#2F343E" />
    </>
  );
}

/**
 * The ground and roads: the main road to the town; the ramp down from the warehouse to the port road; the
 * hillside between them; the destination's road on the far shore.
 */
export function Roads() {
  // The ramp is the truck's route offset up and down by the road's width (a vertical offset of a Bézier
  // curve is the same curve with its control points moved).
  const curve = (dy) =>
    `${RAMP[0][0]} ${RAMP[0][1] + dy}C${RAMP.slice(1)
      .map(([x, y]) => `${x} ${y + dy}`)
      .join(" ")}`;
  const back = (dy) =>
    `C${RAMP.slice(0, 3)
      .reverse()
      .map(([x, y]) => `${x} ${y + dy}`)
      .join(" ")}`;
  return (
    <>
      <RoadStrip x0={-4000} x1={12060} y={ROAD.top} />
      {/* The ramp: leaves the main road at the fork and falls to the port road, a stone wall along its upper side */}
      <path d={`M${curve(-64)}`} stroke="#AAA397" strokeWidth="22" fill="none" />
      <path d={`M${curve(-64)}`} stroke="#8D867B" strokeWidth="2" strokeDasharray="20 14" fill="none" />
      <path d={`M${curve(-52)}V${RAMP[3][1] + 18}${back(18)}Z`} fill="#454C59" />
      <path d={`M${curve(-52)}`} stroke="#B9B3A6" strokeWidth="6" fill="none" />
      <path d={`M${curve(12)}`} stroke="#E7E0CF" strokeOpacity="0.8" strokeWidth="3" fill="none" />
      <path d={`M${curve(18)}`} stroke="#2F343E" strokeWidth="7" fill="none" />
      {/* Port road and quay */}
      <RoadStrip x0={X.rampEnd - 20} x1={X.quay} y={PORT.top} />
      <rect
        x={X.rampEnd - 20}
        y={PORT.bottom + 7}
        width={X.quay - X.rampEnd + 20}
        height={WATER - PORT.bottom - 7}
        fill="#9EA3A6"
      />
      <path d={`M${X.rampEnd - 20} ${WATER - 12}H${X.quay}`} stroke="#7F8589" strokeWidth="5" />
      {/* Destination waterfront */}
      <RoadStrip x0={X.destQuay} x1={22000} y={PORT.top} />
      <rect
        x={X.destQuay}
        y={PORT.bottom + 7}
        width={22000 - X.destQuay}
        height={WATER - PORT.bottom - 7}
        fill="#6A7385"
      />
      <path d={`M${X.destQuay} ${WATER - 12}H22000`} stroke="#535C6E" strokeWidth="5" />
    </>
  );
}

/** Grass and fence posts that pass close to the camera (only along the first, ground-level stretch). */
export function Foreground() {
  const tuft = ({ x, a, b }) => {
    const y = 70 + b * 40;
    const h = 22 + a * 26;
    return `M${(x - 18).toFixed(0)} ${y.toFixed(0)}Q${(x - 8).toFixed(0)} ${(y - h).toFixed(0)} ${(x - 2).toFixed(0)} ${(y - h * 0.6).toFixed(0)}Q${x.toFixed(0)} ${(y - h * 1.2).toFixed(0)} ${(x + 4).toFixed(0)} ${(y - h * 0.5).toFixed(0)}Q${(x + 12).toFixed(0)} ${(y - h * 0.9).toFixed(0)} ${(x + 18).toFixed(0)} ${y.toFixed(0)}Z`;
  };
  const tufts = scatter(-1800, 11500, 66, 99);
  const pieces = [];
  for (let x0 = -1800; x0 < 11500; x0 += 2200) {
    const end = Math.min(x0 + 2200, 6000);
    const posts = [];
    for (let x = x0; x < end; x += 230) posts.push(`M${x} 150V86h9v64z`);
    pieces.push({ x0, end, posts, grass: tufts.filter(({ x }) => x >= x0 && x < x0 + 2200).map(tuft) });
  }
  return (
    <>
      {pieces.map(({ x0, end, posts, grass }) => (
        <Cull key={x0} x0={x0 - 20} x1={x0 + 2220}>
          {posts.length > 0 && (
            <>
              <path d={posts.join("")} fill="#5B4A3B" />
              <path d={`M${x0} 100H${end}M${x0} 118H${end}`} stroke="#5B4A3B" strokeWidth="3" />
            </>
          )}
          <path d={grass.join("")} fill="#4D6A44" />
        </Cull>
      ))}
      <rect x="-1800" y="136" width="18000" height="600" fill="#4D6A44" />
    </>
  );
}
