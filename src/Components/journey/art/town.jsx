// The town at the end of the local route: a street of houses and shops, and the supermarket whose shelves
// fill as the van is unloaded. Plus the signpost where the warehouse's two routes part.

import { X } from "./layout";
import { Person } from "./people";
import { random } from "./shapes";
import { Tree } from "./landscape";

const NAVY = "#24344B";
const FLOOR = -6;
const rect = (x, y, w, h) => `M${x} ${y}h${w}v${h}h${-w}z`;

/** Where the warehouse's routes part: up into town (retail), down to the port (export). */
export function ForkSign({ x }) {
  return (
    <g transform={`translate(${x} ${FLOOR + 2})`}>
      <rect x="-3" y="-176" width="7" height="176" fill="#8C939C" />
      <g transform="translate(-92 -236)">
        <rect width="200" height="44" rx="6" fill="#1F5E5B" />
        <text x="14" y="28" className="j-text" fontSize="15" fontWeight="600" fill="#F4F1EA">
          A · Town centre
        </text>
        <path
          d="M168 22h18l-7 -7M186 22l-7 7"
          stroke="#F4F1EA"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <g transform="translate(-92 -186)">
        <rect width="200" height="44" rx="6" fill={NAVY} />
        <text x="14" y="28" className="j-text" fontSize="15" fontWeight="600" fill="#F4F1EA">
          B · Port, export
        </text>
        <path
          d="M168 14l16 16m0 -11v11h-11"
          stroke="#F4F1EA"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </g>
  );
}

const STREET = [
  { x: 9470, w: 150, h: 150, wall: "#E6DDCC", roof: "#9C5B48", shop: "#2F7F7D" },
  { x: 9640, w: 130, h: 200, wall: "#C8D2DA", flat: true },
  { x: 9790, w: 170, h: 236, wall: "#D9C7A6", roof: "#7E6A5C" },
  { x: 9980, w: 270, h: 330, wall: "#E2DCD0", flat: true },
  { x: 10270, w: 150, h: 170, wall: "#B8C6BC", roof: "#6E5E54", shop: "#B98C3C" },
  { x: 11210, w: 160, h: 206, wall: "#D6C3A8", flat: true, shop: "#3A5A7A" },
  { x: 11390, w: 120, h: 290, wall: "#E8E1D3", roof: "#5E6878", tower: true },
  { x: 11530, w: 170, h: 176, wall: "#C8D2DA", roof: "#9C5B48" },
  { x: 11720, w: 150, h: 220, wall: "#E6DDCC", flat: true },
  { x: 11890, w: 150, h: 160, wall: "#D9C7A6", roof: "#7E6A5C" },
];

/** A town building: walls, a grid of windows, a gable or flat roof, a door — and a shop front if it has one. */
function Building({ x, w, h, wall, roof, flat, shop, tower, seed }) {
  const rand = random(seed);
  const top = FLOOR - h;
  const windows = [];
  const cols = Math.max(2, Math.floor((w - 24) / 38));
  const gap = (w - 24) / cols;
  for (let y = top + 22; y < FLOOR - (shop ? 92 : 60); y += 44) {
    for (let c = 0; c < cols; c++) windows.push(rect(x + 12 + c * gap + (gap - 22) / 2, y, 22, 28));
  }
  const lit = windows.filter(() => rand() < 0.25);
  return (
    <g>
      {!flat && (
        <path d={`M${x - 8} ${top}L${x + w / 2} ${top - 46 - (tower ? 30 : 0)}L${x + w + 8} ${top}Z`} fill={roof} />
      )}
      {flat && <rect x={x - 4} y={top - 10} width={w + 8} height="12" fill="#8F8A80" />}
      <rect x={x} y={top} width={w} height={h} fill={wall} />
      <rect x={x} y={top} width="10" height={h} fill="#0B1220" opacity="0.07" />
      <path d={windows.join("")} fill="#3B4C63" />
      <path d={lit.join("")} fill="#E9EFF2" opacity="0.55" />
      {tower && (
        <g>
          <circle cx={x + w / 2} cy={top + 34} r="20" fill="#F4F1EA" />
          <path
            d={`M${x + w / 2} ${top + 34}v-13M${x + w / 2} ${top + 34}h9`}
            stroke={NAVY}
            strokeWidth="3"
            strokeLinecap="round"
          />
        </g>
      )}
      {shop ? (
        <>
          <path d={`M${x - 4} ${FLOOR - 92}H${x + w + 4}L${x + w - 4} ${FLOOR - 72}H${x + 4}Z`} fill={shop} />
          <rect x={x + 12} y={FLOOR - 68} width={w - 60} height="62" fill="url(#j-glass)" />
          <rect x={x + w - 40} y={FLOOR - 68} width="28" height="62" fill="#3B4C63" />
        </>
      ) : (
        <rect x={x + w / 2 - 14} y={FLOOR - 50} width="28" height="50" fill="#5A4A3F" />
      )}
    </g>
  );
}

/** Street lamps along the pavement. */
function StreetLamps({ xs }) {
  return (
    <>
      <path
        d={xs.map((x) => `M${x} ${FLOOR}V-170q0 -12 12 -12h18`).join("")}
        stroke="#4A5363"
        strokeWidth="5"
        fill="none"
      />
      <path d={xs.map((x) => rect(x + 26, -186, 20, 8)).join("")} fill="#4A5363" />
    </>
  );
}

/** The town's street, from the fork to the headland (the supermarket is drawn separately). */
export function Town() {
  return (
    <>
      <rect x={X.town[0] - 60} y="-12" width={X.town[1] - X.town[0] + 100} height="6" fill="#B9B3A6" />
      {STREET.map((building, i) => (
        <Building key={building.x} {...building} seed={i + 30} />
      ))}
      <StreetLamps xs={[9620, 9965, 10460, 11195, 11515, 11875]} />
      {[9455, 10440, 11705].map((x, i) => (
        <Tree key={x} x={x} y={FLOOR} s={0.9} seed={i + 60} />
      ))}
      {/* Bus stop */}
      <g transform="translate(10432 -6)">
        <rect x="0" y="-92" width="4" height="92" fill="#4A5363" />
        <rect x="-4" y="-104" width="60" height="12" rx="3" fill="#2F7F7D" />
        <rect x="6" y="-88" width="44" height="60" fill="#BFD0DB" opacity="0.5" />
      </g>
      <Person x={10470} y={FLOOR} shirt="#9C5B48" trousers="#2B3446" skin="#E2B48C" />
    </>
  );
}

const SHELVES = [
  { x: 10580, w: 126 },
  { x: 10730, w: 126 },
  { x: 10880, w: 112 },
];
const SHELF_LEVELS = [-152, -112, -72];
const PRODUCT_COLOURS = ["#C0563F", "#2F7F7D", "#E3D7BE", "#3A5A7A", "#D2A23E", "#6F8F5A", "#B9474F", "#ECE8DF"];

/** Products on one shelf row: `full` rows are stocked, others thin. */
function ShelfRow({ j, x, w, y, seed, sparse = false }) {
  const rand = random(seed);
  const items = [];
  for (let px = x + 4; px < x + w - 10; px += 10 + Math.round(rand() * 3)) {
    if (sparse && rand() < 0.7) continue;
    const h = 14 + Math.round(rand() * 14);
    items.push({ d: rect(px, y - h, 8, h), colour: PRODUCT_COLOURS[Math.floor(rand() * PRODUCT_COLOURS.length)] });
  }
  const byColour = {};
  for (const { d, colour } of items) (byColour[colour] ??= []).push(d);
  return (
    <g data-j={j}>
      {Object.entries(byColour).map(([colour, parts]) => (
        <path key={colour} d={parts.join("")} fill={colour} />
      ))}
    </g>
  );
}

/** The supermarket: shelves behind a glass front; `market.stock*` rows appear as the van is unloaded. */
export function Market() {
  const [x0, x1] = X.market;
  const glass = [x0 + 36, x1 - 180];
  const rows = [];
  SHELVES.forEach((shelf, s) =>
    SHELF_LEVELS.forEach((y, l) => rows.push({ ...shelf, y, key: `${s}-${l}`, index: rows.length })),
  );
  return (
    <>
      <rect x={x0} y="-236" width={x1 - x0} height="230" fill="#E9E4DA" />
      {/* Inside, seen through the glass */}
      <rect x={glass[0]} y="-168" width={glass[1] - glass[0]} height="162" fill="#E2DACB" />
      <rect x={glass[0]} y="-168" width={glass[1] - glass[0]} height="10" fill="#F6F0DC" opacity="0.8" />
      {SHELVES.map((shelf) => (
        <g key={shelf.x}>
          <rect x={shelf.x} y="-160" width={shelf.w} height="152" fill="#CFC6B6" />
          <path d={SHELF_LEVELS.map((y) => rect(shelf.x - 2, y, shelf.w + 4, 4)).join("")} fill="#9B9283" />
        </g>
      ))}
      {rows.map((row) => (
        <ShelfRow key={`sparse-${row.key}`} x={row.x} w={row.w} y={row.y} seed={row.index + 70} sparse />
      ))}
      {rows.map((row) => (
        <g key={row.key} data-j={`market.stock${row.index}`} display="none">
          <ShelfRow x={row.x} w={row.w} y={row.y} seed={row.index + 90} />
        </g>
      ))}
      <Person j="shopper" x={10620} y={FLOOR} shirt="#B9474F" trousers="#2B3446" skin="#C68B5E" />
      <g data-j="cart" transform="translate(10650 -6)">
        <path d="M0 -36h34l-5 22h-25z" fill="none" stroke="#5C6673" strokeWidth="3" />
        <circle cx="6" cy="-4" r="4" fill="#3A4452" />
        <circle cx="27" cy="-4" r="4" fill="#3A4452" />
      </g>
      {/* The glass front, its frames and reflections */}
      <rect x={glass[0]} y="-168" width={glass[1] - glass[0]} height="162" fill="#9FB8C8" opacity="0.22" />
      <g data-j="market.glare">
        <path
          d={`M${glass[0] + 30} -168l70 0l-120 162h-70zM${glass[0] + 210} -168l26 0l-120 162h-26zM${glass[0] + 300} -168l60 0l-120 162h-60z`}
          fill="#FFFFFF"
          opacity="0.18"
        />
      </g>
      <path
        d={[0, 1, 2, 3, 4].map((i) => rect(glass[0] + i * ((glass[1] - glass[0]) / 4) - 3, -168, 6, 162)).join("")}
        fill="#5C6673"
      />
      <rect x={glass[0] - 3} y="-171" width={glass[1] - glass[0] + 6} height="6" fill="#5C6673" />
      {/* Door */}
      <rect x={x1 - 150} y="-152" width="104" height="146" fill="#5C6673" />
      <rect x={x1 - 146} y="-148" width="47" height="142" fill="url(#j-glass)" opacity="0.85" />
      <rect x={x1 - 95} y="-148" width="47" height="142" fill="url(#j-glass)" opacity="0.85" />
      <g data-j="market.open" opacity="0.35">
        <rect x={x1 - 136} y="-128" width="78" height="24" rx="4" fill="#1E2A38" />
        <text
          x={x1 - 97}
          y="-111"
          textAnchor="middle"
          className="j-text"
          fontSize="13"
          fontWeight="600"
          fill="#7BD389"
          letterSpacing="2"
        >
          OPEN
        </text>
      </g>
      {/* Awning and fascia */}
      <path d={`M${x0 + 20} -192H${x1 - 20}L${x1 - 30} -170H${x0 + 30}Z`} fill="#2F7F7D" />
      <path
        d={Array.from(
          { length: Math.floor((x1 - x0 - 60) / 30) },
          (_, i) => `M${x0 + 30 + i * 30} -170a15 9 0 0 0 30 0`,
        ).join("")}
        fill="#2F7F7D"
      />
      <rect x={x0} y="-246" width={x1 - x0} height="54" fill={NAVY} />
      <text x={x0 + 96} y="-206" className="j-text" fontSize="34" fontWeight="700" fill="#F4F1EA" letterSpacing="8">
        MARKET
      </text>
      <g
        transform={`translate(${x0 + 46} -219)`}
        stroke="#F4F1EA"
        strokeWidth="3.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M-18 -10h6l6 18h18l5 -13h-25" />
        <circle cx="-3" cy="13" r="2.5" />
        <circle cx="10" cy="13" r="2.5" />
      </g>
      <text
        x={x1 - 24}
        y="-212"
        textAnchor="end"
        className="j-text"
        fontSize="13"
        fontWeight="500"
        fill="#F4F1EA"
        opacity="0.75"
        letterSpacing="2"
      >
        FRESH · DAILY
      </text>
      <rect x={x0} y="-12" width={x1 - x0} height="6" fill="#0B1220" opacity="0.1" />
    </>
  );
}
