import { useReducedMotion, useScroll } from "framer-motion";
import { useEffect, useRef } from "react";
import { useMediaQuery } from "./useMediaQuery";

// Phones only — the same breakpoint as the `.stack` styles in index.css (Tailwind's `md` starts at 768px).
export const PHONE_QUERY = "(max-width: 767.98px)";

/**
 * When the list ends, cards taller than the last one are pushed up first, so slices of them would show
 * above it as the deck leaves. In that case the content of the covered cards fades out over that stretch
 * (--stack-fade on the list), leaving their plain surfaces; a deck whose cards fit leaves intact.
 */
function useEndFade(ref, enabled) {
  useEffect(() => {
    const list = ref.current;
    if (!enabled || !list) return undefined;
    let pushedFrom = null; // where the list's bottom is when the first earlier card starts being pushed up
    let frame = 0;

    const measure = () => {
      const cards = [...list.children];
      // Where each card's bottom sits while it's stuck
      const bottoms = cards.map((card) => parseFloat(getComputedStyle(card).top) + card.offsetHeight);
      const lowest = Math.max(...bottoms.slice(0, -1));
      pushedFrom = cards.length > 1 && lowest > bottoms.at(-1) ? lowest : null;
    };
    const update = () => {
      frame = 0;
      if (pushedFrom === null) {
        list.style.removeProperty("--stack-fade");
        return;
      }
      // Starts just before the first card is pushed up and is done 50px later, before anything shows.
      const progress = (pushedFrom + 10 - list.getBoundingClientRect().bottom) / 60;
      list.style.setProperty("--stack-fade", String(1 - Math.min(Math.max(progress, 0), 1)));
    };
    const onScroll = () => {
      frame ||= requestAnimationFrame(update);
    };
    const remeasure = () => {
      measure();
      update();
    };
    // The list resizes whenever a card does (or cards are added or filtered out); the window for rotation.
    const resize = new ResizeObserver(remeasure);
    resize.observe(list);
    window.addEventListener("resize", remeasure);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      resize.disconnect();
      window.removeEventListener("resize", remeasure);
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
      list.style.removeProperty("--stack-fade");
    };
  }, [ref, enabled]);
}

/**
 * Stacked cards. Spread `listProps` on a list with the `stack` class and render each item with
 * <StackItem stack={stack} index={i}>: each card then sticks below the header and the next one slides
 * over it, earlier cards staying visible as thin layered edges (see `.stack` in index.css).
 * The deck is on for phones — or for every screen size with `allScreens` — and never with reduced
 * motion, where the list stays an ordinary list.
 */
export function useCardStack(count, { allScreens = false } = {}) {
  const ref = useRef(null);
  const phone = useMediaQuery(PHONE_QUERY);
  const reduceMotion = useReducedMotion();
  const enabled = (allScreens || phone) && !reduceMotion;
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  useEndFade(ref, enabled && count > 1);
  return {
    ref,
    count,
    progress: scrollYProgress,
    enabled,
    // `data-stacked` switches the deck styles on
    listProps: { ref, "data-stacked": enabled ? "" : undefined },
  };
}
