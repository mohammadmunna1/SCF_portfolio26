// The production plant and the warehouse. Each has a facade with a middle panel that fades away (the
// director's "cutaway") to show the work inside: the production line, then the racks.

import { DockDoor } from "./hub";
import { PITCH, RACK, X } from "./layout";
import { Person } from "./people";
import { random } from "./shapes";

const NAVY = "#24344B";
const FLOOR = -6;
const BELT = -92; // top of the conveyor belt, where the goods sit

const rect = (x, y, w, h) => `M${x} ${y}h${w}v${h}h${-w}z`;

/** Hanging factory lamps with a soft cone of light. */
function Lamps({ from, to, gap, y }) {
  const xs = [];
  for (let x = from; x <= to; x += gap) xs.push(x);
  return (
    <>
      <path d={xs.map((x) => `M${x} ${y - 40}V${y - 12}`).join("")} stroke="#3A4452" strokeWidth="2" />
      <path d={xs.map((x) => `M${x - 16} ${y}L${x - 8} ${y - 12}H${x + 8}L${x + 16} ${y}Z`).join("")} fill="#3A4452" />
      <path
        d={xs.map((x) => `M${x - 14} ${y}L${x - 70} ${y + 150}H${x + 70}L${x + 14} ${y}Z`).join("")}
        fill="url(#j-lamp)"
      />
    </>
  );
}

// ——— Production plant ———

/** One unit of goods on the line, in each form it takes: raw stock, stamped part, assembled product, boxed. */
export function Item({ j }) {
  return (
    <g data-j={j} display="none">
      <g data-j={`${j}.raw`}>
        <rect x="-21" y="-26" width="42" height="26" rx="2" fill="#8E979F" />
        <rect x="-21" y="-26" width="42" height="6" rx="2" fill="#B3BAC1" />
        <rect x="9" y="-20" width="12" height="20" fill="#0B1220" opacity="0.12" />
      </g>
      <g data-j={`${j}.part`} display="none">
        <path d="M-21 0V-18Q-21 -26 -13 -26H13Q21 -26 21 -18V0Z" className="fill-accent" />
        <circle cx="0" cy="-12" r="5" fill="#0B1220" opacity="0.28" />
      </g>
      <g data-j={`${j}.cap`} display="none">
        <rect x="-13" y="-34" width="26" height="9" rx="3" fill="#ECE8DF" />
      </g>
      <g data-j={`${j}.box`} display="none">
        <rect x="-23" y="-36" width="46" height="36" fill="#C9A26E" />
        <rect x="-23" y="-36" width="46" height="5" fill="#B48C58" />
        <rect x="-3.5" y="-36" width="7" height="36" fill="#B48C58" opacity="0.7" />
        <rect x="-18" y="-22" width="10" height="9" className="fill-accent" />
      </g>
    </g>
  );
}

/** A billet of raw stock as it's unloaded from the truck (the director moves it). */
export function Crate({ j }) {
  return (
    <g data-j={j} display="none">
      <rect x="-21" y="-26" width="42" height="26" rx="2" fill="#8E979F" />
      <rect x="-21" y="-26" width="42" height="6" rx="2" fill="#B3BAC1" />
    </g>
  );
}

/** Finished goods on a pallet by the dispatch door; boxes appear one by one as the line delivers them. */
export function GoodsPallet({ j, x = 0, y = 0, count = 4, shown = 0 }) {
  return (
    <g data-j={j} transform={`translate(${x} ${y})`}>
      <rect x="-55" y="-14" width="110" height="6" fill="#A8845A" />
      <path d="M-55 -8h14v8h-14zM-7 -8h14v8h-14zM41 -8h14v8h-14z" fill="#8C6A42" />
      {Array.from({ length: count }, (_, i) => {
        const bx = -48 + (i % 2) * 50;
        const by = -14 - (Math.floor(i / 2) + 1) * 37;
        return (
          <g key={i} data-j={`${j}.b${i}`} display={i < shown ? "inline" : "none"}>
            <rect x={bx} y={by} width="46" height="36" fill="#C9A26E" />
            <rect x={bx} y={by} width="46" height="5" fill="#B48C58" />
            <rect x={bx + 19.5} y={by} width="7" height="36" fill="#B48C58" opacity="0.7" />
            <rect x={bx + 5} y={by + 14} width="10" height="9" className="fill-accent" />
          </g>
        );
      })}
    </g>
  );
}

/** Behind the facade: the production line, from raw stock (left) to boxed goods (right). */
export function PlantInterior({ items = 4 }) {
  const [x0, x1] = [X.receiving[1] + 20, X.dispatch[0] - 20];
  const columns = [];
  for (let x = x0 + 150; x < x1; x += 290) columns.push(x);
  const legs = [];
  for (let x = X.line[0] + 30; x < X.line[1]; x += 140) legs.push(rect(x, BELT + 24, 8, FLOOR - BELT - 24));
  return (
    <g data-j="plant.inside" display="none">
      <rect x={x0} y="-270" width={x1 - x0} height="264" fill="#BCB5A7" />
      <rect x={x0} y="-64" width={x1 - x0} height="58" fill="#B0A99B" />
      <path d={columns.map((x) => `M${x} -246h96v34h-96z`).join("")} fill="#E8ECEA" opacity="0.85" />
      <path d={columns.map((x) => rect(x - 7, -270, 14, 264)).join("")} fill="#8C95A2" />
      <rect x={x0} y="-240" width={x1 - x0} height="9" fill="#6E7886" />
      <Lamps from={x0 + 120} to={x1 - 60} gap={290} y={-196} />
      <rect x={x0} y="-16" width={x1 - x0} height="10" fill="#9E998D" />
      <path d={`M${x0} -22H${x1}`} stroke="#D9B44A" strokeWidth="3" strokeDasharray="22 14" />

      {/* Robot pedestal and press frame stand behind the line */}
      <rect x={X.robot - 88} y="-220" width="56" height="214" fill="#3E4B5E" />
      <rect x={X.robot - 98} y="-26" width="76" height="20" fill="#33404F" />
      <g fill="#2F7F7D">
        <rect x={X.press - 68} y="-250" width="20" height="244" />
        <rect x={X.press + 48} y="-250" width="20" height="244" />
      </g>
      <path d={rect(X.press - 52, -250, 6, 244) + rect(X.press + 48, -250, 6, 244)} fill="#0B1220" opacity="0.18" />
      <rect x={X.press - 60} y="-84" width="120" height="78" fill="#2B3743" />
      <path
        d={Array.from({ length: 8 }, (_, i) => `M${X.press - 60 + i * 15} -84l10 0l-12 10h-10z`).join("")}
        fill="#D9B44A"
      />
      <rect x={X.press - 64} y="-196" width="16" height="30" rx="3" fill="#33404F" />
      <circle cx={X.press - 56} cy="-186" r="3" fill="#7BD389" />
      <circle cx={X.press - 56} cy="-176" r="3" fill="#E8B54A" />

      {/* The conveyor */}
      <path d={legs.join("")} fill="#4B5563" />
      <rect x={X.line[0] - 20} y={BELT + 8} width={X.line[1] - X.line[0] + 40} height="16" fill="#5C6673" />
      <rect x={X.line[0] - 20} y={BELT} width={X.line[1] - X.line[0] + 40} height="8" fill="#2C323C" />
      <circle cx={X.line[0] - 20} cy={BELT + 8} r="10" fill="#4B5563" />
      <circle cx={X.line[1] + 20} cy={BELT + 8} r="10" fill="#4B5563" />
      {/* Station marks under the belt, one PITCH apart */}
      <path
        d={Array.from({ length: 8 }, (_, i) => `M${X.line[0] + i * PITCH} ${BELT + 12}v8`).join("")}
        stroke="#D9B44A"
        strokeWidth="3"
      />

      {Array.from({ length: items }, (_, i) => (
        <Item key={i} j={`item${i}`} />
      ))}

      {/* In front of the goods: the press's ram, the robot arm and the packer */}
      <g data-j="press.ram">
        <rect x={X.press - 8} y="-246" width="16" height="60" fill="#A9B3BD" />
        <rect x={X.press - 42} y="-188" width="84" height="18" rx="2" fill="#3A4452" />
        <rect x={X.press - 42} y="-174" width="84" height="4" fill="#0B1220" opacity="0.3" />
      </g>
      <rect x={X.press - 84} y="-264" width="168" height="52" rx="6" fill="#276C6A" />
      <rect x={X.press - 84} y="-226" width="168" height="14" rx="6" fill="#0B1220" opacity="0.15" />
      <rect x={X.press - 20} y="-286" width="40" height="22" fill="#9AA5B0" />
      <g data-j="robot.upper" transform={`translate(${X.robot - 60} -240)`}>
        <rect x="-6" y="-12" width="102" height="24" rx="12" fill="#E3DED3" />
        <rect x="22" y="-12" width="12" height="24" fill="#2F7F7D" />
        <rect x="-6" y="4" width="102" height="8" rx="4" fill="#0B1220" opacity="0.08" />
        <g data-j="robot.fore" transform="translate(90 0)">
          <rect x="-4" y="-9" width="88" height="18" rx="9" fill="#E3DED3" />
          <rect x="-4" y="3" width="88" height="6" rx="3" fill="#0B1220" opacity="0.08" />
          <g data-j="robot.grip" transform="translate(80 0)">
            <rect x="-7" y="0" width="14" height="14" rx="3" fill="#3A4452" />
            <path d="M-11 14h6v14h-6zM5 14h6v14h-6z" fill="#3A4452" />
            <rect data-j="robot.cap" x="-13" y="24" width="26" height="9" rx="3" fill="#ECE8DF" />
          </g>
          <circle r="10" fill="#2F3B4C" />
        </g>
        <circle r="14" fill="#2F3B4C" />
        <circle r="5" fill="#8A95A2" />
      </g>
      <g>
        <rect x={X.packer - 82} y="-238" width="164" height="178" rx="6" fill="#3A4A5E" />
        <rect x={X.packer - 82} y="-238" width="164" height="14" rx="6" fill="#2E3B4C" />
        <rect x={X.packer - 60} y="-200" width="70" height="56" rx="4" fill="url(#j-glass)" />
        <path d={`M${X.packer - 46} -160h42l-8 -16h-26z`} fill="#C9A26E" opacity="0.9" />
        <rect x={X.packer + 22} y="-200" width="40" height="26" rx="3" fill="#1E2A38" />
        <path d={`M${X.packer + 28} -184l8 -6l7 4l10 -9`} stroke="#7BD389" strokeWidth="2" fill="none" />
        <text
          x={X.packer + 42}
          y="-152"
          textAnchor="middle"
          className="j-text"
          fontSize="13"
          fontWeight="600"
          fill="#E9EDF2"
          letterSpacing="2"
        >
          PACK
        </text>
        <circle cx={X.packer - 30} cy="-262" r="26" fill="#C9A26E" />
        <circle cx={X.packer - 30} cy="-262" r="9" fill="#8C6A42" />
        <rect x={X.packer - 34} y="-238" width="8" height="4" fill="#8C6A42" />
      </g>
      {/* The guide rail along the near side of the belt */}
      <rect x={X.line[0] - 20} y={BELT - 7} width={X.packer - 82 - X.line[0] + 20} height="7" fill="#7C8794" />
      <rect x={X.packer + 82} y={BELT - 7} width={X.line[1] + 20 - X.packer - 82} height="7" fill="#7C8794" />

      <Person x={X.press - 150} y={FLOOR} vest="#E0B33C" helmet="#F4F1EA" />
      <Person x={X.packer + 150} y={FLOOR} shirt="#3A5A7A" trousers="#2B3446" skin="#C68B5E" flip />
    </g>
  );
}

/** The plant's facade, silos and chimney; `plant.wall` is the panel that fades for the cutaway. */
export function PlantFacade() {
  const [x0, x1] = X.factory;
  const panel = [X.receiving[1] + 20, X.dispatch[0] - 20];
  const teeth = [];
  for (let x = x0; x < x1 - 40; x += 200) teeth.push(x);
  const pilasters = [];
  for (let x = panel[0] + 145; x < panel[1]; x += 290) pilasters.push(x);
  return (
    <>
      {/* Silos for raw material */}
      {[x0 - 150, x0 - 76].map((sx) => (
        <g key={sx}>
          <rect x={sx} y="-330" width="62" height="300" fill="#C9CED3" />
          <path d={`M${sx} -330a31 18 0 0 1 62 0z`} fill="#AEB4BA" />
          <rect x={sx} y="-330" width="14" height="300" fill="#0B1220" opacity="0.08" />
          <path d={`M${sx + 6} -30V-6M${sx + 56} -30V-6`} stroke="#6B7686" strokeWidth="5" />
          <path d={`M${sx + 50} -320V-40`} stroke="#8D96A1" strokeWidth="2" strokeDasharray="4 6" />
        </g>
      ))}
      <path d={`M${x0 - 120} -346V-372H${x0 + 20}V-306`} stroke="#8D96A1" strokeWidth="10" fill="none" />
      {/* Chimney (with a little steam) */}
      <rect x={X.chimney - 22} y="-580" width="44" height="280" fill="#6E7988" />
      <rect x={X.chimney - 22} y="-560" width="44" height="18" fill="#2F7F7D" />
      <rect x={X.chimney - 22} y="-580" width="12" height="280" fill="#0B1220" opacity="0.12" />
      <g className="j-steam">
        <circle cx={X.chimney} cy="-604" r="20" fill="#F4F2EE" />
        <circle cx={X.chimney + 24} cy="-630" r="26" fill="#F4F2EE" opacity="0.8" />
        <circle cx={X.chimney + 56} cy="-660" r="30" fill="#F4F2EE" opacity="0.55" />
      </g>
      {/* Sawtooth roof */}
      <path d={teeth.map((x) => `M${x} -306L${x + 170} -366V-306Z`).join("")} fill="#56627A" />
      <path d={teeth.map((x) => rect(x + 160, -362, 10, 56)).join("")} fill="#9DB4C6" />
      <path d={teeth.map((x) => `M${x} -306L${x + 170} -366`).join("")} stroke="#6B778C" strokeWidth="3" />
      {/* Sign band */}
      <rect x={x0} y="-306" width={x1 - x0} height="36" fill={NAVY} />
      <text x={x0 + 300} y="-280" className="j-text" fontSize="22" fontWeight="600" fill="#F4F1EA" letterSpacing="4">
        PRODUCTION PLANT
      </text>
      <circle cx={x0 + 270} cy="-288" r="11" className="fill-accent" />
      {/* Fixed ends of the facade, with the receiving and dispatch doors */}
      <rect x={x0} y="-270" width={panel[0] - x0} height="264" fill="#D8D2C6" />
      <rect x={panel[1]} y="-270" width={x1 - panel[1]} height="264" fill="#D8D2C6" />
      <DockDoor x={X.receiving[0]} y={FLOOR} w={X.receiving[1] - X.receiving[0]} h={140} label="RECEIVING" />
      <rect
        data-j="plant.inOpen"
        x={X.receiving[0]}
        y={FLOOR - 140}
        width={X.receiving[1] - X.receiving[0]}
        height="140"
        fill="#20262F"
        opacity="0"
      />
      <DockDoor x={X.dispatch[0]} y={FLOOR} w={X.dispatch[1] - X.dispatch[0]} h={140} label="DISPATCH" />
      <rect
        data-j="plant.outOpen"
        x={X.dispatch[0]}
        y={FLOOR - 140}
        width={X.dispatch[1] - X.dispatch[0]}
        height="140"
        fill="#20262F"
        opacity="0"
      />
      {/* The middle panel: wall, pilasters and windows — fades for the cutaway */}
      <g data-j="plant.wall">
        <rect x={panel[0]} y="-270" width={panel[1] - panel[0]} height="264" fill="#D8D2C6" />
        <rect x={panel[0]} y="-62" width={panel[1] - panel[0]} height="56" fill="#CFC8BA" />
        <path d={pilasters.map((x) => rect(x - 9, -270, 18, 264)).join("")} fill="#C8C1B3" />
        <path d={pilasters.map((x) => rect(x + 30, -236, 220, 34)).join("")} fill="url(#j-glass)" />
        <path
          d={pilasters.map((x) => `M${x + 85} -236v34M${x + 140} -236v34M${x + 195} -236v34`).join("")}
          stroke="#D8D2C6"
          strokeWidth="4"
        />
        <rect x={panel[0] + 40} y="-150" width="40" height="144" fill="#9BA4AE" />
      </g>
      <rect x={x0} y="-12" width={x1 - x0} height="6" fill="#0B1220" opacity="0.1" />
    </>
  );
}

// ——— Warehouse ———

/** Stock in the racks: pallets of boxes on every level, one place left free for the incoming pallet. */
function RackStock() {
  const rand = random(12);
  const pallets = [];
  const boxes = [];
  const tape = [];
  const labels = [];
  for (let bay = 0; bay < 4; bay++) {
    for (const [level, y] of RACK.levels.entries()) {
      for (const slot of [0, 1]) {
        if (bay === 1 && level === 2 && slot === 0) continue; // the free place
        if (rand() < 0.12) continue;
        const cx = X.racks[0] + bay * RACK.bay + (slot ? 195 : 70);
        pallets.push(
          rect(cx - 52, y - 12, 104, 6) +
            rect(cx - 52, y - 6, 12, 6) +
            rect(cx - 6, y - 6, 12, 6) +
            rect(cx + 40, y - 6, 12, 6),
        );
        const rows = level === 3 || rand() < 0.5 ? 1 : 2;
        for (let row = 0; row < rows; row++) {
          for (const col of [0, 1]) {
            const bx = cx - 48 + col * 49;
            const by = y - 12 - (row + 1) * 30;
            boxes.push(rect(bx, by, 47, 29));
            tape.push(rect(bx + 20, by, 7, 29));
            if (rand() < 0.6) labels.push(rect(bx + 5, by + 11, 9, 8));
          }
        }
      }
    }
  }
  return (
    <>
      <path d={pallets.join("")} fill="#9A7A52" />
      <path d={boxes.join("")} fill="#C49D69" />
      <path d={tape.join("")} fill="#AF8854" opacity="0.8" />
      <path d={labels.join("")} className="fill-accent" opacity="0.85" />
    </>
  );
}

/** Behind the warehouse facade: racks of stock, high windows and lights. */
export function StoreInterior() {
  const [x0, x1] = [X.inbound[1] + 40, X.doorLocal[0] - 40];
  const uprights = [];
  for (let bay = 0; bay <= 4; bay++) uprights.push(X.racks[0] + bay * RACK.bay);
  const beams = RACK.levels
    .slice(1)
    .map((y) => rect(X.racks[0], y, X.racks[1] - X.racks[0], 9))
    .join("");
  return (
    <g data-j="store.inside" display="none">
      <rect x={x0} y="-300" width={x1 - x0} height="294" fill="#A7B1BD" />
      <path
        d={Array.from({ length: Math.ceil((x1 - x0) / 220) }, (_, i) => rect(x0 + 40 + i * 220, -284, 150, 26)).join(
          "",
        )}
        fill="#E5EBEE"
        opacity="0.8"
      />
      <Lamps from={x0 + 110} to={x1 - 40} gap={265} y={-250} />
      <rect x={x0} y="-16" width={x1 - x0} height="10" fill="#959CA4" />
      <path d={`M${x0} -24H${x1}`} stroke="#D9B44A" strokeWidth="3" />
      <RackStock />
      <path d={uprights.map((x) => rect(x - 5, -322, 10, 316)).join("")} fill="#3F5A7E" />
      <path d={beams} fill="#7D8C9C" />
      <path d={uprights.map((x) => `M${x} -310l-6 6M${x} -270l6 6`).join("")} stroke="#3F5A7E" strokeWidth="2" />
      {["A1", "A2", "A3", "A4"].map((label, bay) => (
        <g key={label} transform={`translate(${X.racks[0] + bay * RACK.bay + RACK.bay / 2} -332)`}>
          <rect x="-20" y="-12" width="40" height="18" rx="3" fill="#2F7F7D" />
          <text
            y="2"
            textAnchor="middle"
            className="j-text"
            fontSize="11"
            fontWeight="600"
            fill="#F4F1EA"
            letterSpacing="1"
          >
            {label}
          </text>
        </g>
      ))}
      <g transform={`translate(${X.racks[1] - 150} -296)`}>
        <rect width="128" height="40" rx="5" fill="#1E2A38" />
        <text x="12" y="16" className="j-text" fontSize="9" fontWeight="600" fill="#9FB0C2" letterSpacing="1.5">
          ON HAND
        </text>
        <text
          data-j="stock"
          x="12"
          y="33"
          className="j-text"
          fontSize="15"
          fontWeight="600"
          fill="#7BD389"
          letterSpacing="1"
        >
          1,244 units
        </text>
      </g>
      <Person x={x1 - 60} y={FLOOR} vest="#E0B33C" shirt="#2F4B62" flip />
    </g>
  );
}

/** The warehouse's facade; `store.wall` is the panel that fades for the cutaway. */
export function StoreFacade() {
  const [x0, x1] = X.warehouse;
  const panel = [X.inbound[1] + 40, X.doorLocal[0] - 40];
  const ribs = [];
  for (let x = x0 + 8; x < x1; x += 16) ribs.push(`M${x} -300V-6`);
  const panelRibs = ribs.filter((d) => {
    const x = Number(d.slice(1).split(" ")[0]);
    return x > panel[0] && x < panel[1];
  });
  const fixedRibs = ribs.filter((d) => !panelRibs.includes(d));
  return (
    <>
      <rect x={x0 - 10} y="-344" width={x1 - x0 + 20} height="12" fill="#5B687B" />
      <rect x={x0} y="-336" width={x1 - x0} height="36" fill={NAVY} />
      <text x={x0 + 60} y="-310" className="j-text" fontSize="22" fontWeight="600" fill="#F4F1EA" letterSpacing="4">
        WAREHOUSE
      </text>
      <text
        x={x1 - 60}
        y="-310"
        textAnchor="end"
        className="j-text"
        fontSize="14"
        fontWeight="500"
        fill="#F4F1EA"
        opacity="0.7"
        letterSpacing="3"
      >
        INVENTORY · DISTRIBUTION
      </text>
      <rect x={x0} y="-300" width={panel[0] - x0} height="294" fill="#8E9DAF" />
      <rect x={panel[1]} y="-300" width={x1 - panel[1]} height="294" fill="#8E9DAF" />
      <path d={fixedRibs.join("")} stroke="#0B1220" strokeOpacity="0.09" strokeWidth="3" />
      <rect x={x0} y="-170" width={panel[0] - x0} height="8" fill="#7D8C9F" />
      <rect x={panel[1]} y="-170" width={x1 - panel[1]} height="8" fill="#7D8C9F" />
      <DockDoor x={X.inbound[0]} y={FLOOR} w={X.inbound[1] - X.inbound[0]} h={140} label="INBOUND" />
      <rect
        data-j="store.inOpen"
        x={X.inbound[0]}
        y={FLOOR - 140}
        width={X.inbound[1] - X.inbound[0]}
        height="140"
        fill="#20262F"
        opacity="0"
      />
      <DockDoor x={X.doorLocal[0]} y={FLOOR} w={X.doorLocal[1] - X.doorLocal[0]} h={140} label="A · LOCAL" open />
      <DockDoor x={X.doorExport[0]} y={FLOOR} w={X.doorExport[1] - X.doorExport[0]} h={140} label="B · EXPORT" open />
      <g data-j="store.wall">
        <rect x={panel[0]} y="-300" width={panel[1] - panel[0]} height="294" fill="#8E9DAF" />
        <path d={panelRibs.join("")} stroke="#0B1220" strokeOpacity="0.09" strokeWidth="3" />
        <rect x={panel[0]} y="-170" width={panel[1] - panel[0]} height="8" fill="#7D8C9F" />
        <path
          d={Array.from({ length: 4 }, (_, i) => rect(panel[0] + 80 + i * 280, -270, 160, 30)).join("")}
          fill="url(#j-glass)"
        />
      </g>
      <rect x={x0} y="-12" width={x1 - x0} height="6" fill="#0B1220" opacity="0.1" />
    </>
  );
}
