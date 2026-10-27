import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { LuArrowUp } from "react-icons/lu";
import { SPRING_UI } from "../lib/motion";

/**
 * Small "back to top" button, shown after scrolling past the first screen — on the homepage, only once past
 * the hero's journey (which has its own controls in that corner of the screen).
 */
const BackToTop = () => {
  const { scrollY } = useScroll();
  const [visible, setVisible] = useState(false);
  const showFrom = useRef(900);

  // Where the journey ends, measured when the page's size changes — never while scrolling, when reading
  // layout would make the browser redo it mid-frame.
  useEffect(() => {
    const measure = () => {
      const journeyEnd = document.getElementById("journey-end");
      const end = journeyEnd ? journeyEnd.getBoundingClientRect().top + window.scrollY - window.innerHeight / 2 : 0;
      showFrom.current = Math.max(900, end);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(document.body);
    return () => observer.disconnect();
  }, []);

  useMotionValueEvent(scrollY, "change", (latest) => setVisible(latest > showFrom.current));

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Back to top"
          className="fixed bottom-5 right-5 z-40 grid h-11 w-11 place-items-center rounded-full bg-surface-raised text-heading transition-colors hover:bg-button hover:text-button-text md:bottom-8 md:right-8"
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.6 }}
          transition={SPRING_UI}
        >
          <LuArrowUp aria-hidden="true" className="h-4 w-4" />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default BackToTop;
