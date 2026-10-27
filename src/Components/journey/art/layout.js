// Where everything stands in the sketch's world. Units are roughly screen pixels at a 900px-tall window;
// y grows downwards and the road the vehicles drive on is y = 0. The parallax layers keep their own x
// (a layer of depth d is seen at the camera's x × d).

import { route } from "../route";

export const DEPTH = { sky: 0.05, far: 0.3, mid: 0.6, world: 1 };

/** The road: its far edge (where buildings stand), where the wheels run, and its near edge. */
export const ROAD = { far: -16, lane: 0, near: 12 };

/** The upper road, climbing from the fork to the shop. */
export const TERRACE = -120;

/** The sea's surface. */
export const WATER = 34;

/** The cranes' boom (its lower chord, where the trolley runs): high enough to swing a container over the
 * ship's bridge. */
export const BOOM = -330;

export const X = {
  farm: 440,
  hub: 1880, // the logistics hub, where the car becomes a truck
  hubEnd: 2240,
  factory: 3200,
  factoryEnd: 3920,
  receiving: 3236, // the factory's receiving door
  parked: 3440, // where the truck stops, its rear at the door
  line: 3540, // the production line, inside the factory…
  press: 3650,
  packer: 3790,
  bridge: 3920, // …the covered conveyor across to the warehouse…
  warehouse: 4100, // …and the warehouse
  warehouseEnd: 4760,
  palletStation: 4235,
  racks: 4340, // two rack bays, 110 wide
  exportDoor: 4620,
  exportTruck: 4700, // the container truck at the export door (the container's centre)
  canopy: 4890, // the local-delivery dock
  van: 5000,
  fork: 5150, // where the road splits: up to the shop, on to the port
  terrace: 5560, // top of the climb
  shop: 5680,
  shopVan: 5590,
  terraceEnd: 6080,
  gate: 6140,
  yard: 6180,
  crane: 6560,
  quay: 6720, // the quay's edge: sea from here
  berth: 6740, // the ship's stern, moored
  lighthouse: 7700,
  buoy: 8500,
  destBerth: 9140,
  destQuay: 9800,
  destCrane: 10000,
  dc: 10500, // the distribution centre at the destination
  dcTruck: 10640,
  end: 11300,
};

/** The van's way from the local dock, up the climb at the fork, to the shop. */
export const UPHILL = route(
  [X.van, ROAD.lane],
  [X.fork, ROAD.lane],
  ["C", [X.fork + 150, ROAD.lane], [X.terrace - 150, TERRACE], [X.terrace, TERRACE]],
  [X.shopVan, TERRACE],
);

/** Where the shipment's container rides on the ship, from its stern and waterline. */
export const SHIP_SLOT = { x: 355, y: -122 };

/** The container: its size seen from the side. */
export const BOX = { w: 150, h: 62 };
