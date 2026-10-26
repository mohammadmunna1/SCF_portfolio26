import { LuArrowUpRight } from "react-icons/lu";
import { useContent } from "../context/ContentContext";
import { paragraphs } from "../lib/text";
import { Button, NodesIcon } from "./ui/Buttons";
import Marquee from "./ui/Marquee";
import Reveal from "./ui/Reveal";

/**
 * One About group: a small heading over compact capsules that sit side by side and wrap — the site's
 * outlined chip, numbered ("01. Manual Testing"). Hovering one fills it from the bottom and its text
 * inverts (see `.capsule` in index.css).
 */
function CapsuleList({ title, items, current = false }) {
  if (!items?.length) return null;
  return (
    <Reveal>
      <h3 className="caps flex items-center gap-2.5 text-body">
        {current && <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-accent" />}
        {title}
      </h3>
      <ol className="mt-4 flex flex-wrap gap-2">
        {items.map((item, index) => (
          <li key={item} className="chip-line capsule hover-fill">
            <span aria-hidden="true" className="hover-fill-soft text-[0.75rem] tabular-nums text-muted">
              {String(index + 1).padStart(2, "0")}.
            </span>
            <span className="hover-fill-ink">{item}</span>
          </li>
        ))}
      </ol>
    </Reveal>
  );
}

/** Giant scrolling title band ("About me — About me —"), as on the reference's about page. */
function TitleBand({ text }) {
  return (
    <Marquee
      decorative
      items={[text]}
      minItems={4}
      duration={14}
      gap={0}
      renderItem={(item) => (
        <span className="display flex items-center whitespace-nowrap text-display-xl !leading-[1.06] text-body">
          {item}
          <span className="mx-[0.25em] inline-block h-[0.075em] w-[0.45em] bg-current" />
        </span>
      )}
    />
  );
}

/** About: the bio, current QA focus and the development background behind it. */
const About = ({ section }) => {
  const { profile } = useContent();

  return (
    <section id="about" aria-labelledby="about-title" className="section-y">
      <h2 id="about-title" className="sr-only">
        {section.title}
      </h2>
      {section.title && <TitleBand text={section.title} />}

      <div className="container-site mt-16 grid gap-14 md:mt-24 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-7">
          {section.eyebrow && (
            <Reveal as="p" y={12} className="caps mb-6 text-muted">
              {section.eyebrow}
            </Reveal>
          )}
          {/* Every paragraph, the first included, is set as light body copy — justified on phones, with
              hyphenation so the narrow column doesn't open wide gaps between words */}
          {paragraphs(profile.about).map((text, index) => (
            <Reveal
              as="p"
              key={text.slice(0, 32)}
              delay={0.05 * index}
              className={`copy max-w-[42rem] max-md:text-justify max-md:hyphens-auto ${index ? "mt-6" : ""}`}
            >
              {text}
            </Reveal>
          ))}
          <Reveal delay={0.1} className="mt-10 flex flex-wrap items-center gap-3">
            <Button href="#contact" leadingIcon={NodesIcon}>
              {profile.ctaButtonLabel || "Get in touch"}
            </Button>
            {profile.resumeUrl && (
              <Button href={profile.resumeUrl} variant="quiet" icon={LuArrowUpRight}>
                Resume
              </Button>
            )}
          </Reveal>
        </div>

        {/* Side by side on tablets (the bio sits above); stacked beside the bio on desktop, packed at the top */}
        <div className="grid content-start gap-12 md:grid-cols-2 md:gap-8 lg:col-span-5 lg:grid-cols-1 lg:gap-10 lg:pl-10">
          <CapsuleList title="Current focus — Quality assurance" items={profile.focusAreas} current />
          <CapsuleList title="Previous experience — Development" items={profile.devBackground} />
        </div>
      </div>
    </section>
  );
};

export default About;
