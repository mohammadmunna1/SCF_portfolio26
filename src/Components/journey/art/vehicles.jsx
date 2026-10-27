// The sketch's vehicles, facing right with their wheels on y = 0. The director moves them (data-j), turns
// their wheels and, for the car, redraws the outline as it grows into a delivery truck.

import { Drawing, Ink, Label, Paper } from "./draw";
import { BOX, SHIP_SLOT } from "./layout";
import { pencil } from "./pen";
import {
  CAB,
  FORKLIFT,
  FORKLIFT_WHEELS,
  TRACTOR_WHEELS,
  VAN,
  VAN_WHEELS,
  containerStrokes,
  outline,
  palletPaper,
  palletStrokes,
  polyPath,
  rectPath,
  rigShape,
} from "./shapes";

/** Hatched shade on the road under a vehicle, from x0 to x1. */
function shadow(seed, x0, x1) {
  const pen = pencil(seed);
  for (let x = x0; x < x1; x += 9) pen.line(x, 3, x + 6, -1.5, 0);
  return pen;
}

/** A wheel drawn at radius 16: the director places it, turns it and scales it to its size. */
export function Wheel({ j }) {
  const spokes = pencil(9);
  for (let k = 0; k < 5; k++) {
    const a = (k * 72 * Math.PI) / 180;
    spokes.line(Math.cos(a) * 3.2, Math.sin(a) * 3.2, Math.cos(a) * 8.5, Math.sin(a) * 8.5, 0);
  }
  return (
    <g data-j={j}>
      <circle className="sk-paper" r="16" />
      <Ink pen={pencil(7).ring(0, 0, 16)} weight="bold" />
      <Ink pen={pencil(8).ring(0, 0, 8.5).ring(0, 0, 2.2)} weight="fine" />
      <Ink pen={spokes} weight="fine" />
    </g>
  );
}

function carDetails() {
  const pen = pencil(21);
  pen.lines(
    [
      [-47, -44],
      [-29, -60],
      [-8, -60],
      [-8, -44],
    ],
    true,
    1.2,
  );
  pen.lines(
    [
      [-4, -44],
      [-4, -60],
      [13, -60],
      [34, -44],
    ],
    true,
    1.2,
  );
  pen.line(-48, -42, -48, -16, 1).line(-6, -43, -6, -15, 1).line(36, -41, 36, -16, 1);
  pen.line(-41, -35, -33, -35, 0.5).line(1, -36, 9, -36, 0.5);
  pen.circle(83, -32, 3, 2).rect(-88, -33, 4, 7, 0.5);
  pen.line(78, -18, 90, -18, 1).line(-90, -18, -80, -18, 1);
  pen.line(40, -46, 45, -50, 0.5);
  // A parcel on the back seat: the first mile's load
  pen.rect(-27, -56, 14, 11, 0.8).line(-20, -56, -20, -45, 0);
  return pen;
}

function truckDetails() {
  const pen = pencil(31);
  pen.line(40, -112, 40, -26, 1.5);
  pen.lines(
    [
      [48, -105],
      [82, -105],
      [99, -74],
      [48, -74],
    ],
    true,
    1.2,
  );
  pen.line(100, -70, 100, -30, 1).line(52, -66, 60, -66, 0.4).line(50, -30, 64, -30, 1);
  pen.rect(104, -52, 8, 6, 0.5).line(100, -28, 115, -28, 1.5);
  pen.line(97, -106, 101, -88, 1).line(101, -88, 104, -88, 0.5);
  for (const x of [-152, -108, -64, -20]) pen.line(x, -148, x, -30, 0);
  pen.line(-190, -44, 34, -44, 1.5).line(-184, -110, -184, -80, 0.5);
  pen.rect(4, -40, 26, 11, 0.8);
  // The parcel mark on the box
  pen.rect(-96, -122, 28, 22, 0.8).line(-82, -122, -82, -100, 0).line(-96, -114, -68, -114, 0);
  return pen;
}

/**
 * The first-mile car, which grows into the line-haul delivery truck on its way past the hub. The director
 * redraws the outline (`.body`, `.paper`), places the wheels, and erases the car's details as the truck's
 * are drawn in.
 */
export function Rig({ j }) {
  const { d, wheels } = rigShape(0);
  return (
    <Drawing at={-200} len={260} data-j={j}>
      <Ink pen={shadow(11, -84, 86)} weight="hatch" j={`${j}.carShade`} own />
      <Ink pen={shadow(12, -192, 110)} weight="hatch" j={`${j}.truckShade`} own />
      <Paper d={d} j={`${j}.paper`} />
      <path className="sk-bold" d={d} pathLength="1" strokeDasharray="1 2" data-j={`${j}.body`} />
      <Ink pen={carDetails()} weight="fine" j={`${j}.car`} own />
      <Ink pen={truckDetails()} weight="fine" j={`${j}.truck`} own />
      {wheels.map((_, k) => (
        <Wheel key={k} j={`${j}.w${k}`} />
      ))}
    </Drawing>
  );
}

/** The local-delivery van, for the shop. */
export function Van({ j, at }) {
  const d = outline(VAN, VAN_WHEELS);
  const lines = pencil(41);
  lines.lines(
    [
      [34, -82],
      [56, -77],
      [76, -53],
      [34, -53],
    ],
    true,
    1.2,
  );
  lines.line(-40, -84, -40, -17, 1).line(30, -86, 30, -17, 1).line(-90, -84, -90, -17, 1);
  lines.line(-34, -50, -26, -50, 0.4).line(36, -46, 44, -46, 0.4);
  lines.line(-93, -36, 93, -36, 1.5).rect(87, -44, 6, 5, 0.5).line(84, -20, 97, -20, 1.2);
  // A shopping-bag mark on the side
  lines.rect(-12, -74, 18, 16, 0.6).arc(-3, -74, 5, 180, 360);
  return (
    <Drawing at={at} len={240} data-j={j}>
      <Ink pen={shadow(42, -92, 94)} weight="hatch" />
      <Paper d={d} />
      <Ink pen={pencil(43).raw(d, 560)} weight="bold" />
      <Ink pen={lines} weight="fine" />
      {VAN_WHEELS.map((_, k) => (
        <Wheel key={k} j={`${j}.w${k}`} />
      ))}
    </Drawing>
  );
}

/** A tractor and its container chassis — the container rides on it separately (see Container). */
export function ContainerTruck({ j, at, seed = 51 }) {
  const cab = outline(CAB, [TRACTOR_WHEELS[3]]);
  const chassis = pencil(seed);
  chassis.rect(-82, -36, 170, 8, 1.5).line(62, -28, 62, -8, 0.5).line(57, -8, 67, -8, 0.3);
  chassis.arc(-52, -15, 19, 190, 350).arc(-18, -15, 19, 190, 350);
  chassis.line(80, -30, 114, -30, 1).line(86, -38, 110, -38, 1);
  const details = pencil(seed + 1);
  details.lines(
    [
      [124, -112],
      [163, -112],
      [172, -92],
      [124, -92],
    ],
    true,
    1.2,
  );
  details.line(120, -90, 120, -34, 1).line(126, -84, 134, -84, 0.4);
  details.rect(104, -150, 6, 112, 1).rect(174, -50, 7, 6, 0.5).line(170, -25, 184, -25, 1.2);
  return (
    <Drawing at={at} len={240} data-j={j}>
      <Ink pen={shadow(seed + 2, -86, 184)} weight="hatch" />
      <Paper d={`${rectPath(-82, -36, 170, 8)}${cab}`} />
      <Ink pen={chassis} weight="line" />
      <Ink pen={pencil(seed + 3).raw(cab, 420)} weight="bold" />
      <Ink pen={details} weight="fine" />
      {TRACTOR_WHEELS.map((_, k) => (
        <Wheel key={k} j={`${j}.w${k}`} />
      ))}
    </Drawing>
  );
}

/**
 * The shipment: a hatched container (its bottom centre at the origin), carried in turn by the truck, the
 * crane and the ship.
 */
export function Container({ j, at }) {
  const { w, h } = BOX;
  const edge = pencil(61).rect(-w / 2, -h, w, h, 1.5);
  edge.line(-w / 2 + 3, -h + 5, w / 2 - 3, -h + 5, 0).line(-w / 2 + 3, -5, w / 2 - 3, -5, 0);
  const shade = pencil(62).hatch(
    [
      [-w / 2, -h],
      [w / 2, -h],
      [w / 2, 0],
      [-w / 2, 0],
    ],
    6.5,
    -55,
  );
  return (
    <Drawing at={at} len={220} data-j={j}>
      <Paper d={rectPath(-w / 2, -h, w, h)} />
      <Ink pen={shade} weight="hatch" />
      <Ink pen={edge} weight="bold" />
      <Paper d={rectPath(-62, -40, 58, 17)} />
      <Ink pen={pencil(63).rect(-62, -40, 58, 17, 0.6)} weight="fine" />
      <Label x={-33} y={-27.5} size={11} anchor="middle">
        SCF·01
      </Label>
    </Drawing>
  );
}

/** A pallet on its own (static), its bottom-left corner at (x, y). */
export function Pallet({ x, y, seed, j, ...rest }) {
  const outlinePen = pencil(seed);
  const finePen = pencil(seed + 1);
  palletStrokes(outlinePen, finePen, x, y);
  return (
    <g data-j={j} {...rest}>
      <Paper d={palletPaper(x, y)} />
      <Ink pen={outlinePen} weight="line" />
      <Ink pen={finePen} weight="fine" />
    </g>
  );
}

/**
 * The warehouse forklift. Its carriage and forks (`.forks`) rise up the mast with the load (`.load`, shown
 * while it carries a pallet).
 */
export function Forklift({ j, at }) {
  const d = outline(FORKLIFT, FORKLIFT_WHEELS);
  const frame = pencil(71);
  frame.line(-22, -54, -18, -102, 1.5).line(26, -54, 24, -102, 1.5).line(-26, -102, 30, -102, 2);
  frame.line(40, -2, 40, -116, 1).line(46, -2, 46, -116, 1).line(40, -60, 46, -60, 0).line(40, -112, 46, -112, 0);
  const driver = pencil(72).circle(-2, -78, 6).line(-2, -72, -4, -56, 0.5).line(-2, -66, 10, -64, 0.5);
  driver.line(14, -54, 9, -70, 0.5).line(4, -71, 14, -69, 0.5).rect(-36, -60, 18, 6, 0.5);
  const forks = pencil(73).line(48, -4, 48, -46, 1).line(52, -46, 52, -4, 1);
  const tines = pencil(74).line(48, -5, 106, -5, 1).line(106, -5, 108, -9, 0);
  const loadLines = pencil(75);
  const loadFine = pencil(76);
  palletStrokes(loadLines, loadFine, 48, -6);
  return (
    <Drawing at={at} len={240} data-j={j}>
      <Ink pen={shadow(77, -48, 38)} weight="hatch" />
      <Paper d={d} />
      <Ink pen={pencil(78).raw(d, 300)} weight="bold" />
      <Ink pen={frame} weight="line" />
      <Ink pen={driver} weight="fine" />
      <g data-j={`${j}.forks`}>
        <Ink pen={forks} weight="line" />
        <Ink pen={tines} weight="bold" />
        <g data-j={`${j}.load`}>
          <Paper d={palletPaper(48, -6)} />
          <Ink pen={loadLines} weight="line" />
          <Ink pen={loadFine} weight="fine" />
        </g>
      </g>
      {FORKLIFT_WHEELS.map((_, k) => (
        <Wheel key={k} j={`${j}.w${k}`} />
      ))}
    </Drawing>
  );
}

const HULL = [
  [0, -60],
  [598, -60],
  [642, -74],
  [622, -8],
  [606, 6],
  [18, 6],
  [2, -6],
];

/**
 * The container ship, drawn from its stern at the waterline (the origin). Its bays carry other cargo; the
 * shipment's slot (SHIP_SLOT) is left free for the crane to fill.
 */
export function Ship({ j, at }) {
  const hull = polyPath(HULL);
  const lines = pencil(81);
  lines.line(6, -52, 598, -52, 0).line(4, -7, 618, -7, 0);
  lines.line(598, -74, 598, -142, 1).line(588, -130, 608, -130, 1).line(612, -56, 618, -44, 0.5);
  const house = pencil(82).rect(14, -190, 86, 130, 2).line(2, -178, 112, -178, 2);
  const funnel = [
    [30, -190],
    [35, -226],
    [64, -226],
    [69, -190],
  ];
  house.lines(funnel, true, 1.5).line(33, -212, 66, -212, 0);
  const windows = pencil(83);
  for (let k = 0; k < 6; k++) windows.rect(20 + k * 13, -172, 8, 7, 0.3);
  for (const y of [-148, -124, -100, -76]) for (let k = 0; k < 6; k++) windows.rect(22 + k * 13, y, 5, 5, 0);
  const boxes = pencil(84);
  const ribs = pencil(85);
  let paper = `${hull}${rectPath(14, -190, 86, 130)}${polyPath(funnel)}`;
  [2, 1, 2].forEach((tiers, bay) => {
    for (let tier = 0; tier < tiers; tier++) {
      const x = SHIP_SLOT.x - 225 + bay * BOX.w;
      const y = -60 - tier * BOX.h;
      containerStrokes(boxes, ribs, x, y);
      paper += rectPath(x, y - BOX.h, BOX.w, BOX.h);
    }
  });
  const wash = pencil(86);
  for (let k = 0; k < 9; k++) wash.arc(80 + k * 64, 4, 9, 200, 340, 3);
  return (
    <Drawing at={at} len={420} data-j={j}>
      <Paper d={paper} />
      <Ink pen={pencil(87).raw(hull, 1420)} weight="bold" />
      <Ink pen={house} weight="line" />
      <Ink pen={boxes} weight="line" />
      <Ink pen={ribs} weight="fine" />
      <Ink pen={windows} weight="fine" />
      <Ink pen={lines} weight="fine" />
      <Ink pen={wash} weight="hatch" />
    </Drawing>
  );
}
