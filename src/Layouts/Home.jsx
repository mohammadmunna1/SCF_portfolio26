import About from "../Components/About";
import Contact from "../Components/Contact";
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
  about: About,
  stats: Stats,
  experience: Experience,
  skills: Skills,
  education: Education,
  testimonials: Testimonials,
  faq: FAQ,
  contact: Contact,
};

// The SQA and development sections share one "Explore My Work" section, shown where the first of them is.
const PROJECT_KEYS = ["sqa", "work"];

const Home = () => {
  const { sections } = useContent();
  const projectSections = Object.fromEntries(
    sections.filter((section) => PROJECT_KEYS.includes(section.key)).map((section) => [section.key, section])
  );
  const firstProjectKey = sections.find((section) => PROJECT_KEYS.includes(section.key))?.key;

  return (
    <>
      <Hero />
      {sections.map((section) => {
        if (PROJECT_KEYS.includes(section.key)) {
          return section.key === firstProjectKey ? <Projects key="projects" sections={projectSections} /> : null;
        }
        const Section = SECTION_COMPONENTS[section.key];
        return Section ? <Section key={section.key} section={section} /> : null;
      })}
    </>
  );
};

export default Home;
