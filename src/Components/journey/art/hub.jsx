// The logistics hub: a cross-dock where first-mile vans hand over to line-haul trucks. The van drives
// under the canopy and leaves as a truck — the canopy's front posts and shade pass in front of it.

import { X } from "./layout";
import { Pallet } from "./vehicles";
import { Person } from "./people";

const WALL = "#D6D2C8";
const NAVY = "#24344B";

/** A roll-up dock door with its canopy, seal, bumpers and number; `open` shows the dark interior and goods. */
export function DockDoor({ x, y, w = 110, h = 124, label, open = false, color = "#A9B2BC" }) {
  const slats = [];
  for (let sy = y - h + 10; sy < y - 4; sy += 10) slats.push(`M${x + 4} ${sy}H${x + w - 4}`);
  return (
    <g>
      <rect x={x - 8} y={y - h - 8} width={w + 16} height={h + 8} fill="#3B4656" />
      {open ? (
        <>
          <rect x={x} y={y - h} width={w} height={h} fill="#232B36" />
          <rect x={x} y={y - h} width={w} height="18" fill={color} />
          <path d={`M${x} ${y - h + 18}H${x + w}`} stroke="#0B1220" strokeOpacity="0.3" strokeWidth="2" />
          <g transform={`translate(${x + w / 2} ${y}) scale(0.7)`}>
            <Pallet />
          </g>
        </>
      ) : (
        <>
          <rect x={x} y={y - h} width={w} height={h} fill={color} />
          <path d={slats.join("")} stroke="#0B1220" strokeOpacity="0.14" strokeWidth="1.5" />
        </>
      )}
      <path d={`M${x - 14} ${y - h - 22}H${x + w + 14}L${x + w + 4} ${y - h - 8}H${x - 4}Z`} fill="#56627A" />
      <rect x={x + 8} y={y - 16} width="12" height="16" fill="#1E242C" />
      <rect x={x + w - 20} y={y - 16} width="12" height="16" fill="#1E242C" />
      {label && (
        <text
          x={x + w / 2}
          y={y - h - 30}
          textAnchor="middle"
          className="j-text"
          fontSize="13"
          fontWeight="600"
          fill={NAVY}
          letterSpacing="1"
        >
          {label}
        </text>
      )}
    </g>
  );
}

/** A parked trailer (no tractor) on its landing legs. */
function ParkedTrailer({ x, y, stripe = "#2F7F7D" }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx="180" cy="2" rx="200" ry="5" fill="#0B1220" opacity="0.2" />
      <rect x="0" y="-150" width="366" height="112" rx="4" fill="#E4E2DC" />
      <rect x="0" y="-150" width="366" height="5" fill="#C9C5BC" />
      <rect x="0" y="-62" width="366" height="8" fill={stripe} />
      <rect x="2" y="-40" width="362" height="9" fill="#2A3039" />
      <rect x="300" y="-34" width="6" height="34" fill="#4A5360" />
      {[44, 86].map((cx) => (
        <g key={cx} transform={`translate(${cx} -19)`}>
          <circle r="19" fill="#1D2229" />
          <circle r="11" fill="#AEB6BF" />
        </g>
      ))}
    </g>
  );
}

/** The hub's buildings, yard and sign, behind the road. */
export function Hub() {
  const [x0, x1] = X.hub;
  const base = -60;
  const top = -250;
  const doors = [3020, 3170, 3320, 3470, 3620];
  return (
    <>
      {/* Yard between the building and the road */}
      <rect x={x0 - 40} y={base} width={X.factory[0] - x0 + 60} height={base * -1 - 6} fill="#C8C4B9" />
      <path
        d={`M${x0 - 40} ${base + 18}H${X.factory[0] + 20}M${x0 - 40} ${base + 38}H${X.factory[0] + 20}`}
        stroke="#B4AFA3"
        strokeWidth="2"
      />
      {/* Pylon sign */}
      <g transform={`translate(${x0 - 70} ${base + 4})`}>
        <rect x="-16" y="-262" width="32" height="262" fill="#3A4659" />
        <rect x="-46" y="-300" width="92" height="96" rx="8" fill={NAVY} />
        <circle cx="0" cy="-252" r="26" className="fill-accent" />
        <path
          d="M-12 -254h20l-7 -8M8 -254l-7 8"
          stroke="#F4F1EA"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <text
          x="0"
          y="-214"
          textAnchor="middle"
          className="j-text"
          fontSize="11"
          fontWeight="600"
          fill="#F4F1EA"
          letterSpacing="1.5"
        >
          HUB 01
        </text>
      </g>
      {/* Office wing */}
      <rect x={x0} y={top - 40} width="180" height={base - top + 40} fill="#E2DED5" />
      <rect x={x0} y={top - 40} width="180" height="10" fill="#C3BEB2" />
      {[top - 14, top + 36, top + 86, top + 136].map((wy) => (
        <rect key={wy} x={x0 + 16} y={wy} width="148" height="30" fill="url(#j-glass)" />
      ))}
      <path
        d={[top - 14, top + 36, top + 86, top + 136]
          .map((wy) => `M${x0 + 53} ${wy}v30M${x0 + 90} ${wy}v30M${x0 + 127} ${wy}v30`)
          .join("")}
        stroke="#D6D1C6"
        strokeWidth="3"
      />
      {/* Cross-dock shed */}
      <rect x={x0 + 180} y={top} width={x1 - x0 - 180} height={base - top} fill={WALL} />
      <path
        d={Array.from(
          { length: Math.floor((x1 - x0 - 180) / 18) },
          (_, i) => `M${x0 + 190 + i * 18} ${top + 52}V${base}`,
        ).join("")}
        stroke="#0B1220"
        strokeOpacity="0.05"
        strokeWidth="2"
      />
      <rect x={x0 + 180} y={top} width={x1 - x0 - 180} height="46" fill={NAVY} />
      <text
        x={x1 - 24}
        y={top + 32}
        textAnchor="end"
        className="j-text"
        fontSize="24"
        fontWeight="600"
        fill="#F4F1EA"
        letterSpacing="3"
      >
        LOGISTICS HUB
      </text>
      <path d={`M${x0 + 180} ${top + 46}H${x1}`} stroke="#0B1220" strokeOpacity="0.2" strokeWidth="3" />
      {doors.map((dx, i) => (
        <DockDoor key={dx} x={dx} y={base} label={`0${i + 1}`} open={i === 1 || i === 3} />
      ))}
      <rect x={x0} y={base - 6} width={x1 - x0} height="6" fill="#0B1220" opacity="0.12" />
      <ParkedTrailer x={3760} y={base + 2} />
      {/* Goods waiting on the dock */}
      <g transform={`translate(${2950} ${base})`}>
        <Pallet />
      </g>
      <g transform={`translate(${3320 + 55} ${base + 26}) scale(0.9)`}>
        <Pallet rows={1} />
      </g>
      <Person x={3292} y={base + 20} vest="#E0B33C" helmet="#F4F1EA" shirt="#2F4B62" />
    </>
  );
}

/** The drive-through canopy: the part behind the road (roof and rear posts) … */
export function CanopyBack() {
  const [x0, x1] = X.canopy;
  return (
    <>
      <path d={`M${x0 - 30} -210H${x1 + 30}V-196H${x0 - 30}Z`} fill="#56627A" />
      {[x0, (x0 + x1) / 2, x1].map((px) => (
        <rect key={px} x={px - 7} y="-200" width="14" height="194" fill="#6B778C" />
      ))}
    </>
  );
}

/** … and the part in front of the vehicle: shade, front posts and the fascia with its sign. */
export function CanopyFront() {
  const [x0, x1] = X.canopy;
  return (
    <>
      <rect x={x0 - 20} y="-196" width={x1 - x0 + 40} height="272" fill="#0B1220" opacity="0.12" />
      {[x0, (x0 + x1) / 2, x1].map((px) => (
        <g key={px}>
          <rect x={px - 9} y="-196" width="18" height="276" fill="#4D596C" />
          <rect x={px - 9} y="-196" width="6" height="276" fill="#0B1220" opacity="0.15" />
          <rect x={px - 13} y="70" width="26" height="10" fill="#3B4656" />
        </g>
      ))}
      <path d={`M${x0 - 40} -236H${x1 + 40}V-196H${x0 - 40}Z`} fill="#33415A" />
      <path d={`M${x0 - 40} -236H${x1 + 40}`} stroke="#0B1220" strokeOpacity="0.3" strokeWidth="3" />
      <text
        x={(x0 + x1) / 2}
        y="-209"
        textAnchor="middle"
        className="j-text"
        fontSize="18"
        fontWeight="600"
        fill="#F4F1EA"
        letterSpacing="4"
      >
        CROSS-DOCK · LANE 2
      </text>
    </>
  );
}
