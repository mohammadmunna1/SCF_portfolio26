import { animate, motion, useInView, useMotionValue, useReducedMotion, useTransform } from "framer-motion";
import { useEffect, useRef } from "react";
import { EASE_OUT } from "../../lib/motion";
import { parseStat } from "../../lib/text";

/**
 * Counts a stat like "5+" up from zero when it scrolls into view. The prefix/suffix ("+")
 * can be styled separately; non-numeric values render as-is.
 */
export default function CountUp({ value, className = "", affixClassName = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduceMotion = useReducedMotion();
  const stat = parseStat(value);
  const count = useMotionValue(0);
  const text = useTransform(count, (latest) => (stat ? latest.toFixed(stat.decimals) : ""));
  const target = stat?.number ?? 0;

  useEffect(() => {
    if (!inView) return undefined;
    if (reduceMotion) {
      count.set(target);
      return undefined;
    }
    const controls = animate(count, target, { duration: 1.6, ease: EASE_OUT });
    return () => controls.stop();
  }, [inView, reduceMotion, count, target]);

  if (!stat) return <span className={className}>{value}</span>;
  return (
    <span ref={ref} className={className}>
      <span className="sr-only">{value}</span>
      <span aria-hidden="true">
        {stat.prefix && <span className={affixClassName}>{stat.prefix}</span>}
        <motion.span>{text}</motion.span>
        {stat.suffix && <span className={affixClassName}>{stat.suffix}</span>}
      </span>
    </span>
  );
}
