import { useMotionValueEvent, useScroll } from "framer-motion";
import { useEffect, useState } from "react";

/** Tracks whether the page is scrolled and whether the user is scrolling down (to hide the nav). */
export function useScrollState({ threshold = 24, hideAfter = 480 } = {}) {
  const { scrollY } = useScroll();
  const [state, setState] = useState({ scrolled: false, hidden: false });

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    setState((current) => {
      const scrolled = latest > threshold;
      let { hidden } = current;
      if (latest <= hideAfter || latest < previous - 2) hidden = false;
      else if (latest > previous + 2) hidden = true;
      // Returning the same object skips the re-render when nothing changed.
      return scrolled === current.scrolled && hidden === current.hidden ? current : { scrolled, hidden };
    });
  });

  return state;
}

/** Returns the id of the section currently crossing the middle of the viewport. */
export function useActiveSection(ids) {
  const [active, setActive] = useState("");
  const key = ids.join("|");

  useEffect(() => {
    const elements = key
      .split("|")
      .filter(Boolean)
      .map((id) => document.getElementById(id))
      .filter(Boolean);
    if (!elements.length) return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setActive(entry.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [key]);

  return active;
}

/** Prevents the page behind a modal or menu from scrolling. */
export function useLockBodyScroll(locked) {
  useEffect(() => {
    if (!locked) return undefined;
    const { overflow } = document.documentElement.style;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = overflow;
    };
  }, [locked]);
}
