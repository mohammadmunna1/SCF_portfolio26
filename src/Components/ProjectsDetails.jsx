import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useContent } from "../context/ContentContext";
import { DevGrid } from "./DevProjects";
import ProjectModal from "./projects/ProjectModal";
import { categoryFilters, filterByCategory, filterSqa, sqaFilters, useProjectModal } from "./projects/projectUtils";
import SqaModal from "./projects/SqaModal";
import { SqaGrid } from "./SqaProjects";
import { MaskText } from "./ui/AnimatedText";
import FilterTabs from "./ui/FilterTabs";
import Reveal from "./ui/Reveal";

/**
 * Every project, in two groups: SQA & test automation (current focus) and software development.
 * Served at /projects (and the legacy /ProjectsDetails); `?view=sqa|dev` selects the group.
 */
const ProjectsDetails = () => {
  const { projects, sqaProjects, sections } = useContent();
  const [params, setParams] = useSearchParams();
  const [sqaFilter, setSqaFilter] = useState("all");
  const [devFilter, setDevFilter] = useState("all");
  const modal = useProjectModal();
  const sqaModal = useProjectModal();

  const sqaSection = sections.find((section) => section.key === "sqa");
  const devSection = sections.find((section) => section.key === "work");
  const views = [
    sqaProjects.length > 0 && { key: "sqa", label: sqaSection?.title || "SQA & Test Automation", count: sqaProjects.length },
    projects.length > 0 && { key: "dev", label: devSection?.title || "Software Development", count: projects.length },
  ].filter(Boolean);
  const view = views.find((item) => item.key === params.get("view"))?.key || views[0]?.key;
  const intro = (view === "sqa" ? sqaSection : devSection)?.subtitle;

  return (
    <section aria-labelledby="projects-title" className="container-site pb-28 pt-36 md:pb-36 md:pt-44">
      <Reveal as="p" y={12} className="caps text-muted">
        Portfolio
      </Reveal>
      <MaskText as="h1" id="projects-title" immediate text="All projects" className="display mt-5 text-display-xl" />

      {views.length > 0 && (
        <Reveal delay={0.15} className="mt-12 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <FilterTabs
            items={views}
            value={view}
            onChange={(key) => setParams({ view: key }, { replace: true })}
            label="Project group"
            layoutId="projects-view"
            className="self-start"
          />
          {view === "sqa" ? (
            <FilterTabs
              items={sqaFilters(sqaProjects)}
              value={sqaFilter}
              onChange={setSqaFilter}
              label="Filter SQA projects by type"
              layoutId="projects-sqa-filter"
              className="self-start"
            />
          ) : (
            <FilterTabs
              items={categoryFilters(projects)}
              value={devFilter}
              onChange={setDevFilter}
              label="Filter development projects by category"
              layoutId="projects-dev-filter"
              className="self-start"
            />
          )}
        </Reveal>
      )}

      {intro && <p className="mt-8 max-w-[34rem] uppercase">{intro}</p>}

      <div className="mt-12 md:mt-16">
        {view === "sqa" ? (
          <SqaGrid projects={filterSqa(sqaProjects, sqaFilter)} all={sqaProjects} onOpen={sqaModal.openProject} />
        ) : (
          <DevGrid projects={filterByCategory(projects, devFilter)} all={projects} onOpen={modal.openProject} />
        )}
      </div>

      <ProjectModal project={modal.project} open={modal.open} onClose={modal.close} />
      <SqaModal project={sqaModal.project} open={sqaModal.open} onClose={sqaModal.close} />
    </section>
  );
};

export default ProjectsDetails;
