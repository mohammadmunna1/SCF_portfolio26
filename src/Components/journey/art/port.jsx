// The coast and the sea crossing: the ground the roads run on, the sea, the export terminal with its crane,
// the open ocean, and the destination — a second crane, the distribution centre and the city at dusk.

import { HORIZON, PORT, WATER, X } from "./layout";
import { Cull, Tree } from "./landscape";
import { containerColor } from "./geometry";
import { Container } from "./vehicles";
import { random } from "./shapes";

const NAVY = "#24344B";
const rect = (x, y, w, h) => `M${x} ${y}h${w}v${h}h${-w}z`;

export function SeaDefs() {
  return (
    <>
      {/* Sea colour by place: day at the export port, gold mid-ocean, dusk at the destination */}
      <linearGradient id="j-sea" gradientUnits="userSpaceOnUse" x1="9300" y1="0" x2="21000" y2="0">
        <stop offset="0" stopColor="#3E6F8E" />
        <stop offset="0.3" stopColor="#467694" />
        <stop offset="0.5" stopColor="#5C7790" />
        <stop offset="0.64" stopColor="#3B4F70" />
        <stop offset="1" stopColor="#25324D" />
      </linearGradient>
      <linearGradient id="j-sea-depth" gradientUnits="userSpaceOnUse" x1="0" y1={HORIZON} x2="0" y2="1700">
        <stop offset="0" stopColor="#F2E4D2" stopOpacity="0.28" />
        <stop offset="0.1" stopColor="#F2E4D2" stopOpacity="0.05" />
        <stop offset="0.4" stopColor="#0B1220" stopOpacity="0" />
        <stop offset="1" stopColor="#0B1220" stopOpacity="0.38" />
      </linearGradient>
      <linearGradient id="j-lamp" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#FFF3D0" stopOpacity="0.5" />
        <stop offset="1" stopColor="#FFF3D0" stopOpacity="0" />
      </linearGradient>
      <radialGradient id="j-glow">
        <stop offset="0" stopColor="#FFD992" stopOpacity="0.85" />
        <stop offset="1" stopColor="#FFD992" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="j-beam" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#FFF0C4" stopOpacity="0.55" />
        <stop offset="1" stopColor="#FFF0C4" stopOpacity="0" />
      </linearGradient>
      <linearGradient id="j-land-dusk" gradientUnits="userSpaceOnUse" x1="0" y1="200" x2="0" y2="700">
        <stop offset="0" stopColor="#4A5571" />
        <stop offset="1" stopColor="#323B54" />
      </linearGradient>
    </>
  );
}

/** Little wave marks, smaller and denser towards the horizon (three depths). */
function Waves({ x0, x1, seed }) {
  const rand = random(seed);
  const bands = [
    { y0: HORIZON + 6, y1: 460, count: 420, size: 0.5, width: 1.4, opacity: 0.45 },
    { y0: 460, y1: 760, count: 360, size: 1, width: 2, opacity: 0.4 },
    { y0: 760, y1: 1500, count: 300, size: 1.8, width: 3, opacity: 0.32 },
  ];
  // Marks by depth band, then cut into pieces 2000 wide so only those on screen are painted
  const pieces = {};
  bands.forEach((band, i) => {
    for (let n = 0; n < band.count; n++) {
      const t = rand();
      const y = band.y0 + (band.y1 - band.y0) * t;
      const x = x0 + rand() * (x1 - x0);
      const w = (10 + rand() * 14) * band.size * (0.7 + t * 0.6);
      const key = Math.floor((x - x0) / 2000);
      (pieces[key] ??= bands.map(() => []))[i].push(
        `M${x.toFixed(0)} ${y.toFixed(0)}q${(w / 4).toFixed(1)} ${(-w / 7).toFixed(1)} ${(w / 2).toFixed(1)} 0t${(w / 2).toFixed(1)} 0`,
      );
    }
  });
  return Object.entries(pieces).map(([key, marks]) => (
    <Cull key={key} x0={x0 + key * 2000 - 40} x1={x0 + (Number(key) + 1) * 2000 + 40}>
      {marks.map((list, i) => (
        <path
          key={i}
          d={list.join("")}
          stroke="#EAF2F5"
          strokeOpacity={bands[i].opacity}
          strokeWidth={bands[i].width}
          fill="none"
          strokeLinecap="round"
        />
      ))}
    </Cull>
  ));
}

/** The sea: one surface from the export port to the destination, horizon haze and depth. */
export function Sea() {
  return (
    <>
      <rect x="9000" y={HORIZON} width="13000" height="4000" fill="url(#j-sea)" />
      <rect x="9000" y={HORIZON} width="13000" height="4000" fill="url(#j-sea-depth)" />
      <Waves x0={9300} x1={21800} seed={8} />
      {/* Sun glitter on the water, moved under the sun by the director at golden hour */}
      <path
        data-j="glitter"
        display="none"
        d={Array.from({ length: 26 }, (_, i) => {
          const y = HORIZON + 6 + i * i * 0.9;
          const w = 18 + i * 3;
          return `M${(-w / 2 + Math.sin(i * 2.1) * 30).toFixed(0)} ${y.toFixed(0)}h${w}`;
        }).join("")}
        stroke="#FFD9A0"
        strokeOpacity="0.7"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </>
  );
}

/**
 * The land under everything at road level: fields and verge down to the shore, the hillside between the
 * town road and the port road, the headland; and the destination's shore across the sea.
 */
export function Ground() {
  const origin = [
    "M-4000 70H12080",
    "C12240 80 12400 210 12470 330",
    "C12500 380 12540 420 12600 434",
    "H11920V514H10330V660",
    "C10050 680 9800 720 9520 820",
    "C9300 900 9150 1300 9100 4000",
    "H-4000Z",
  ].join("");
  const destination =
    "M16240 306C16520 300 16800 272 17080 250H22000V640H17020V520C16860 512 16640 470 16480 440C16380 420 16300 396 16240 380Z";
  return (
    <>
      <path d={origin} fill="#7E9A63" />
      <path
        d={"M-4000 77H12080C12150 80 12210 110 12260 150L12230 180C12160 120 12100 98 12000 96H-4000Z"}
        fill="#91AB72"
      />
      {/* Rocks where the hillside meets the water */}
      <path d="M9520 820C9800 720 10050 680 10330 660V676C10050 696 9800 734 9540 834Z" fill="#6E6A60" />
      <path d="M12470 330C12500 380 12540 420 12600 434L12560 440C12520 420 12480 380 12450 334Z" fill="#6E6A60" />
      <path d={destination} fill="url(#j-land-dusk)" />
      <path
        d="M16240 380C16300 396 16380 420 16480 440C16640 470 16860 512 17020 520V532C16860 524 16630 484 16470 452C16370 432 16290 408 16236 392Z"
        fill="#2B3247"
      />
    </>
  );
}

/** Terraces of gardens and small houses stepping down from the town to the port, with trees across the slope. */
export function Hillside() {
  const rand = random(5);
  const terraces = [
    { y: 196, x0: 10260, x1: 12290 },
    { y: 318, x0: 10330, x1: 12420 },
    { y: 432, x0: 10400, x1: 12530 },
  ];
  const walls = [];
  const joints = [];
  const gardens = [];
  const houses = [];
  const roofs = [];
  const windows = [];
  for (const [index, { y, x0, x1 }] of terraces.entries()) {
    gardens.push(rect(x0, y - 9, x1 - x0, 9));
    walls.push(rect(x0, y, x1 - x0, 20));
    for (let x = x0 + 14; x < x1; x += 34) joints.push(`M${x} ${y + (Math.round(x / 34) % 2 ? 2 : 10)}v8`);
    joints.push(`M${x0} ${y + 10}H${x1}`);
    if (index === 2) continue;
    for (let x = x0 + 60 + rand() * 80; x < x1 - 120; x += 180 + rand() * 160) {
      const w = 52 + rand() * 30;
      const h = 34 + rand() * 22;
      houses.push(rect(Math.round(x), Math.round(y - 9 - h), Math.round(w), Math.round(h)));
      roofs.push(
        `M${Math.round(x - 5)} ${Math.round(y - 9 - h)}l${Math.round(w / 2 + 5)} -16l${Math.round(w / 2 + 5)} 16z`,
      );
      windows.push(
        rect(Math.round(x + 10), Math.round(y - h + 2), 10, 12),
        rect(Math.round(x + w - 20), Math.round(y - h + 2), 10, 12),
      );
    }
  }
  const trees = [
    [8560, 300, 0.95],
    [8820, 430, 1.1],
    [9080, 560, 1],
    [8700, 640, 0.9],
    [9420, 200, 0.85],
    [9700, 300, 0.9],
    [10050, 420, 0.8],
    [10640, 196, 0.75],
    [11420, 196, 0.8],
    [11880, 318, 0.75],
    [10900, 318, 0.8],
    [12150, 432, 0.7],
  ];
  return (
    <>
      <path d={gardens.join("")} fill="#93AE73" />
      <path d={walls.join("")} fill="#AAA397" />
      <path d={joints.join("")} stroke="#8D867B" strokeWidth="2" />
      <path d={houses.join("")} fill="#EEE8DC" />
      <path d={roofs.join("")} fill="#B5654A" />
      <path d={windows.join("")} fill="#3B4C63" />
      {trees.map(([x, y, scale], i) => (
        <Tree key={x} x={x} y={y} s={scale} seed={i + 80} />
      ))}
    </>
  );
}

/** White lighthouse on the headland. */
export function Lighthouse({ x, y }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M-20 0L-13 -150H13L20 0Z" fill="#F1EEE8" />
      <path d="M-17.5 -50L-15.5 -84H15.5L17.5 -50Z" fill="#2F7F7D" />
      <rect x="-20" y="-158" width="40" height="8" fill="#3A4452" />
      <rect x="-11" y="-182" width="22" height="24" fill="#F6E7B8" />
      <path d="M-14 -182a14 12 0 0 1 28 0z" fill="#3A4452" />
      <rect x="-3" y="-28" width="6" height="12" fill="#3A4452" />
    </g>
  );
}

/** The export terminal: gatehouse and sign, container stacks, light tower, bollards. */
export function Terminal() {
  const stacks = [
    { x: 10700, length: 332, tiers: 4, base: PORT.top - 30, scale: 0.9 },
    { x: 11040, length: 166, tiers: 3, base: PORT.top - 30, scale: 0.9 },
    { x: 10690, length: 332, tiers: 3, base: PORT.top - 6 },
    { x: 11030, length: 166, tiers: 2, base: PORT.top - 6 },
    { x: 11200, length: 166, tiers: 1, base: PORT.top - 6 },
  ];
  let seed = 3;
  return (
    <>
      {stacks.map((stack) => (
        <g key={`${stack.x}-${stack.base}`}>
          {Array.from({ length: stack.tiers }, (_, tier) => (
            <Container
              key={tier}
              x={stack.x + stack.length / 2}
              y={stack.base - tier * 72 * (stack.scale ?? 1)}
              length={stack.length - 4}
              color={containerColor(seed++)}
              detail={false}
            />
          ))}
        </g>
      ))}
      {/* Light tower */}
      <path d={`M11300 ${PORT.top - 6}L11306 ${PORT.top - 330}H11314L11320 ${PORT.top - 6}Z`} fill="#8C939C" />
      <rect x="11282" y={PORT.top - 350} width="56" height="22" rx="3" fill="#4A5363" />
      <path d={`M11290 ${PORT.top - 344}h40v10h-40z`} fill="#F4E7C2" />
      {/* Gatehouse and sign */}
      <g transform={`translate(${X.gate} ${PORT.top - 6})`}>
        <rect x="0" y="-74" width="96" height="74" fill="#D8D3C9" />
        <rect x="-6" y="-84" width="108" height="12" fill="#56627A" />
        <rect x="12" y="-56" width="70" height="26" fill="url(#j-glass)" />
        <rect x="120" y="-176" width="7" height="176" fill="#8C939C" />
        <rect x="226" y="-176" width="7" height="176" fill="#8C939C" />
        <rect x="108" y="-226" width="140" height="58" rx="6" fill={NAVY} />
        <text
          x="178"
          y="-202"
          textAnchor="middle"
          className="j-text"
          fontSize="14"
          fontWeight="600"
          fill="#F4F1EA"
          letterSpacing="2"
        >
          EXPORT
        </text>
        <text
          x="178"
          y="-183"
          textAnchor="middle"
          className="j-text"
          fontSize="14"
          fontWeight="600"
          fill="#F4F1EA"
          letterSpacing="2"
        >
          TERMINAL
        </text>
      </g>
      {/* Quay edge: bollards and a fender line */}
      <path
        d={Array.from({ length: 8 }, (_, i) => rect(10420 + i * 210, PORT.bottom - 2, 14, 10)).join("")}
        fill="#2F343E"
      />
      <path d={`M10340 ${WATER - 2}H${X.quay}`} stroke="#2F343E" strokeWidth="5" />
    </>
  );
}

/**
 * A ship-to-shore crane standing on the quay, its boom reaching over the water (`dir` 1: to the right,
 * −1: to the left). The trolley, its cables and the spreader are separate parts the director moves.
 */
export function Crane({ x, dir = 1, reach = 1140 }) {
  const at = (dx) => x + dx * dir;
  const span = (a, b) => [Math.min(at(a), at(b)), Math.abs(at(b) - at(a))];
  const [boomX, boomW] = span(-400, reach);
  const diagonals = [];
  for (let dx = -380; dx < reach - 20; dx += 40) diagonals.push(`M${at(dx)} 156L${at(dx + 20)} 167L${at(dx + 40)} 156`);
  const bracing = `M${at(-190)} 258L${at(190)} 340M${at(190)} 258L${at(-190)} 340`;
  return (
    <g>
      {/* Legs and bogies */}
      {[-190, 190].map((dx) => (
        <g key={dx}>
          <path
            d={`M${at(dx) - 13} ${PORT.bottom}L${at(dx) - 9} 250H${at(dx) + 9}L${at(dx) + 13} ${PORT.bottom}Z`}
            fill="#4E7393"
          />
          <rect x={at(dx) - 13} y="250" width="7" height={PORT.bottom - 250} fill="#0B1220" opacity="0.15" />
          <rect x={at(dx) - 34} y={PORT.bottom - 6} width="68" height="12" rx="3" fill="#3B5875" />
          <path
            d={[-22, 0, 22].map((w) => `M${at(dx) + w - 6} ${PORT.bottom + 8}a6 6 0 1 0 12 0a6 6 0 1 0 -12 0`).join("")}
            fill="#2F343E"
          />
        </g>
      ))}
      <path d={bracing} stroke="#4E7393" strokeWidth="7" />
      {/* Portal, posts and machinery house */}
      <rect x={Math.min(at(-215), at(215))} y="236" width="430" height="22" fill="#4E7393" />
      <rect x={Math.min(at(-215), at(215))} y="252" width="430" height="6" fill="#0B1220" opacity="0.18" />
      <rect x={at(-150) - 9} y="40" width="18" height="196" fill="#4E7393" />
      <rect x={at(100) - 8} y="60" width="16" height="176" fill="#4E7393" />
      <rect x={Math.min(at(-170), at(116))} y="36" width={286} height="16" fill="#3B5875" />
      <rect x={Math.min(at(-212), at(-82))} y="182" width="130" height="54" fill="#E7EBEE" />
      <rect x={Math.min(at(-212), at(-82))} y="182" width="130" height="8" fill="#C9D0D6" />
      {/* Stays */}
      <path
        d={`M${at(100)} 62L${at(reach - 40)} 152M${at(-150)} 42L${at(-390)} 152`}
        stroke="#3B5875"
        strokeWidth="5"
      />
      {/* The boom, a truss */}
      <rect x={boomX} y="150" width={boomW} height="6" fill="#4E7393" />
      <rect x={boomX} y="167" width={boomW} height="6" fill="#4E7393" />
      <path d={diagonals.join("")} stroke="#4E7393" strokeWidth="3" fill="none" />
      <rect x={boomX} y="162" width={boomW} height="2" fill="#E7EBEE" opacity="0.6" />
      <path
        d={Array.from({ length: 6 }, (_, i) => rect(at(reach - 6 - i * 10) - 2.5, 150, 5, 23)).join("")}
        fill="#D9B44A"
      />
    </g>
  );
}

/** The crane's moving parts: trolley (with the driver's cab), cables and spreader. */
export function CraneRig({ j }) {
  return (
    <>
      <path data-j={`${j}.cables`} stroke="#2F3B4C" strokeWidth="2.5" fill="none" />
      <g data-j={`${j}.trolley`}>
        <rect x="-36" y="173" width="72" height="18" rx="3" fill="#2F3B4C" />
        <rect x="-8" y="191" width="40" height="26" rx="3" fill="#E7EBEE" />
        <rect x="-4" y="195" width="32" height="14" rx="2" fill="url(#j-glass)" />
      </g>
      <g data-j={`${j}.spreader`}>
        <rect x="-26" y="-12" width="52" height="12" rx="2" fill="#3A4452" />
        <rect x="-168" y="0" width="336" height="13" rx="2" fill="#D9B44A" />
        <rect x="-168" y="9" width="336" height="4" fill="#0B1220" opacity="0.25" />
      </g>
    </>
  );
}

/** Mooring lines from the berthed ship to the quay; they let go as the ship leaves. */
export function Moorings() {
  return (
    <g data-j="moorings">
      <path
        d={`M${X.berth + 30} ${WATER - 100}Q${X.quay - 20} ${WATER - 60} ${X.quay - 46} ${PORT.bottom}`}
        stroke="#3A3F47"
        strokeWidth="2.5"
        fill="none"
      />
      <path
        d={`M${X.berth + 70} ${WATER - 110}Q${X.quay - 70} ${WATER - 70} ${X.quay - 256} ${PORT.bottom}`}
        stroke="#3A3F47"
        strokeWidth="2.5"
        fill="none"
      />
    </g>
  );
}

/** The destination: harbour light, container stacks, the distribution centre and the city at dusk. */
export function Destination() {
  const rand = random(44);
  const towers = [];
  const windows = [];
  for (let x = 17240; x < 21700;) {
    const w = 80 + rand() * 120;
    const tall = x > 19100 && x < 20500;
    const h = 200 + rand() * (tall ? 520 : 260);
    const top = PORT.top - 40 - h;
    towers.push({ x, w, top, colour: ["#2C3A55", "#33425F", "#27334D"][Math.floor(rand() * 3)] });
    for (let wy = top + 16; wy < PORT.top - 60; wy += 22) {
      for (let wx = x + 10; wx < x + w - 14; wx += 18)
        if (rand() < 0.42) windows.push(rect(Math.round(wx), Math.round(wy), 8, 11));
    }
    x += w + 10 + rand() * 40;
  }
  const [d0, d1] = X.dc;
  const dcTop = PORT.top - 266;
  const lamps = [17600, 18080, 19140, 19620, 20100, 20580];
  return (
    <>
      {/* City behind the waterfront */}
      {towers.map((tower) => (
        <rect
          key={tower.x}
          x={tower.x}
          y={tower.top}
          width={tower.w}
          height={PORT.top - tower.top}
          fill={tower.colour}
        />
      ))}
      <path data-j="cityLights" d={windows.join("")} fill="#F2CF8A" opacity="0.9" />
      <path
        d={towers
          .filter((_, i) => i % 3 === 0)
          .map((tower) => `M${(tower.x + tower.w / 2).toFixed(0)} ${tower.top.toFixed(0)}v-26`)
          .join("")}
        stroke="#5C6880"
        strokeWidth="3"
      />
      <path
        d={towers
          .filter((_, i) => i % 3 === 0)
          .map((tower) => rect(Math.round(tower.x + tower.w / 2 - 3), Math.round(tower.top - 32), 6, 6))
          .join("")}
        fill="#E46A5A"
      />
      <rect x="17020" y={PORT.top - 60} width="4700" height="54" fill="#3A4560" />
      {/* Stacks by the quay */}
      {[
        [17560, 2, 166],
        [17520, 1, 166],
      ].map(([sx, tiers, length]) => (
        <g key={sx}>
          {Array.from({ length: tiers }, (_, tier) => (
            <Container
              key={tier}
              x={sx + length / 2}
              y={PORT.top - 6 - tier * 72}
              length={length - 4}
              color={containerColor(sx + tier)}
              detail={false}
            />
          ))}
        </g>
      ))}
      {/* Distribution centre */}
      <rect x={d0} y={dcTop} width={d1 - d0} height={PORT.top - 6 - dcTop} fill="#2A3850" />
      <rect x={d0 - 8} y={dcTop - 10} width={d1 - d0 + 16} height="12" fill="#3D4B66" />
      <rect x={d0 + 30} y={dcTop + 56} width={d1 - d0 - 60} height="40" fill="#F2CF8A" opacity="0.85" />
      <path
        d={Array.from({ length: 12 }, (_, i) => rect(d0 + 30 + i * ((d1 - d0 - 60) / 12) - 2, dcTop + 56, 4, 40)).join(
          "",
        )}
        fill="#2A3850"
      />
      <text
        x={d0 + 110}
        y={dcTop + 34}
        className="j-text"
        fontSize="24"
        fontWeight="600"
        fill="#F4F1EA"
        letterSpacing="4"
      >
        DISTRIBUTION CENTRE
      </text>
      <g transform={`translate(${d0 + 66} ${dcTop + 26})`}>
        <circle r="20" className="fill-accent" />
        <path
          d="M-20 0h40M0 -20a11 20 0 0 1 0 40a11 20 0 0 1 0 -40M-17 -10h34M-17 10h34"
          stroke="#F4F1EA"
          strokeWidth="2"
          fill="none"
        />
      </g>
      {[d0 + 560, d0 + 760, d0 + 960].map((dx, i) => (
        <g key={dx}>
          <rect
            x={dx}
            y={PORT.top - 6 - 130}
            width="130"
            height="130"
            fill={i === 0 ? "#F2CF8A" : "#1E2636"}
            opacity={i === 0 ? 0.8 : 1}
          />
          <path
            d={`M${dx - 12} ${PORT.top - 6 - 150}H${dx + 142}L${dx + 132} ${PORT.top - 6 - 132}H${dx - 2}Z`}
            fill="#46546E"
          />
          <circle cx={dx + 65} cy={PORT.top - 6 - 160} r="5" fill="#FFE2A8" />
          <circle cx={dx + 65} cy={PORT.top - 6 - 160} r="40" fill="url(#j-glow)" opacity="0.6" />
        </g>
      ))}
      {/* Street lamps, lit */}
      <path
        d={lamps.map((x) => `M${x} ${PORT.top - 6}V${PORT.top - 176}q0 -12 12 -12h18`).join("")}
        stroke="#5C6880"
        strokeWidth="5"
        fill="none"
      />
      {lamps.map((x) => (
        <g key={x}>
          <circle cx={x + 36} cy={PORT.top - 182} r="44" fill="url(#j-glow)" opacity="0.7" />
          <rect x={x + 26} y={PORT.top - 190} width="20" height="8" fill="#FFE8B8" />
        </g>
      ))}
      {/* Harbour light at the end of the quay */}
      <rect x="17034" y={PORT.top - 96} width="10" height="96" fill="#D8D3C9" />
      <circle cx="17039" cy={PORT.top - 102} r="6" fill="#7BD389" />
      <circle cx="17039" cy={PORT.top - 102} r="30" fill="url(#j-glow)" opacity="0.5" />
      <path
        d={Array.from({ length: 10 }, (_, i) => rect(17100 + i * 220, PORT.bottom - 2, 14, 10)).join("")}
        fill="#232A36"
      />
    </>
  );
}
