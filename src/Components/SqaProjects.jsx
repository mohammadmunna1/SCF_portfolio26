import SqaCard from "./projects/SqaCard";
import Reveal from "./ui/Reveal";

/**
 * Grid of QA cards on the /projects page — one column on phones, two on tablets, three on large screens.
 * Counters number the cards within `all`. (On the homepage they're a tab of the Projects section.)
 */
export function SqaGrid({ projects, all = projects, onOpen }) {
  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((project, index) => (
        <Reveal as="li" key={project.id} delay={Math.min(index, 5) * 0.04} className="min-w-0">
          <SqaCard project={project} index={all.indexOf(project)} total={all.length} onOpen={onOpen} />
        </Reveal>
      ))}
    </ul>
  );
}
