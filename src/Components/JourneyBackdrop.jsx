import { useMotionValue, useReducedMotion, useScroll, useSpring } from "framer-motion";
import { Component, lazy, Suspense, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { clamp } from "./journey/keyframes";
import { HERO_END, stillAt } from "./journey/stages";

// The sketch and its choreography come in their own chunk, requested as soon as this module loads, so the
// page's content never waits for them.
const sceneRequest = import("./journey/JourneyScene");
sceneRequest.catch(() => {}); // handled by SceneBoundary when it renders
const JourneyScene = lazy(() => sceneRequest);

// The sketch glides after the scroll instead of jumping with each wheel notch.
const SMOOTHING = { stiffness: 120, damping: 26, mass: 0.6, restDelta: 0.00002 };

/** If the sketch can't load (offline mid-visit), the page simply goes without it. */
class SceneBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/**
 * The journey's progress at scroll position y: the hero screen takes it to HERO_END, the rest of the page
 * to 1 by the time the footer comes into view.
 */
function progressAt(y, { hero, end }) {
  if (end <= 0) return 0;
  if (hero > 0 && y < hero) return (HERO_END * y) / hero;
  const from = hero > 0 ? HERO_END : 0;
  return clamp(from + ((1 - from) * (y - hero)) / Math.max(1, end - hero));
}

/**
 * The supply chain journey, sketched in pencil behind the whole page and moving with its scroll — a car on
 * a country road, then a truck, the factory, the warehouse, the shop and the port, the crossing, and the
 * delivery overseas. Fixed behind the content, decorative, and never in the way of it.
 */
export default function JourneyBackdrop() {
  const reduceMotion = useReducedMotion();
  const { pathname } = useLocation();
  const { scrollY } = useScroll();
  const target = useMotionValue(0);
  const smooth = useSpring(target, SMOOTHING);
  // With reduced motion the sketch doesn't move: it changes from one still to the next.
  const still = useMotionValue(0);
  // Development only: ?journey=0.42 holds the journey at that point and window.__journey(p) moves it.
  const held = useMotionValue(0);
  const hold = import.meta.env.DEV ? new URLSearchParams(window.location.search).get("journey") : null;
  const progress = hold !== null ? held : reduceMotion ? still : smooth;

  useEffect(() => {
    if (hold === null) return undefined;
    held.set(Number(hold) || 0);
    window.__journey = (p) => held.set(p);
    return () => delete window.__journey;
  }, [hold, held]);

  useEffect(() => {
    // Scroll positions where the hero has left the screen and where the footer arrives — measured when the
    // page's size changes, never while scrolling.
    const marks = { hero: 0, end: 0 };
    const update = () => {
      const p = progressAt(window.scrollY, marks);
      target.set(p);
      still.set(stillAt(p));
    };
    const measure = () => {
      const top = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const footer = document.querySelector("footer");
      const hero = document.getElementById("home");
      marks.end = Math.max(0, Math.min(max, footer ? footer.getBoundingClientRect().top + top - window.innerHeight : max));
      marks.hero = hero ? Math.min(hero.getBoundingClientRect().bottom + top, marks.end / 2) : 0;
      update();
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(document.body);
    const unsubscribe = scrollY.on("change", update);
    return () => {
      observer.disconnect();
      unsubscribe();
    };
  }, [pathname, scrollY, target, still]);

  return (
    <div aria-hidden="true" className="sketch-backdrop">
      <SceneBoundary>
        <Suspense fallback={null}>
          <JourneyScene progress={progress} reduceMotion={reduceMotion} />
        </Suspense>
      </SceneBoundary>
    </div>
  );
}
