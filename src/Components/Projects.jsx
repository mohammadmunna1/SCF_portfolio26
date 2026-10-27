import { LuArrowRight } from "react-icons/lu";
import { useContent } from "../context/ContentContext";
import CaseStudy from "./projects/CaseStudy";
import { isDevelopment, isSupplyChain } from "./projects/projectUtils";
import { Button } from "./ui/Buttons";
import SectionHeader from "./ui/SectionHeader";

const FALLBACK_HEADING = { eyebrow: "Projects", title: "Projects" };

/**
 * Projects: the supply chain systems, as case studies — the work this portfolio is about. The rest (QA and
 * development work) is one link away, on /projects, which opens at the first of those groups (QA only while
 * its section is shown). The wording and the button's label come from the Projects section in the admin.
 */
const Projects = ({ sections, index }) => {
  const { projects, sqaProjects } = useContent();

  const work = sections.work;
  const qa = sections.sqa;
  // The homepage shows the supply chain projects marked "Show on the homepage"
  const caseStudies = work ? projects.filter((project) => project.featured !== false && isSupplyChain(project)) : [];
  const more = [
    ["qa", qa ? sqaProjects.length : 0],
    ["development", work ? projects.filter(isDevelopment).length : 0],
  ].find(([, count]) => count > 0)?.[0];

  if (!caseStudies.length && !more) return null;

  return (
    <section id="work" aria-labelledby="projects-title" className="section-y relative">
      {/* Older links to the QA projects (#sqa) land here too */}
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

        {more && (
          <div className="mt-16 flex justify-center md:mt-20">
            <Button to={`/projects?view=${more}`} variant="outline" icon={LuArrowRight}>
              {work?.ctaLabel || "View more projects"}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default Projects;
