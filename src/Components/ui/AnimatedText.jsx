import { motion } from "framer-motion";
import { Fragment } from "react";
import { EASE_OUT, VIEWPORT_ONCE } from "../../lib/motion";

const wordVariants = {
  hidden: { y: "105%" },
  visible: { y: 0, transition: { duration: 0.85, ease: EASE_OUT } },
};

/**
 * Words slide up from behind a mask, one after another — the reference's heading reveal.
 * Plays on mount when `immediate`, otherwise when scrolled into view. Reduced motion shows the text at once.
 */
export function MaskText({ text, as = "span", className = "", delay = 0, stagger = 0.06, immediate = false, ...rest }) {
  const Tag = motion[as];
  const words = String(text || "").split(/\s+/).filter(Boolean);
  const trigger = immediate ? { animate: "visible" } : { whileInView: "visible", viewport: VIEWPORT_ONCE };

  return (
    <Tag
      className={className}
      initial="hidden"
      {...trigger}
      variants={{ hidden: {}, visible: { transition: { staggerChildren: stagger, delayChildren: delay } } }}
      {...rest}
    >
      {words.map((word, index) => (
        <Fragment key={`${word}-${index}`}>
          {/* Padding keeps tall glyphs from being clipped by the mask */}
          <span className="-my-[0.12em] inline-block overflow-hidden py-[0.12em] align-bottom">
            <motion.span className="inline-block" variants={wordVariants}>
              {word}
            </motion.span>
          </span>
          {index < words.length - 1 && " "}
        </Fragment>
      ))}
    </Tag>
  );
}
