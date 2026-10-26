import { AnimatePresence } from "framer-motion";
import { useCardStack } from "../../hooks/useCardStack";
import { SPRING_SOFT } from "../../lib/motion";
import StackItem from "../ui/StackItem";
import { bentoCells } from "./bento";
import { DevProjectCard } from "./ProjectParts";
import SqaCard from "./SqaCard";

const CARDS = { sqa: SqaCard, dev: DevProjectCard };

/**
 * The homepage project showcase: the existing SQA or development cards in a Bento arrangement (see
 * bento.js) from tablets up; one card per row on phones, where they stack as you scroll like the other
 * card lists. Animates as the filter changes; counters number the cards within `all`.
 */
export default function BentoGrid({ kind, projects, all = projects, onOpen }) {
  const Card = CARDS[kind];
  const cells = bentoCells(projects.length);
  const stack = useCardStack(projects.length);
  // Only the cards' positions animate: spans change as the filter does, and sticky stacked cards on phones
  // can't be measured. (The list itself has no layout animation — inside the category switch, which waits
  // for the old showcase to leave, one could keep that showcase from ever finishing.)
  const layout = stack.enabled ? false : "position";

  return (
    <ul {...stack.listProps} className="stack grid gap-4 md:grid-cols-12 md:gap-5 xl:gap-6">
      <AnimatePresence mode="popLayout">
        {projects.map((project, index) => (
          <StackItem
            key={project.id}
            stack={stack}
            index={index}
            layout={layout}
            className={`min-w-0 ${cells[index].className}`}
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0, transition: { ...SPRING_SOFT, delay: Math.min(index, 5) * 0.05 } }}
            viewport={{ once: true, amount: 0.1 }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            transition={SPRING_SOFT}
          >
            <Card project={project} index={all.indexOf(project)} total={all.length} onOpen={onOpen} bento={cells[index]} />
          </StackItem>
        ))}
      </AnimatePresence>
    </ul>
  );
}
