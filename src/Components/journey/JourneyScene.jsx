import { useEffect, useRef } from "react";
import { Countryside, FarLayer, Lighthouse, MidLayer, Road, Sea, SkyLayer } from "./art/landscape";
import { X } from "./art/layout";
import { Person } from "./art/people";
import {
  Birds,
  Bridge,
  Buoy,
  Canopy,
  Crane,
  CraneRig,
  Destination,
  Factory,
  Fork,
  Hub,
  Item,
  Packer,
  Port,
  Shop,
  Warehouse,
} from "./art/places";
import { Container, ContainerTruck, Forklift, Rig, Ship, Van } from "./art/vehicles";
import { createDirector } from "./director";

// How long the first view takes to sketch itself in when the page opens.
const INTRO_MS = 1600;

/** The world itself, back to front: the places and roads, then everything that moves through them. */
function World() {
  return (
    <>
      <Sea />
      <Lighthouse />
      <Countryside />
      <Hub />
      <Factory />
      <Bridge />
      <Warehouse />
      <Canopy />
      <Fork />
      <Shop />
      <Port />
      <Crane j="crane1" x={X.crane} seed={1650} />
      <Destination />
      <Crane j="crane2" x={X.destCrane} dir={-1} seed={1660} />
      <Road x0={-2400} x1={X.quay} seed={2000} />
      <Road x0={X.destQuay} x1={X.end} seed={2100} />

      {[0, 1, 2, 3].map((k) => (
        <Item key={k} j={`item${k}`} seed={2200 + k * 5} />
      ))}
      <Packer />
      <Forklift j="fork" at={X.warehouse} />
      <Rig j="rig" />
      <Van j="van" at={X.van - 100} />
      <ContainerTruck j="truck2" at={X.exportTruck - 90} />
      <Ship j="ship" at={X.berth - 20} />
      <ContainerTruck j="truck3" at={X.destCrane - 90} seed={151} />
      <Container j="box" at={X.exportTruck - 80} />
      <CraneRig j="crane1Rig" />
      <CraneRig j="crane2Rig" />
      <Person j="shopper" seed={2300} bag />
      <Buoy />
      <Birds j="birds" seed={2310} />
      <Birds j="gulls" count={2} seed={2320} />
    </>
  );
}

// Back to front, each layer moving at its own depth (see DEPTH), with the area it is drawn in (x, y, width,
// height, in its own units). Each is its own SVG on its own GPU layer, moved by a CSS transform, so the
// camera's travel costs no repainting — only what moves or is being drawn is painted again.
const LAYERS = [
  ["sky", <SkyLayer key="sky" />, [-1900, -760, 4400, 420]],
  ["far", <FarLayer key="far" />, [-2000, -300, 6600, 320]],
  ["mid", <MidLayer key="mid" />, [-1800, -360, 9600, 400]],
  ["world", <World key="world" />, [-2500, -520, 14000, 680]],
];

/**
 * The supply chain journey as a pencil sketch, drawn by the director for the journey's progress (a motion
 * value). Decorative: the page around it carries the content.
 */
export default function JourneyScene({ progress, reduceMotion }) {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    const director = createDirector(root);
    director.measure();
    let intro = reduceMotion ? 1 : 0;
    let painted = 0;
    const paint = () => {
      director.paint(progress.get(), intro);
      painted = performance.now();
    };
    paint();
    root.setAttribute("data-ready", "");

    // The progress changes once a frame while it moves. On a device that is already dropping frames the
    // sketch is drawn every other frame instead, leaving the time to the page itself (the sketch is only
    // a background), and it always lands on the final position once the progress settles.
    let interval = 16.7;
    let lastChange = 0;
    let trailing = 0;
    const onChange = () => {
      const now = performance.now();
      const gap = now - lastChange;
      lastChange = now;
      interval = gap < 100 ? interval * 0.8 + gap * 0.2 : 16.7;
      cancelAnimationFrame(trailing);
      if (interval > 21 && now - painted < 30) trailing = requestAnimationFrame(paint);
      else paint();
    };
    const unsubscribe = progress.on("change", onChange);

    let frame = 0;
    if (intro < 1) {
      const started = performance.now();
      const step = (now) => {
        intro = Math.min(1, (now - started) / INTRO_MS);
        paint();
        if (intro < 1) frame = requestAnimationFrame(step);
      };
      frame = requestAnimationFrame(step);
    }

    const resize = new ResizeObserver(() => {
      director.measure();
      paint();
    });
    resize.observe(root);
    return () => {
      unsubscribe();
      cancelAnimationFrame(frame);
      cancelAnimationFrame(trailing);
      resize.disconnect();
    };
  }, [progress, reduceMotion]);

  return (
    <div ref={rootRef} className="sketch-scene">
      {LAYERS.map(([name, content, box]) => (
        <svg
          key={name}
          data-layer={name}
          data-box={box.join(" ")}
          viewBox={box.join(" ")}
          overflow="visible"
          focusable="false"
          className="sketch-layer"
        >
          {content}
        </svg>
      ))}
    </div>
  );
}
