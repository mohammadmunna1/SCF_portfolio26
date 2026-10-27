import { useEffect, useRef, useState } from "react";
import { CanopyBack, CanopyFront, Hub } from "./art/hub";
import { Clouds, Countryside, Cull, FarRange, Foreground, Hills, LandscapeDefs, Roads } from "./art/landscape";
import { PORT, ROAD, WATER, X } from "./art/layout";
import { Person } from "./art/people";
import { Crate, GoodsPallet, PlantFacade, PlantInterior, StoreFacade, StoreInterior } from "./art/plant";
import {
  Crane,
  CraneRig,
  Destination,
  Ground,
  Hillside,
  Lighthouse,
  Moorings,
  Sea,
  SeaDefs,
  Terminal,
} from "./art/port";
import { ForkSign, Market, Town } from "./art/town";
import { Container, ContainerTruck, Forklift, Pallet, Rig, Ship } from "./art/vehicles";
import { createDirector } from "./director";

const FONT = "'Geist Variable', Geist, system-ui, sans-serif";

// How the layers are drawn depends on the screen's shape (measured): on landscape screens each layer is its
// own SVG on a GPU layer, moved by a CSS transform, so panning doesn't repaint it; on portrait screens — with
// a narrow view and dense pixels — one SVG redrawn each frame is lighter.
const WIDE = "(min-aspect-ratio: 1/1)";

// Each layer's drawing area in its own units (x, y, width, height), for the layered mode.
const BOXES = {
  clouds: [-2800, -760, 6800, 520],
  far: [-3200, -320, 11400, 4400],
  hills: [-4700, -340, 20000, 4500],
  world: [-4200, -900, 26600, 5100],
  fore: [-1900, 0, 18300, 800],
};

/** Headlight beam, pointing ahead of a vehicle (placed by the director). */
const Beam = ({ j }) => <path data-j={j} d="M0 0L250 -30V34Z" fill="url(#j-beam)" opacity="0.85" />;

/** The world itself: land, sea, places and everything that moves through them. */
function World() {
  return (
    <>
      {/* Land, sea and everything standing behind the roads, in regions skipped while off screen */}
      <Sea />
      <Ground />
      <Cull x0={8400} x1={12700}>
        <Hillside />
      </Cull>
      <Cull x0={-4200} x1={2950}>
        <Countryside />
      </Cull>
      <Cull x0={2600} x1={4400}>
        <Hub />
      </Cull>
      <Cull x0={9350} x1={12100}>
        <Town />
        <Market />
      </Cull>
      <Cull x0={12090} x1={12170}>
        <Lighthouse x={12130} y={74} />
      </Cull>
      <Cull x0={10400} x1={11500}>
        <Terminal />
      </Cull>
      <Cull x0={16200} x1={22000}>
        <Destination />
      </Cull>
      <Cull x0={4100} x1={6650}>
        <PlantInterior />
        <PlantFacade />
      </Cull>
      <Cull x0={6850} x1={9250}>
        <StoreInterior />
        <StoreFacade />
      </Cull>
      <Cull x0={9340} x1={9560}>
        <ForkSign x={9440} />
      </Cull>
      <Cull x0={2940} x1={3620}>
        <CanopyBack />
      </Cull>
      <Roads />
      <Cull x0={11900} x1={12100}>
        <Moorings />
      </Cull>

      {/* The shipment's journey, back to front in the order things pass each other (the director hides
          whichever is off screen) */}
      {[0, 1, 2].map((k) => (
        <Crate key={k} j={`crate${k}`} />
      ))}
      <Rig j="rig" x={X.start} y={ROAD.lane} />
      <Cull x0={2900} x1={3660}>
        <CanopyFront />
      </Cull>
      <Forklift j="fork1" x={6820} y={-6} />
      <GoodsPallet j="goods" x={X.pallet} y={-6} />
      <Person j="porterA" carry vest="#E0B33C" />
      <Forklift j="fork2" x={8600} y={-6} />
      <Pallet j="pallet2" />
      <Person j="porterB" carry shirt="#2F7F7D" skin="#C68B5E" />
      <Rig j="van2" x={X.van} y={ROAD.lane} />
      <Ship j="ship" x={X.berth} y={WATER} />
      <ContainerTruck j="truck2" x={X.containerTruck} y={ROAD.lane} />
      <ContainerTruck j="truck3" x={X.destCrane + 186} y={PORT.lane} cab="#2F6B6A" />
      <Container j="box" accent />
      <Cull x0={X.crane - 420} x1={X.crane + 1160}>
        <Crane x={X.crane} />
      </Cull>
      <CraneRig j="crane1" />
      <Cull x0={X.destCrane - 1540} x1={X.destCrane + 420}>
        <Crane x={X.destCrane} dir={-1} reach={1520} />
      </Cull>
      <CraneRig j="crane2" />
      <Rig j="lm0" y={PORT.lane} />
      <Rig j="lm1" y={PORT.lane} />
      <Beam j="beam3" />
      <Beam j="beamLm0" />
      <Beam j="beamLm1" />
    </>
  );
}

// Back to front: name, content, extra attributes.
const LAYERS = [
  ["clouds", <Clouds key="clouds" />],
  ["far", <FarRange key="far" />],
  ["hills", <Hills key="hills" />],
  ["world", <World key="world" />, { fontFamily: FONT }],
  ["fore", <Foreground key="fore" />, { "data-j": "fore" }],
];

/**
 * The journey's world in parallax layers (clouds, far ranges, hills, the world, the foreground), drawn by the
 * director for the current progress. Decorative — the captions and the summary carry the story.
 */
export default function JourneyScene({ progress }) {
  const rootRef = useRef(null);
  const [layered, setLayered] = useState(() => window.matchMedia(WIDE).matches);

  useEffect(() => {
    const query = window.matchMedia(WIDE);
    const update = () => setLayered(query.matches);
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    const director = createDirector(root);
    director.measure();
    const paint = (value) => director.paint(value);
    paint(progress.get());
    root.setAttribute("data-ready", "");
    const unsubscribe = progress.on("change", paint);
    const resize = new ResizeObserver(() => {
      director.measure();
      paint(progress.get());
    });
    resize.observe(root);
    // Ambient motion (turbines, steam) only runs while the journey is on screen.
    const visibility = new IntersectionObserver(([entry]) =>
      root.toggleAttribute("data-paused", !entry.isIntersecting),
    );
    visibility.observe(root);
    return () => {
      unsubscribe();
      resize.disconnect();
      visibility.disconnect();
    };
  }, [progress, layered]);

  const defs = (
    <defs>
      <LandscapeDefs />
      <SeaDefs />
    </defs>
  );

  return (
    <div ref={rootRef} aria-hidden="true" className="journey-world absolute inset-0">
      {layered ? (
        <>
          <svg width="0" height="0" className="absolute">
            {defs}
          </svg>
          {LAYERS.map(([name, content, attributes]) => {
            const [x, y, width, height] = BOXES[name];
            return (
              <svg
                key={name}
                data-layer={name}
                data-origin={`${x} ${y}`}
                viewBox={`${x} ${y} ${width} ${height}`}
                width={width}
                height={height}
                overflow="visible"
                className="journey-layer"
                {...attributes}
              >
                {content}
              </svg>
            );
          })}
        </>
      ) : (
        <svg className="absolute inset-0 h-full w-full">
          {defs}
          {LAYERS.map(([name, content, attributes]) => (
            <g key={name} data-layer={name} {...attributes}>
              {content}
            </g>
          ))}
        </svg>
      )}
    </div>
  );
}
