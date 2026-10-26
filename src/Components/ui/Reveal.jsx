import { motion } from "framer-motion";
import { revealMotion } from "../../lib/motion";

/** Fades its children into place the first time they scroll into view (still for reduced motion). */
export default function Reveal({ as = "div", children, delay = 0, y = 12, amount = 0.15, className = "", ...rest }) {
  const Component = motion[as];
  return (
    <Component className={className} {...revealMotion({ delay, y, amount })} {...rest}>
      {children}
    </Component>
  );
}
