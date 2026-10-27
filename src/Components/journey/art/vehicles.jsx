// Vehicles of the journey, drawn side-on facing right with the ground at y = 0. Parts the director moves
// carry a `data-j` name (prefixed by the vehicle's own `j`). Accent-coloured parts follow the site palette:
// the shipment is always the one in the accent colour.

import { CONTAINER_COLORS, cabPath, polygon, rigShape } from "./geometry";
import { random } from "./shapes";

const TIRE = "#1D2229";
const STEEL = "#A3ACB6";
const DARK = "#2A3039";
const BODY = "#EEECE6";

/** A wheel drawn at radius 16 and scaled to `r`; the lug nuts show it turning. */
export function Wheel({ j, x = 0, r = 16 }) {
  return (
    <g data-j={j} transform={`translate(${x} ${-r}) scale(${r / 16})`}>
      <circle r="18.5" fill={DARK} />
      <circle r="16" fill={TIRE} />
      <circle r="9.6" fill="#B4BCC5" />
      <circle r="9.6" fill="none" stroke="#7F8996" strokeWidth="1.4" />
      <path
        d="M0 -6.2a1.5 1.5 0 1 0 0.01 0M5.9 -1.9a1.5 1.5 0 1 0 0.01 0M3.6 5a1.5 1.5 0 1 0 0.01 0M-3.6 5a1.5 1.5 0 1 0 0.01 0M-5.9 -1.9a1.5 1.5 0 1 0 0.01 0"
        fill="#5F6977"
      />
      <circle r="2.6" fill="#4A5360" />
    </g>
  );
}

/** The shipment's vehicle: a van at m = 0, a semi truck at m = 1 (the director animates the morph). */
export function Rig({ j, m = 0, x = 0, y = 0 }) {
  const s = rigShape(m);
  const part = (name) => ({ "data-j": `${j}.${name}`, ...s[name] });
  return (
    <g data-j={j} transform={`translate(${x} ${y})`}>
      <ellipse {...part("shadow")} cy="2" ry="6" fill="#0B1220" opacity="0.22" />
      <rect {...part("chassis")} fill={DARK} />
      <rect {...part("tractor")} fill={DARK} />
      <rect {...part("tank")} height="13" rx="4" fill={STEEL} />
      {s.wheels.map(([wx, r], i) => (
        <Wheel key={i} j={`${j}.w${i}`} x={wx} r={r} />
      ))}
      <rect {...part("box")} rx="4" fill={BODY} />
      <rect {...part("boxTop")} rx="2" fill="#D9D5CC" />
      <rect {...part("boxShade")} fill="#0B1220" opacity="0.08" />
      <rect {...part("stripe")} className="fill-accent" />
      <path {...part("seam")} stroke="#CFCAC0" strokeWidth="2" fill="none" />
      <rect {...part("tail")} width="4" rx="1" fill="#B8432E" />
      <rect {...part("rear")} fill="#232B36" opacity="0" />
      <g {...part("logo")}>
        <circle r="13" className="fill-accent" />
        <path
          d="M-6 -1h9l-3.5 -4M3 -1l-3.5 4"
          stroke={BODY}
          strokeWidth="2.4"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <path {...part("deflector")} className="fill-accent" />
      <path {...part("cab")} className="fill-accent" />
      <path {...part("skirt")} fill="#0B1220" opacity="0.2" />
      <path {...part("window")} fill="url(#j-glass)" />
      <path {...part("door")} stroke="#0B1220" strokeOpacity="0.25" strokeWidth="2" fill="none" />
      <path {...part("sideDoor")} d="M-30 -96V-26" stroke="#CFCAC0" strokeWidth="2" fill="none" />
      <rect {...part("light")} width="6" rx="1.5" fill="#F4E4B4" />
      <rect {...part("bumper")} rx="3" fill={DARK} />
      <rect {...part("mirror")} width="5" rx="2" fill={DARK} />
    </g>
  );
}

/** A container: 332 × 72, its origin at the middle of its floor. `accent` makes it the shipment. */
export function Container({ j, x = 0, y = 0, color, accent = false, detail = true, length = 332 }) {
  const half = length / 2;
  const ribs = [];
  for (let rx = -half + 22; rx < half - 8; rx += detail ? 11 : 22) ribs.push(`M${rx} -66V-6`);
  return (
    <g data-j={j} transform={`translate(${x} ${y})`}>
      <rect
        x={-half}
        y="-72"
        width={length}
        height="72"
        fill={accent ? undefined : color}
        className={accent ? "fill-accent" : undefined}
      />
      <path d={ribs.join("")} stroke="#0B1220" strokeOpacity="0.16" strokeWidth={detail ? 2 : 3} />
      <rect x={-half} y="-72" width={length} height="5" fill="#0B1220" opacity="0.22" />
      <rect x={-half} y="-6" width={length} height="6" fill="#0B1220" opacity="0.3" />
      {detail && (
        <>
          <path d={`M${-half + 6} -66V-6M${-half + 14} -66V-6`} stroke="#0B1220" strokeOpacity="0.32" strokeWidth="2" />
          <rect x={half - 46} y="-60" width="30" height="16" fill="#F4F1EA" opacity="0.85" />
          <path d={`M${half - 42} -55h20M${half - 42} -50h14`} stroke="#0B1220" strokeOpacity="0.5" strokeWidth="1.6" />
        </>
      )}
      <path
        d={`M${-half} -72h7v7h-7zM${half - 7} -72h7v7h-7zM${-half} -7h7v7h-7zM${half - 7} -7h7v7h-7z`}
        fill="#0B1220"
        opacity="0.4"
      />
    </g>
  );
}

/** Cab-over tractor unit with a skeletal chassis for one 40-ft container (carried separately). */
export function ContainerTruck({ j, x = 0, y = 0, cab = "#2F4B62" }) {
  const wheels = [-312, -270, 24, 96];
  const shape = { x0: 38, yb: -30, yr: -146, xw0: 104, xw1: 114, yw1: -104, yh: -100, xf: 120 };
  return (
    <g data-j={j} transform={`translate(${x} ${y})`}>
      <ellipse cx="-118" cy="2" rx="250" ry="6" fill="#0B1220" opacity="0.22" />
      <rect x="-356" y="-44" width="396" height="9" fill={DARK} />
      <rect x="0" y="-38" width="120" height="10" fill={DARK} />
      <rect x="-60" y="-35" width="8" height="22" fill="#4A5360" />
      <rect x="44" y="-46" width="34" height="13" rx="4" fill={STEEL} />
      {wheels.map((wx, i) => (
        <Wheel key={wx} j={`${j}.w${i}`} x={wx} r={19} />
      ))}
      <path
        d={polygon([
          [42, -146],
          [54, -168],
          [90, -168],
          [100, -146],
        ])}
        fill={cab}
      />
      <path d={cabPath(shape)} fill={cab} />
      <path d={`M38 -43H120V-30H38Z`} fill="#0B1220" opacity="0.2" />
      <path
        d={polygon([
          [46, -138],
          [98, -138],
          [106, -108],
          [46, -108],
        ])}
        fill="url(#j-glass)"
      />
      <path d="M100 -136V-36" stroke="#0B1220" strokeOpacity="0.25" strokeWidth="2" />
      <rect x="114" y="-88" width="6" height="9" rx="1.5" fill="#F4E4B4" />
      <rect x="108" y="-39" width="15" height="13" rx="3" fill={DARK} />
      <rect x="113" y="-108" width="5" height="18" rx="2" fill={DARK} />
    </g>
  );
}

/** Counterbalance forklift; the forks (and whatever sits on them) rise via the `${j}.forks` group. */
export function Forklift({ j, x = 0, y = 0 }) {
  return (
    <g data-j={j} transform={`translate(${x} ${y})`}>
      <ellipse cx="10" cy="2" rx="78" ry="5" fill="#0B1220" opacity="0.22" />
      <rect x="56" y="-160" width="11" height="154" fill="#4E5865" />
      <rect data-j={`${j}.mast`} x="60" y="-160" width="5" height="150" fill="#6A7480" />
      <g data-j={`${j}.forks`}>
        <rect x="64" y="-52" width="9" height="46" fill="#39414C" />
        <rect x="64" y="-12" width="66" height="6" fill="#39414C" />
      </g>
      <path d="M-56 -64Q-58 -76 -46 -76H-12V-14H-50Q-56 -14 -56 -20Z" fill="#B4862F" />
      <path d="M-40 -56H52Q58 -56 58 -50V-14H-40Z" fill="#D3A23C" />
      <rect x="-40" y="-20" width="98" height="6" fill="#0B1220" opacity="0.18" />
      <path
        d="M-30 -56V-132M44 -56V-128M-36 -134H50"
        stroke="#2C343F"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />
      <rect x="-22" y="-74" width="30" height="18" rx="4" fill="#2C343F" />
      <g transform="translate(-4 -74)">
        <rect x="-8" y="-30" width="18" height="30" rx="6" fill="#E2B33F" />
        <rect x="-5" y="-30" width="4" height="30" fill="#F2E6B8" opacity="0.7" />
        <circle cx="1" cy="-39" r="8" fill="#8D5B3E" />
        <path d="M-7 -41a8 8 0 0 1 16 0z" fill="#E2B33F" />
        <path d="M8 -22l18 4" stroke="#2C3A52" strokeWidth="5" strokeLinecap="round" />
      </g>
      <Wheel j={`${j}.w0`} x={-30} r={13} />
      <Wheel j={`${j}.w1`} x={38} r={16} />
    </g>
  );
}

/** A pallet of boxed products (origin at the middle of the pallet's foot). */
export function Pallet({ j, x = 0, y = 0, rows = 2 }) {
  const boxes = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < 2; col++) boxes.push({ bx: -50 + col * 50, by: -14 - (row + 1) * 36 });
  }
  return (
    <g data-j={j} transform={`translate(${x} ${y})`}>
      <rect x="-55" y="-14" width="110" height="6" fill="#A8845A" />
      <path d="M-55 -8h14v8h-14zM-7 -8h14v8h-14zM41 -8h14v8h-14z" fill="#8C6A42" />
      <rect x="-55" y="-2" width="110" height="2" fill="#8C6A42" />
      {boxes.map(({ bx, by }) => (
        <g key={`${bx} ${by}`}>
          <rect x={bx} y={by} width="49" height="35" fill="#C9A26E" />
          <rect x={bx} y={by} width="49" height="5" fill="#B48C58" />
          <rect x={bx + 21} y={by} width="7" height="35" fill="#B48C58" opacity="0.7" />
          <rect x={bx + 6} y={by + 14} width="11" height="9" className="fill-accent" opacity="0.9" />
        </g>
      ))}
    </g>
  );
}

/**
 * A feeder container ship, stern at x = 0, bow at x = 1620, waterline at y = 0, with the shipment's place
 * on deck left free. `${j}.wake` (bow wave and wake) and `${j}.lights` (lit cabins) fade with speed and dusk.
 */
export function Ship({ j, x = 0, y = 0, seed = 7 }) {
  const bays = [
    { x: 296, length: 332, tiers: 2 },
    { x: 636, length: 166, tiers: 3 },
    { x: 810, length: 166, tiers: 2 },
    { x: 984, length: 332, tiers: 3 },
    { x: 1324, length: 166, tiers: 2 },
  ];
  const rand = random(seed);
  const stacks = [];
  for (const bay of bays) {
    for (let tier = 0; tier < bay.tiers; tier++) {
      stacks.push({
        key: `${bay.x}-${tier}`,
        x: bay.x + bay.length / 2,
        y: -120 - tier * 72,
        length: bay.length,
        color: CONTAINER_COLORS[Math.floor(rand() * CONTAINER_COLORS.length)],
      });
    }
  }
  return (
    <g data-j={j} transform={`translate(${x} ${y})`}>
      <g data-j={`${j}.wake`} display="none">
        <path d="M-10 6C-120 2 -260 10 -420 4C-300 18 -150 16 -10 14Z" fill="#E6EEF2" opacity="0.55" />
        <path d="M-40 18C-200 22 -380 20 -560 26" stroke="#E6EEF2" strokeOpacity="0.45" strokeWidth="3" fill="none" />
        <path d="M1560 2C1620 -6 1660 4 1700 10C1650 14 1600 12 1560 12Z" fill="#F2F6F8" opacity="0.8" />
      </g>
      <path d="M0 -120H1470Q1540 -122 1600 -152L1622 -152Q1606 -60 1560 0H24Z" fill="#22344D" />
      <path d="M1470 -120Q1540 -122 1600 -152L1622 -152L1620 -140Q1560 -112 1470 -108Z" fill="#E9E6DF" opacity="0.9" />
      <path d="M2 -12H1566L1560 0H24Z" fill="#7A3A34" />
      <path d="M2 -16H1570" stroke="#E9E6DF" strokeWidth="3" />
      <path d="M0 -120H1470" stroke="#3B4F6B" strokeWidth="4" />
      <path d="M60 -120V-400H240V-120Z" fill="#ECE9E2" />
      <path d="M40 -380H260V-404H40Z" fill="#DAD6CE" />
      <path d="M60 -150H240M60 -192H240M60 -234H240M60 -276H240M60 -318H240" stroke="#C9C4BA" strokeWidth="2" />
      <path
        d={[-140, -182, -224, -266, -308, -350]
          .map((wy) => `M76 ${wy}h22M112 ${wy}h22M148 ${wy}h22M184 ${wy}h22`)
          .join("")}
        stroke="#2C3A4F"
        strokeWidth="9"
      />
      <path
        data-j={`${j}.lights`}
        display="none"
        d={[-224, -266, -308, -350].map((wy) => `M76 ${wy}h22M148 ${wy}h22M184 ${wy}h22`).join("")}
        stroke="#F2CF8A"
        strokeWidth="9"
      />
      <path d="M44 -394H256" stroke="#2C3A4F" strokeWidth="8" />
      <path d="M86 -404V-458H140V-404Z" fill="#2C7F7E" />
      <path d="M86 -444H140" stroke="#ECE9E2" strokeWidth="6" />
      <path d="M150 -404V-468M150 -452H178" stroke="#2C3A4F" strokeWidth="3" />
      {stacks.map((stack) => (
        <Container
          key={stack.key}
          x={stack.x}
          y={stack.y}
          length={stack.length - 2}
          color={stack.color}
          detail={false}
        />
      ))}
      <path d="M1500 -152V-230M1500 -214H1530" stroke="#2C3A4F" strokeWidth="3" />
    </g>
  );
}
