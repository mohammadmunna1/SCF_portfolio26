import { useState } from "react";
import { LuArrowLeft } from "react-icons/lu";
import { Link, useSearchParams } from "react-router-dom";
import { useContent } from "../context/ContentContext";
import { DevGrid } from "./DevProjects";
import ProjectModal from "./projects/ProjectModal";
import { filterSqa, isAutomation, isSoftware, isSupplyChain, sqaFilters, useProjectModal } from "./projects/projectUtils";
import SqaModal from "./projects/SqaModal";
import { SqaGrid } from "./SqaProjects";
import FilterTabs from "./ui/FilterTabs";
import Reveal from "./ui/Reveal";

/**
 * Every project, grouped as on the homepage: supply chain systems, automation & AI, quality & test
 * automation and software & web. Served at /projects (and the legacy /ProjectsDetails); `?view=` selects
 * the group.
 */
const ProjectsDetails = () => {
  const { projects, sqaProjects, sections } = useContent();
  const [params, setParams] = useSearchParams();
  const [sqaFilter, setSqaFilter] = useState("all");
  const modal = useProjectModal();
  const sqaModal = useProjectModal();

  const qa = sections.find((section) => section.key === "sqa");
  const views = [
    { key: "supply-chain", label: "Supply chain", items: projects.filter(isSupplyChain) },
    { key: "automation", label: "Automation & AI", items: projects.filter(isAutomation) },
    { key: "qa", label: qa?.title || "Quality & test automation", items: sqaProjects, intro: qa?.subtitle },
    { key: "software", label: "Software & web", items: projects.filter(isSoftware) },
  ].filter((view) => view.items.length);
  // Older links used ?view=sqa and ?view=dev
  const requested = { sqa: "qa", dev: "software" }[params.get("view")] || params.get("view");
  const view = views.find((item) => item.key === requested) || views[0];

  return (
    <section aria-labelledby="projects-title" className="container-site pb-24 pt-28 md:pb-32 md:pt-36">
      <Reveal>
        <Link to="/#work" className="link text-[0.9375rem] font-medium text-body">
          <LuArrowLeft aria-hidden="true" className="h-4 w-4" />
          Back to the homepage
        </Link>
        <p className="eyebrow mt-10">Portfolio</p>
        <h1 id="projects-title" className="display mt-4 text-display-lg">
          All projects
        </h1>
        <p className="mt-5 max-w-[42rem] text-lead text-body">
          Supply chain systems first, then automation, quality and software projects.
        </p>
      </Reveal>

      {views.length > 0 && (
        <Reveal delay={0.1} className="mt-12 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <FilterTabs
            items={views.map((item) => ({ key: item.key, label: item.label, count: item.items.length }))}
            value={view.key}
            onChange={(key) => setParams({ view: key }, { replace: true })}
            label="Project group"
            layoutId="projects-view"
            className="self-start"
          />
          {view.key === "qa" && sqaFilters(sqaProjects).length > 2 && (
            <FilterTabs
              items={sqaFilters(sqaProjects)}
              value={sqaFilter}
              onChange={setSqaFilter}
              label="Filter QA projects by type"
              layoutId="projects-sqa-filter"
              className="self-start"
            />
          )}
        </Reveal>
      )}

      {view?.intro && <p className="copy mt-6 max-w-[40rem]">{view.intro}</p>}

      <div className="mt-10">
        {view?.key === "qa" ? (
          <SqaGrid projects={filterSqa(sqaProjects, sqaFilter)} all={sqaProjects} onOpen={sqaModal.openProject} />
        ) : (
          view && <DevGrid projects={view.items} all={view.items} onOpen={modal.openProject} />
        )}
      </div>

      <ProjectModal project={modal.project} open={modal.open} onClose={modal.close} />
      <SqaModal project={sqaModal.project} open={sqaModal.open} onClose={sqaModal.close} />
    </section>
  );
};

export default ProjectsDetails;
