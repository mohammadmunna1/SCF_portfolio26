import About from "../Components/About";
import Contact from "../Components/Contact";
import Courses from "../Components/Courses";
import Education from "../Components/Education";
import Experience from "../Components/Experience";
import FAQ from "../Components/FAQ";
import Hero from "../Components/Hero";
import Projects from "../Components/Projects";
import Skills from "../Components/Skills";
import Stats from "../Components/Stats";
import Testimonials from "../Components/Testimonials";
import { useContent } from "../context/ContentContext";

// Section keys (managed in the admin panel) → components. Order and visibility come from the content.
const SECTION_COMPONENTS = {
  stats: Stats,
  about: About,
  experience: Experience,
  education: Education,
  courses: Courses,
  skills: Skills,
  testimonials: Testimonials,
  faq: FAQ,
  contact: Contact,
};

// Projects (work) and QA projects (sqa) share one Projects section, shown where the first of them is.
const PROJECT_KEYS = ["work", "sqa"];

/** Whether a section has anything to show — only those get a number, so the numbering never skips. */
const HAS_CONTENT = {
  stats: () => false, // a strip of figures, not a numbered section
  experience: (content) => content.experience.length > 0,
  work: (content) => content.projects.length > 0 || content.sqaProjects.length > 0,
  sqa: (content) => content.projects.length > 0 || content.sqaProjects.length > 0,
  education: (content) => content.education.length > 0 || content.achievements.length > 0,
  courses: (content) => content.certifications.length > 0,
  skills: (content) => content.skills.length > 0,
  testimonials: (content) => content.testimonials.length > 0,
  faq: (content) => content.faqs.length > 0,
};

const Home = () => {
  const content = useContent();
  const { sections } = content;
  const projectSections = Object.fromEntries(
    sections.filter((section) => PROJECT_KEYS.includes(section.key)).map((section) => [section.key, section])
  );
  const firstProjectKey = sections.find((section) => PROJECT_KEYS.includes(section.key))?.key;

  let number = 0;
  const numbered = (key) => ((HAS_CONTENT[key] ?? (() => true))(content) ? ++number : undefined);

  return (
    <>
      <Hero />
      {sections.map((section) => {
        if (PROJECT_KEYS.includes(section.key)) {
          if (section.key !== firstProjectKey) return null;
          return <Projects key="projects" sections={projectSections} index={numbered(section.key)} />;
        }
        const Section = SECTION_COMPONENTS[section.key];
        return Section ? <Section key={section.key} section={section} index={numbered(section.key)} /> : null;
      })}
    </>
  );
};

export default Home;
