// Where everything sits in the journey's world. Units: at zoom 1 a landscape screen shows 900 of them top to
// bottom. y grows downwards; the main road's far edge is y = 0. The port road and the sea lie lower on the
// screen — nearer the viewer — so the warehouse's two routes can be seen together, one above the other.

/** How fast each layer moves with the camera, across and up/down (the world is 1). */
export const DEPTH = {
  clouds: { x: 0.05, y: 0.04 },
  far: { x: 0.22, y: 0.18 },
  hills: { x: 0.5, y: 0.42 },
  fore: { x: 1.3, y: 1.3 },
};

export const ROAD = { top: 0, lane: 52, bottom: 70 };
export const PORT = { top: 520, lane: 572, bottom: 590 };
export const WATER = 640;
export const HORIZON = 300;

// Left to right, in the order the shipment travels.
export const X = {
  start: 560, // the van, as the page opens
  hub: [2760, 3900],
  canopy: [2980, 3580], // the drive-through cross-dock, where the van becomes a truck
  factory: [4340, 6540],
  receiving: [4420, 4580],
  line: [4660, 6300], // the conveyor; it pauses with goods at each station (every PITCH from its start)
  press: 5120,
  robot: 5580,
  packer: 6040,
  dispatch: [6360, 6520],
  pallet: 6420, // finished goods are stacked here, by the dispatch door
  chimney: 6180,
  warehouse: [6900, 9180],
  inbound: [6980, 7140],
  racks: [7280, 8340],
  doorLocal: [8400, 8540],
  doorExport: [8720, 8860],
  van: 8650, // the retail van waits at door A …
  containerTruck: 9180, // … the container truck at door B
  fork: 9260, // the road splits: up into town, down to the port
  rampEnd: 10380,
  town: [9500, 12050],
  market: [10520, 11180],
  gate: 10520,
  crane: 11620, // between the crane's legs
  pick: 11560, // where the crane lifts the container off the truck
  quay: 11900,
  berth: 11940, // the ship's stern at the origin port
  destQuay: 17020,
  destCrane: 17240,
  dc: [17820, 19020],
};

/** Where the container truck's wheels run: along the road, down the ramp, along the port road to the crane. */
export const RAMP = [
  [X.fork, 52],
  [X.fork + 400, 52],
  [X.rampEnd - 440, 572],
  [X.rampEnd, 572],
];

/** Spacing of the conveyor's stations, and of the goods on it. */
export const PITCH = 230;

/** The racks: four bays, each with two pallet places on the floor and on three beam levels. */
export const RACK = { bay: 265, levels: [-6, -86, -166, -246] };
