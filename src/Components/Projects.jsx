import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { LuArrowRight } from "react-icons/lu";
import { useContent } from "../context/ContentContext";
import CaseStudy from "./projects/CaseStudy";
import ProjectModal from "./projects/ProjectModal";
import { DevProjectCard } from "./projects/ProjectParts";
import { isAutomation, isSoftware, isSupplyChain, useProjectModal } from "./projects/projectUtils";
import SqaCard from "./projects/SqaCard";
import SqaModal from "./projects/SqaModal";
import { Button } from "./ui/Buttons";
import FilterTabs from "./ui/FilterTabs";
import Reveal from "./ui/Reveal";
import SectionHeader from "./ui/SectionHeader";

// Cards per tab on the homepage; every project is on /projects.
const HOME_LIMIT = 6;
const FALLBACK_HEADING = { eyebrow: "Projects", title: "Projects" };
// The menu's link to the QA projects (#sqa) lands in this section and opens their tab.
const HASH_TO_GROUP = { "#sqa": "qa" };

/** The "All" tab: the first two of each group in turn, then the rest in order, up to the limit. */
function mixGroups(groups, limit) {
  const picked = groups.flatMap((group) => group.entries.slice(0, 2));
  for (const group of groups) for (const entry of group.entries.slice(2)) if (picked.length < limit) picked.push(entry);
  return picked.slice(0, limit);
}

/**
 * Projects: the supply chain systems first, as case studies, then the rest of the work under tabs —
 * automation & AI, quality & test automation, software & web. The wording comes from the Projects and
 * QA projects sections in the admin; hiding one of them hides its part here.
 */
const Projects = ({ sections, index }) => {
  const { projects, sqaProjects } = useContent();
  const [selected, setSelected] = useState(null);
  const devModal = useProjectModal();
  const sqaModal = useProjectModal();

  const work = sections.work;
  const qa = sections.sqa;
  // The homepage shows the projects marked "Show on the homepage"
  const featured = projects.filter((project) => project.featured !== false);
  const caseStudies = work ? featured.filter(isSupplyChain) : [];

  // Each card is an entry: the project, the card it uses and the list its counter numbers it in.
  const toGroup = (key, label, kind, items, total, intro) => ({
    key,
    label,
    intro,
    count: total.length,
    entries: items.map((project) => ({ project, kind, total })),
  });
  const groups = [
    work && toGroup("automation", "Automation & AI", "dev", featured.filter(isAutomation), projects.filter(isAutomation)),
    qa && toGroup("qa", qa.title || "Quality & test automation", "qa", sqaProjects, sqaProjects, qa.subtitle),
    work && toGroup("software", "Software & web", "dev", featured.filter(isSoftware), projects.filter(isSoftware)),
  ].filter((entry) => entry && entry.entries.length);
  const tabs =
    groups.length > 1
      ? [{ key: "all", label: "All", count: groups.reduce((sum, entry) => sum + entry.count, 0), entries: mixGroups(groups, HOME_LIMIT) }, ...groups]
      : groups;
  const active = tabs.find((tab) => tab.key === selected) || tabs[0];

  const available = tabs.map((tab) => tab.key).join(",");
  useEffect(() => {
    const open = (hash) => {
      const key = HASH_TO_GROUP[hash];
      if (key && available.split(",").includes(key)) setSelected(key);
    };
    open(window.location.hash);
    const onHashChange = () => open(window.location.hash);
    // Following the same link again changes no hash, so clicks count too.
    const onClick = (event) => {
      const link = event.target.closest?.("a[href]");
      if (link?.hash && link.pathname === window.location.pathname) open(link.hash);
    };
    window.addEventListener("hashchange", onHashChange);
    document.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("hashchange", onHashChange);
      document.removeEventListener("click", onClick);
    };
  }, [available]);

  if (!caseStudies.length && !groups.length) return null;
  const shown = active ? active.entries.slice(0, HOME_LIMIT) : [];

  return (
    <section id="work" aria-labelledby="projects-title" className="section-y relative border-t border-line">
      {/* The menu's link to the QA projects (#sqa) lands here too */}
      <span id="sqa" aria-hidden="true" className="absolute inset-x-0 top-0 scroll-mt-[84px]" />
      <div className="container-site">
        <SectionHeader section={work || qa || FALLBACK_HEADING} index={index} id="projects-title" />

        {caseStudies.length > 0 && (
          <div className="mt-14 space-y-20 md:mt-20 md:space-y-28">
            {caseStudies.map((project, position) => (
              <CaseStudy key={project.id} project={project} index={position} reverse={position % 2 === 1} />
            ))}
          </div>
        )}

        {active && (
          <div className={caseStudies.length ? "mt-24 border-t border-line pt-14 md:mt-28" : "mt-14"}>
            <Reveal className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h3 className="eyebrow">{caseStudies.length ? "More work" : "Work"}</h3>
                {active.intro && <p className="copy-card mt-2 max-w-[36rem]">{active.intro}</p>}
              </div>
              {tabs.length > 1 && (
                <FilterTabs
                  items={tabs.map((tab) => ({ key: tab.key, label: tab.label, count: tab.count }))}
                  value={active.key}
                  onChange={setSelected}
                  label="Project group"
                  layoutId="projects-group"
                  className="self-start lg:self-auto"
                />
              )}
            </Reveal>

            <AnimatePresence mode="wait" initial={false}>
              <motion.ul
                key={active.key}
                className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
              >
                {shown.map(({ project, kind, total }) => (
                  <li key={project.id} className="min-w-0">
                    {kind === "qa" ? (
                      <SqaCard project={project} index={total.indexOf(project)} total={total.length} onOpen={sqaModal.openProject} />
                    ) : (
                      <DevProjectCard project={project} index={total.indexOf(project)} total={total.length} onOpen={devModal.openProject} />
                    )}
                  </li>
                ))}
              </motion.ul>
            </AnimatePresence>
          </div>
        )}

        <div className="mt-12 flex justify-center">
          <Button to={`/projects${active && active.key !== "all" ? `?view=${active.key}` : ""}`} variant="outline" icon={LuArrowRight}>
            {work?.ctaLabel || "View all projects"}
          </Button>
        </div>
      </div>
      <SqaModal project={sqaModal.project} open={sqaModal.open} onClose={sqaModal.close} />
      <ProjectModal project={devModal.project} open={devModal.open} onClose={devModal.close} />
    </section>
  );
};

export default Projects;
