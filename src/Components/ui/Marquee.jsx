import { useReducedMotion } from "framer-motion";
import { useEffect, useRef } from "react";

/**
 * Infinite horizontal ticker driven by a CSS animation (GPU-friendly, no JS per frame).
 * Items repeat until each half holds at least `minItems`, so short lists still loop seamlessly.
 * Pauses on hover/focus. For reduced-motion users it stops: a scrollable row, or a still line
 * when the ticker is purely decorative.
 */
export default function Marquee({
  items,
  renderItem,
  duration = 40,
  reverse = false,
  gap = 16,
  minItems = 10,
  fade = true,
  decorative = false,
  className = "",
  label,
}) {
  const reduceMotion = useReducedMotion();
  const duplicateRef = useRef(null);

  useEffect(() => {
    // The duplicate copy exists only for the visual loop: hide it from keyboards and screen readers.
    duplicateRef.current?.setAttribute("inert", "");
  }, [reduceMotion]);

  if (!items?.length) return null;

  if (reduceMotion) {
    return (
      <div
        className={`${decorative ? "overflow-hidden" : "no-scrollbar overflow-x-auto"} ${className}`}
        aria-label={decorative ? undefined : label}
        aria-hidden={decorative || undefined}
      >
        <div className="flex w-max px-5 sm:px-8 lg:px-12 xl:px-20" style={{ gap }}>
          {items.map((item, index) => (
            <div key={index} className="shrink-0">
              {renderItem(item, index)}
            </div>
          ))}
        </div>
      </div>
    );
  }

  const repeat = Math.max(1, Math.ceil(minItems / items.length));
  const half = Array.from({ length: repeat }, () => items).flat();
  const renderHalf = (copy) =>
    half.map((item, index) => (
      <div key={`${copy}-${index}`} className="shrink-0">
        {renderItem(item, index % items.length)}
      </div>
    ));

  return (
    <div
      className={`marquee relative overflow-hidden ${fade ? "mask-fade-x" : ""} ${className}`}
      aria-label={decorative ? undefined : label}
      aria-hidden={decorative || undefined}
    >
      <div
        className="marquee-track flex w-max"
        style={{
          "--marquee-duration": `${duration * repeat}s`,
          animationDirection: reverse ? "reverse" : "normal",
        }}
      >
        <div className="flex shrink-0" style={{ gap, paddingRight: gap }}>
          {renderHalf("a")}
        </div>
        <div ref={duplicateRef} aria-hidden="true" className="flex shrink-0" style={{ gap, paddingRight: gap }}>
          {renderHalf("b")}
        </div>
      </div>
    </div>
  );
}
