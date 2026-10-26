import { motion } from "framer-motion";
import { revealMotion } from "../../lib/motion";

/** Fades and lifts its children into place when they scroll into view. */
export default function Reveal({ as = "div", children, delay = 0, y = 28, amount = 0.2, className = "", ...rest }) {
  const Component = motion[as];
  return (
    <Component className={className} {...revealMotion({ delay, y, amount })} {...rest}>
      {children}
    </Component>
  );
}
