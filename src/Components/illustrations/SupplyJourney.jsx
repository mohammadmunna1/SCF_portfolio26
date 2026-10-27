import { useReducedMotion } from "framer-motion";
import { useEffect, useRef } from "react";
import {
  LuAnchor,
  LuContainer,
  LuFactory,
  LuPlane,
  LuShip,
  LuStore,
  LuTrainFront,
  LuTruck,
  LuUserRound,
  LuWarehouse,
  LuWheat,
} from "react-icons/lu";

// Drawn in a 500 × 600 box (the illustration's aspect ratio): the HTML stops are placed by percentage,
// so they sit exactly on the SVG route at every size.
const RING = "M106 16H394Q454 16 454 76V504Q454 564 394 564H106Q46 564 46 504V76Q46 16 106 16Z";
// The leg a shipment travels: from the field (left side) clockwise round the ring to the consumer.
const JOURNEY = "M46 300V76Q46 16 106 16H394Q454 16 454 76V504Q454 564 394 564H150";

// In travel order. The top-right and lower-left stretches stay free for the labels pinned to the portrait.
const STOPS = [
  { icon: LuWheat, label: "Field", x: 46, y: 300 },
  { icon: LuFactory, label: "Factory", x: 46, y: 200 },
  { icon: LuContainer, label: "Cargo", x: 46, y: 76 },
  { icon: LuAnchor, label: "Port", x: 106, y: 16 },
  { icon: LuShip, label: "Sea freight", x: 190, y: 16 },
  { icon: LuPlane, label: "Air freight", x: 454, y: 190 },
  { icon: LuTrainFront, label: "Rail", x: 454, y: 320 },
  { icon: LuWarehouse, label: "Warehouse", x: 454, y: 450 },
  { icon: LuTruck, label: "Road", x: 350, y: 564 },
  { icon: LuStore, label: "Retail", x: 250, y: 564 },
  { icon: LuUserRound, label: "Consumer", x: 150, y: 564 },
];

// One trip takes TRAVEL ms; the shipment then rests at the consumer and the route fades before the next.
const TRAVEL = 11000;
const HOLD = 1400;
const FADE = 600;
const CYCLE = TRAVEL + HOLD + FADE;

/** Where each stop sits along the journey (0–1), found by sampling the path once. */
function stopPositions(path) {
  const length = path.getTotalLength();
  const samples = Array.from({ length: 501 }, (_, i) => path.getPointAtLength((i / 500) * length));
  return STOPS.map(({ x, y }) => {
    let best = 0;
    samples.forEach((point, i) => {
      const distance = (point.x - x) ** 2 + (point.y - y) ** 2;
      if (distance < (samples[best].x - x) ** 2 + (samples[best].y - y) ** 2) best = i;
    });
    return best / 500;
  });
}

/**
 * A supply chain from field to consumer, drawn as a ring road round whatever sits inside it (the hero
 * portrait): a shipment travels from stop to stop — factory, cargo, port, sea and air freight, rail,
 * warehouse, road, retail — the route tracing in lightly behind it, and each stop takes a soft accent
 * tint as it's reached, so the ring complements the portrait rather than competing with it.
 * The caption below shows how much of the route is drawn, as a percentage that keeps pace with the line,
 * and names the current stage. The trip pauses while off screen; with reduced motion the whole route is
 * shown, still. Decorative: hidden from assistive technology.
 */
export default function SupplyJourney({ className = "" }) {
  const reduceMotion = useReducedMotion();
  const rootRef = useRef(null);
  const journeyRef = useRef(null);
  const progressRef = useRef(null);
  const markerRef = useRef(null);
  const percentRef = useRef(null);
  const labelRef = useRef(null);
  const stopRefs = useRef([]);

  useEffect(() => {
    const journey = journeyRef.current;
    if (reduceMotion || !journey || typeof IntersectionObserver === "undefined") return undefined;
    const length = journey.getTotalLength();
    const at = stopPositions(journey);
    const states = STOPS.map(() => "");
    let current = 0;
    let percent = 0;
    let frame = 0;
    let started = 0;
    let elapsed = 0;

    const render = (now) => {
      const time = (elapsed + now - started) % CYCLE;
      const t = Math.min(time / TRAVEL, 1);
      const fading = time > TRAVEL + HOLD;
      const opacity = fading ? String(1 - (time - TRAVEL - HOLD) / FADE) : "1";
      const point = journey.getPointAtLength(t * length);
      progressRef.current.style.strokeDashoffset = String(1 - t);
      // How much of the route is drawn, from the same t as the line: 100% exactly as it completes, held
      // there while the route rests and fades, back to 0% as the next trip sets off.
      const drawn = Math.floor(t * 100);
      if (drawn !== percent) {
        percent = drawn;
        percentRef.current.textContent = `${drawn}%`;
      }
      progressRef.current.style.opacity = opacity;
      markerRef.current.setAttribute("transform", `translate(${point.x} ${point.y})`);
      markerRef.current.style.opacity = opacity;

      // The stop just reached is "here", earlier ones "passed"; all reset while the route fades.
      let reached = 0;
      at.forEach((stopAt, i) => {
        if (t >= stopAt - 0.002) reached = i;
      });
      STOPS.forEach((_, i) => {
        const state = fading ? "" : i < reached ? "passed" : i === reached ? "here" : "";
        if (state !== states[i]) {
          states[i] = state;
          stopRefs.current[i].dataset.state = state;
        }
      });
      if (reached !== current) {
        current = reached;
        labelRef.current.textContent = STOPS[reached].label;
      }
      frame = requestAnimationFrame(render);
    };

    const play = () => {
      if (frame) return;
      started = performance.now();
      frame = requestAnimationFrame(render);
    };
    const pause = () => {
      if (!frame) return;
      cancelAnimationFrame(frame);
      frame = 0;
      elapsed += performance.now() - started;
    };
    const observer = new IntersectionObserver(([entry]) => (entry.isIntersecting ? play() : pause()));
    observer.observe(rootRef.current);
    return () => {
      observer.disconnect();
      pause();
    };
  }, [reduceMotion]);

  return (
    <div ref={rootRef} aria-hidden="true" className={`pointer-events-none absolute inset-0 ${className}`}>
      <svg viewBox="0 0 500 600" className="absolute inset-0 h-full w-full overflow-visible" fill="none">
        <path d={RING} className="stroke-line-strong" strokeWidth="1.5" strokeDasharray="2 7" strokeLinecap="round" />
        <path ref={journeyRef} d={JOURNEY} />
        {/* The route behind the shipment (all of it, still, with reduced motion): a light trace, so the
            portrait stays the focus */}
        <path
          ref={progressRef}
          d={JOURNEY}
          pathLength="1"
          className="stroke-accent/45"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray="1"
          style={{ strokeDashoffset: reduceMotion ? 0 : 1 }}
        />
        {!reduceMotion && (
          <g ref={markerRef} transform={`translate(${STOPS[0].x} ${STOPS[0].y})`}>
            <circle r="8" className="fill-accent/10" />
            <circle r="3.5" className="fill-accent/70" />
          </g>
        )}
      </svg>

      {STOPS.map(({ icon: Icon, label, x, y }, index) => (
        <span
          key={label}
          ref={(element) => {
            stopRefs.current[index] = element;
          }}
          className="absolute grid h-8 w-8 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-line bg-surface-raised text-heading shadow-sm transition-colors duration-500 data-[state=here]:border-accent/50 data-[state=here]:bg-[color-mix(in_srgb,rgb(var(--c-accent))_12%,rgb(var(--c-raised)))] data-[state=here]:text-accent data-[state=passed]:border-accent/25 data-[state=passed]:text-accent/80 md:h-9 md:w-9"
          style={{ left: `${(x / 500) * 100}%`, top: `${(y / 600) * 100}%` }}
        >
          <Icon className="h-4 w-4" />
        </span>
      ))}

      <p className="eyebrow absolute inset-x-0 top-full mt-8 flex justify-center text-[0.6875rem]">
        {/* Page-coloured, so the journey sketched behind the page never runs through the caption */}
        <span className="flex items-center gap-2 bg-canvas px-2">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          Field to consumer
          {!reduceMotion && (
            <>
              <span className="text-line-strong">·</span>
              {/* Room for "100%" (four characters plus the caption's letter spacing) with even digits, so the
                  caption doesn't shift as the number grows */}
              <span ref={percentRef} className="inline-block min-w-[calc(4ch+0.5em)] text-right tabular-nums text-accent">
                0%
              </span>
              <span ref={labelRef} className="text-heading">
                {STOPS[0].label}
              </span>
            </>
          )}
        </span>
      </p>
    </div>
  );
}
