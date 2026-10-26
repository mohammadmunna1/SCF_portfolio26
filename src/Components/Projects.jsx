import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { LuArrowLeft, LuArrowRight } from "react-icons/lu";
import { useContent } from "../context/ContentContext";
import { SPRING_SOFT } from "../lib/motion";
import BentoGrid from "./projects/BentoGrid";
import CategoryPicker from "./projects/CategoryPicker";
import ProjectModal from "./projects/ProjectModal";
import { categoryFilters, filterByCategory, filterSqa, sqaFilters, useProjectModal } from "./projects/projectUtils";
import SqaModal from "./projects/SqaModal";
import { Button } from "./ui/Buttons";
import FilterTabs from "./ui/FilterTabs";
import SectionHeader from "./ui/SectionHeader";

// Two full Bento rows per category on the homepage; every project is on /projects.
const HOME_LIMIT = 6;
const HEADING = { eyebrow: "Portfolio", title: "Explore My Work" };
// The menu's section links land in this section and open their category.
const HASH_TO_CATEGORY = { "#sqa": "sqa", "#work": "dev" };

const SWAP = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: SPRING_SOFT },
  exit: { opacity: 0, y: -12, transition: { duration: 0.2 } },
};

/** The entries of a list field (tools, technologies) that recur most across projects. */
function mostUsed(projects, field, limit = 4) {
  const counts = new Map();
  for (const project of projects) for (const entry of project[field] || []) counts.set(entry, (counts.get(entry) || 0) + 1);
  return [...counts].sort((a, b) => b[1] - a[1]).slice(0, limit).map(([entry]) => entry);
}

/** Above the showcase: back to both categories, which one this is, and a switch to the other. */
function ShowcaseBar({ current, other, onBack, onSwitch }) {
  return (
    <div className="mb-8 flex flex-wrap items-center justify-between gap-x-6 gap-y-4 md:mb-10">
      <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2">
        <Button size="sm" variant="quiet" leadingIcon={LuArrowLeft} onClick={onBack}>
          All work
        </Button>
        <p className="meta">
          <span className="text-heading">{current.title}</span>
          <span className="text-muted">
            {" "}
            · {current.count} {current.count === 1 ? "project" : "projects"}
          </span>
        </p>
      </div>
      {other && (
        <button type="button" onClick={() => onSwitch(other.key)} className="caps link text-heading">
          Switch to {other.title}
          <LuArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

/**
 * "Explore My Work": the SQA and development projects in one section. First the two categories as
 * cards (CategoryPicker); choosing one shows its projects in a Bento showcase, with the category's
 * filter tabs in their usual place beside the heading. The categories' wording comes from their own
 * sections in the admin (SQA projects, Development) — hiding one there leaves a single category,
 * shown straight away.
 */
const Projects = ({ sections }) => {
  const { sqaProjects, projects } = useContent();
  const sectionRef = useRef(null);
  const reduceMotion = useReducedMotion();
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState({ sqa: "all", dev: "all" });
  const sqaModal = useProjectModal();
  const devModal = useProjectModal();

  // The homepage shows the development projects marked "Show on the homepage"
  const featured = projects.filter((project) => project.featured !== false);
  const devPool = featured.length ? featured : projects;

  const categories = [
    sections.sqa &&
      sqaProjects.length > 0 && {
        key: "sqa",
        kind: "sqa",
        section: sections.sqa,
        projects: sqaProjects,
        count: sqaProjects.length,
        tags: mostUsed(sqaProjects, "tools"),
        filters: sqaFilters(sqaProjects),
        shown: filterSqa(sqaProjects, filter.sqa).slice(0, HOME_LIMIT),
        all: sqaProjects,
        more: sqaProjects.length > HOME_LIMIT,
        viewAll: "/projects?view=sqa",
        onOpen: sqaModal.openProject,
      },
    sections.work &&
      projects.length > 0 && {
        key: "dev",
        kind: "dev",
        section: sections.work,
        projects: devPool,
        count: projects.length,
        tags: mostUsed(devPool, "technologies"),
        filters: categoryFilters(devPool),
        shown: filterByCategory(devPool, filter.dev),
        all: devPool,
        more: projects.length > devPool.length,
        viewAll: "/projects?view=dev",
        onOpen: devModal.openProject,
      },
  ]
    .filter(Boolean)
    .map((category) => ({
      ...category,
      eyebrow: category.section.eyebrow,
      title: category.section.title,
      intro: category.section.subtitle,
    }));

  const current = categories.length === 1 ? categories[0] : categories.find((category) => category.key === selected);
  const other = current && categories.find((category) => category.key !== current.key);

  const available = categories.map((category) => category.key).join(",");
  useEffect(() => {
    const open = (hash) => {
      const key = HASH_TO_CATEGORY[hash];
      if (key && available.split(",").includes(key)) setSelected(key);
    };
    open(window.location.hash);
    const onHashChange = () => open(window.location.hash);
    // Following the same link again (after going back to the categories) changes no hash, so clicks count too.
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

  if (!categories.length) return null;

  const choose = (key) => {
    setSelected(key);
    // The new view starts at the top of the section, if the visitor had scrolled past it.
    const section = sectionRef.current;
    if (section && section.getBoundingClientRect().top < 0) {
      section.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    }
  };

  return (
    <section ref={sectionRef} id="sqa" aria-labelledby="projects-title" className="section-y relative">
      {/* The menu's "Development" link (#work) lands here too */}
      <span id="work" aria-hidden="true" className="absolute inset-x-0 top-0 scroll-mt-[72px]" />
      <div className="container-site">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeader section={HEADING} id="projects-title" />
          {/* The category's filter tabs, where they've always been. They swap without an exit animation:
              their sliding pill is a shared-layout element, which mustn't hold up the change. */}
          {current && current.filters.length > 2 && (
            <motion.div key={current.key} className="self-start lg:self-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <FilterTabs
                items={current.filters}
                value={filter[current.key]}
                onChange={(value) => setFilter((previous) => ({ ...previous, [current.key]: value }))}
                label={current.kind === "sqa" ? "Filter SQA projects by type" : "Filter development projects by category"}
                layoutId={`${current.key}-filter`}
              />
            </motion.div>
          )}
        </div>

        <div className="mt-14 md:mt-20">
          <AnimatePresence mode="wait" initial={false}>
            {current ? (
              <motion.div key={current.key} {...SWAP}>
                {categories.length > 1 && (
                  <ShowcaseBar current={current} other={other} onBack={() => choose(null)} onSwitch={choose} />
                )}
                <BentoGrid kind={current.kind} projects={current.shown} all={current.all} onOpen={current.onOpen} />
                {current.more && (
                  <div className="mt-12 flex justify-center md:mt-16">
                    <Button to={current.viewAll} icon={LuArrowRight}>
                      {current.section.ctaLabel || "View all projects"}
                    </Button>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div key="categories" {...SWAP}>
                <CategoryPicker categories={categories} onSelect={choose} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <SqaModal project={sqaModal.project} open={sqaModal.open} onClose={sqaModal.close} />
      <ProjectModal project={devModal.project} open={devModal.open} onClose={devModal.close} />
    </section>
  );
};

export default Projects;
