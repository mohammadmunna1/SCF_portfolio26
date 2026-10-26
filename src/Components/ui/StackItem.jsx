import { motion, useTransform } from "framer-motion";
import { forwardRef, useCallback, useEffect, useRef } from "react";

// How much smaller each card behind the top one ends up — the depth of the deck.
const SCALE_STEP = 0.03;

/**
 * One card slot of a stacked list (see useCardStack). Renders a motion element (`li` by default) and
 * passes any motion props through, e.g. reveal or exit animations. On phones the card shrinks a little
 * as later cards stack on top of it; its height is published as --stack-h, so a card taller than the
 * screen only sticks once its end is in view.
 */
const StackItem = forwardRef(function StackItem({ stack, index, as = "li", className = "", style, children, ...rest }, forwardedRef) {
  const Component = motion[as];
  const ref = useRef(null);
  const depth = Math.max(stack.count - 1 - index, 0);
  const scale = useTransform(stack.progress, [index / stack.count, 1], [1, 1 - depth * SCALE_STEP]);

  const setRef = useCallback(
    (node) => {
      ref.current = node;
      if (typeof forwardedRef === "function") forwardedRef(node);
      else if (forwardedRef) forwardedRef.current = node;
    },
    [forwardedRef]
  );

  useEffect(() => {
    const element = ref.current;
    if (!element || typeof ResizeObserver === "undefined") return undefined;
    const observer = new ResizeObserver(([entry]) => {
      const height = entry.borderBoxSize?.[0]?.blockSize ?? element.offsetHeight;
      element.style.setProperty("--stack-h", `${Math.ceil(height)}px`);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <Component
      ref={setRef}
      className={`stack-card ${className}`}
      style={{ ...style, "--stack-index": index, scale: stack.enabled ? scale : 1, transformOrigin: "50% 0%" }}
      {...rest}
    >
      {children}
    </Component>
  );
});

export default StackItem;
