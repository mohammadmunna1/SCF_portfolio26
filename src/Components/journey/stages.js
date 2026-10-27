// The journey's progress (0–1) follows the page's scroll: the hero screen takes it to HERO_END (the car's
// drive across the first screen), the rest of the page to 1 (delivered, just as the footer comes up).
// With reduced motion the sketch doesn't move: it changes from one still to the next as the page scrolls.

export const HERO_END = 0.1;

/** [from progress, still shown] — one still per stage of the journey. */
const STILLS = [
  [0, 0], // transport: the car on the country road
  [0.15, 0.205], // the hub: the car has become a delivery truck
  [0.27, 0.33], // manufacturing: the production line running
  [0.4, 0.47], // warehousing: pallets going into the racks
  [0.51, 0.55], // the fork: one channel to the shop, one to the port
  [0.58, 0.63], // local retail: the van at the shop
  [0.66, 0.74], // export: the container loaded aboard
  [0.76, 0.84], // at sea
  [0.9, 1], // delivered
];

/** The still frame for progress `p`, when motion is reduced. */
export function stillAt(p) {
  let still = STILLS[0][1];
  for (const [from, frame] of STILLS) if (p >= from) still = frame;
  return still;
}
