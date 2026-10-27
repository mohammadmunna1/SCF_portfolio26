// The story the hero tells while it scrolls: one list drives the captions, the progress controls and the
// screen-reader summary. `start`/`end` place each stage on the journey's progress (0–1); `still` is the
// frame shown for it when motion is reduced.

/** The hero text fades out (and the first caption in) by this point. */
export const HERO_END = 0.03;

export const STAGES = [
  {
    key: "transport",
    label: "Transport",
    title: "Transportation",
    text: "Moving goods from suppliers to where they're needed — on time, intact and at the right cost.",
    start: HERO_END,
    end: 0.115,
    still: 0.075,
  },
  {
    key: "logistics",
    label: "Logistics",
    title: "Logistics",
    text: "At the hub, small loads are consolidated into full trucks for the long haul to the plant.",
    start: 0.115,
    end: 0.215,
    still: 0.2,
  },
  {
    key: "manufacturing",
    label: "Manufacturing",
    title: "Manufacturing",
    text: "Transforming materials into finished products through coordinated production processes.",
    start: 0.215,
    end: 0.375,
    still: 0.315,
  },
  {
    key: "warehousing",
    label: "Warehousing",
    title: "Warehousing & Inventory",
    text: "Managing stock, storage capacity, and outbound distribution with operational efficiency.",
    start: 0.375,
    end: 0.505,
    still: 0.45,
  },
  {
    key: "channels",
    label: "Channels",
    title: "Two Distribution Channels",
    text: "From one warehouse, inventory splits between local retail and international freight.",
    start: 0.505,
    end: 0.56,
    still: 0.545,
  },
  {
    key: "retail",
    label: "Retail",
    title: "Retail Distribution",
    text: "Connecting inventory with retail outlets and ensuring products reach local customers.",
    start: 0.56,
    end: 0.655,
    still: 0.64,
  },
  {
    key: "international",
    label: "International",
    title: "International Logistics",
    text: "Coordinating freight, container handling, port operations, and international transportation.",
    start: 0.655,
    end: 0.8,
    still: 0.715,
  },
  {
    key: "global",
    label: "Global",
    title: "Global Shipping & Delivery",
    text: "Moving products across borders through integrated international logistics networks.",
    start: 0.8,
    end: 0.95,
    still: 0.925,
  },
];

/** The last frame: the journey's end, with the way on into the portfolio. */
export const CLOSING = {
  title: "From a country road to a city overseas.",
  text: "Every handoff is a decision about cost, time and service — the chain I study, and the systems I build for it.",
  start: 0.95,
  still: 1,
};

/** Index of the stage at `p` (−1 for the hero, STAGES.length for the closing frame). */
export function stageAt(p) {
  if (p < HERO_END) return -1;
  if (p >= CLOSING.start) return STAGES.length;
  const index = STAGES.findIndex((stage) => p < stage.end);
  return index === -1 ? STAGES.length - 1 : index;
}

/** Reduced motion: the still frame of the stage at `p`, so the scene cuts between stages instead of moving. */
export function stillAt(p) {
  const index = stageAt(p);
  if (index < 0) return 0;
  return index >= STAGES.length ? CLOSING.still : STAGES[index].still;
}
