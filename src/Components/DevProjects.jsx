import { DevProjectCard } from "./projects/ProjectParts";
import Reveal from "./ui/Reveal";

/**
 * Grid of projects on the /projects page — one column on phones, two on tablets, three on large screens.
 * Counters number the cards within `all`. (On the homepage the projects are in the Projects section.)
 */
export function DevGrid({ projects, all = projects, onOpen }) {
  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((project, index) => (
        <Reveal as="li" key={project.id} delay={Math.min(index, 5) * 0.04} className="min-w-0">
          <DevProjectCard project={project} index={all.indexOf(project)} total={all.length} onOpen={onOpen} />
        </Reveal>
      ))}
    </ul>
  );
}
