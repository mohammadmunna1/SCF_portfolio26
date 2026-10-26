import { motion } from "framer-motion";

/** Shown only on a first visit while content loads (returning visitors render from cache). */
const Preloader = () => (
  <motion.div
    className="fixed inset-0 z-[100] grid place-items-center bg-canvas"
    initial={{ opacity: 1 }}
    exit={{ opacity: 0, transition: { duration: 0.5 } }}
    role="status"
    aria-label="Loading"
  >
    <motion.span
      className="relative block h-px w-40 overflow-hidden bg-heading/10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.25, duration: 0.6 }}
    >
      <motion.span
        className="absolute inset-y-0 left-0 w-1/3 bg-heading"
        animate={{ x: ["-100%", "300%"] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.span>
  </motion.div>
);

export default Preloader;
