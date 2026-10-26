import { LuFactory, LuPackageCheck, LuTruck, LuWarehouse } from "react-icons/lu";

// The ring runs around a box of 500 × 600 units (the illustration's aspect ratio); node positions are the
// same points as percentages, so the HTML nodes sit exactly on the drawn route at every size.
const RING = "M106 16H394Q454 16 454 76V504Q454 564 394 564H106Q46 564 46 504V76Q46 16 106 16Z";
// The leg "in transit": from the warehouse round the corner to the truck, drawn in the accent colour.
const IN_TRANSIT = "M190 16H394Q454 16 454 76V330";

const NODES = [
  { icon: LuFactory, label: "Source", x: 46, y: 170, labelSide: "left" },
  { icon: LuWarehouse, label: "Store", x: 190, y: 16, labelSide: "top" },
  { icon: LuTruck, label: "Move", x: 454, y: 330, labelSide: "right", active: true },
  { icon: LuPackageCheck, label: "Deliver", x: 170, y: 564, labelSide: "bottom" },
];

const LABEL_POSITION = {
  left: "right-full top-1/2 mr-2.5 -translate-y-1/2",
  right: "left-full top-1/2 ml-2.5 -translate-y-1/2",
  top: "bottom-full left-1/2 mb-2 -translate-x-1/2",
  bottom: "top-full left-1/2 mt-2 -translate-x-1/2",
};

/**
 * A supply chain drawn as a ring road — source, store, move, deliver — around whatever sits inside it
 * (the hero portrait). Line art in the palette's colours, so it suits light and dark themes alike.
 * Purely decorative: hidden from assistive technology.
 */
export default function NetworkRing({ className = "" }) {
  return (
    <div aria-hidden="true" className={`pointer-events-none absolute inset-0 ${className}`}>
      <svg viewBox="0 0 500 600" className="absolute inset-0 h-full w-full overflow-visible" fill="none">
        <path d={RING} className="stroke-line-strong" strokeWidth="1.5" strokeDasharray="2 7" strokeLinecap="round" />
        <path d={IN_TRANSIT} className="stroke-accent" strokeWidth="2" strokeLinecap="round" />
      </svg>
      {NODES.map(({ icon: Icon, label, x, y, labelSide, active }) => (
        <span
          key={label}
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${(x / 500) * 100}%`, top: `${(y / 600) * 100}%` }}
        >
          <span
            className={`grid h-10 w-10 place-items-center rounded-full border shadow-sm md:h-11 md:w-11 ${
              active ? "border-accent bg-accent text-accent-on" : "border-line bg-surface-raised text-heading"
            }`}
          >
            <Icon className="h-[18px] w-[18px]" />
          </span>
          <span className={`eyebrow absolute hidden whitespace-nowrap text-[0.6875rem] sm:block ${LABEL_POSITION[labelSide]}`}>
            {label}
          </span>
        </span>
      ))}
    </div>
  );
}
