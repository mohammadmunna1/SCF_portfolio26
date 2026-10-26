import { AnimatePresence, motion } from "framer-motion";
import { useCardStack } from "../hooks/useCardStack";
import { SPRING_SOFT } from "../lib/motion";
import { DevProjectCard } from "./projects/ProjectParts";
import StackItem from "./ui/StackItem";

/**
 * Grid of development projects on the /projects page that animates as the filter changes — one column
 * on phones (where the cards stack as you scroll), two on tablets, three on large screens. Counters
 * number cards within `all`. (On the homepage the projects are in the "Explore My Work" section, Projects.jsx.)
 */
export function DevGrid({ projects, all = projects, onOpen }) {
  const stack = useCardStack(projects.length);
  // Layout animations measure positions, which sticky stacked cards would throw off.
  const layout = !stack.enabled;
  return (
    <motion.ul
      {...stack.listProps}
      layout={layout}
      className="stack grid gap-x-6 gap-y-4 md:grid-cols-2 md:gap-y-14 xl:grid-cols-3 xl:gap-x-8"
    >
      <AnimatePresence mode="popLayout">
        {projects.map((project, index) => (
          <StackItem
            key={project.id}
            stack={stack}
            index={index}
            layout={layout}
            className="min-w-0"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            transition={SPRING_SOFT}
          >
            <DevProjectCard project={project} index={all.indexOf(project)} total={all.length} onOpen={onOpen} />
          </StackItem>
        ))}
      </AnimatePresence>
    </motion.ul>
  );
}
