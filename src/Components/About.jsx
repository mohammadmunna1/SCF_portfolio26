import { LuDownload } from "react-icons/lu";
import { useContent } from "../context/ContentContext";
import { getKeywordIcon } from "../lib/icons";
import { cvLinkProps, paragraphs, twoDigits } from "../lib/text";
import ProfilePortrait from "./ProfilePortrait";
import { Button, NodesIcon } from "./ui/Buttons";
import Reveal from "./ui/Reveal";
import SectionHeader from "./ui/SectionHeader";

/**
 * The supply chain focus areas as stops on a route, like a shipment's tracking line: in a row on large
 * screens (the line runs through the stops), down the side below that.
 */
function FocusRoute({ items }) {
  if (!items?.length) return null;
  return (
    <Reveal className="mt-16 md:mt-20">
      <h3 className="eyebrow">Supply chain focus</h3>
      <ol className="relative mt-6 grid gap-y-5 lg:grid-flow-col lg:auto-cols-fr lg:gap-x-4">
        {/* The route: down the left on small screens, across on large ones */}
        <span aria-hidden="true" className="absolute bottom-5 left-[1.375rem] top-5 border-l border-dashed border-line-strong lg:hidden" />
        <span
          aria-hidden="true"
          className="absolute left-[1.375rem] top-[1.375rem] hidden border-t border-dashed border-line-strong lg:block"
          // From the first stop's centre to the last one's: columns share the width less the 1rem gaps
          style={{ right: `calc((100% - ${items.length - 1}rem) / ${items.length} - 1.375rem)` }}
        />
        {items.map((item, index) => {
          const Icon = getKeywordIcon(item);
          return (
            <li key={item} className="relative flex items-center gap-4 lg:flex-col lg:items-start lg:gap-4">
              <span className="relative grid h-11 w-11 shrink-0 place-items-center rounded-full border border-line bg-surface-raised text-heading shadow-sm">
                <Icon aria-hidden="true" className="h-5 w-5" />
              </span>
              <span className="min-w-0">
                <span className="eyebrow block text-[0.6875rem]">{twoDigits(index + 1)}</span>
                <span className="mt-0.5 block text-[0.9375rem] font-medium leading-snug text-heading">{item}</span>
              </span>
            </li>
          );
        })}
      </ol>
    </Reveal>
  );
}

/** About: the portrait, the story, the supply chain focus, the technical edge behind it and languages. */
const About = ({ section, index }) => {
  const { profile, experience, education } = useContent();

  return (
    <section id="about" aria-labelledby="about-title" className="section-y">
      <div className="container-site">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-5">
            <SectionHeader section={section} index={index} id="about-title" />
            <Reveal delay={0.05} className="mt-12">
              <ProfilePortrait profile={profile} experience={experience} education={education} className="lg:mx-0" />
            </Reveal>
          </div>
          <div className="lg:col-span-7 lg:pt-1">
            {paragraphs(profile.about).map((text, paragraph) => (
              <Reveal as="p" key={text.slice(0, 32)} delay={0.04 * paragraph} className={`copy max-w-[42rem] ${paragraph ? "mt-5" : ""}`}>
                {text}
              </Reveal>
            ))}
            <Reveal delay={0.1} className="mt-9 flex flex-wrap items-center gap-3">
              <Button href="#contact" variant="primary" leadingIcon={NodesIcon}>
                {profile.ctaButtonLabel || "Get in touch"}
              </Button>
              {profile.resumeUrl && (
                <Button href={profile.resumeUrl} variant="outline" leadingIcon={LuDownload} {...cvLinkProps(profile.resumeUrl)}>
                  Download CV
                </Button>
              )}
            </Reveal>
          </div>
        </div>

        <FocusRoute items={profile.focusAreas} />

        {(profile.devBackground?.length > 0 || profile.languages?.length > 0) && (
          <Reveal className="mt-14 grid gap-10 border-t border-line pt-10 md:grid-cols-12 md:gap-8">
            {profile.devBackground?.length > 0 && (
              <div className="md:col-span-8">
                <h3 className="eyebrow">Technical edge</h3>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {profile.devBackground.map((item) => (
                    <li key={item} className="chip-line bg-surface-raised">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {profile.languages?.length > 0 && (
              <div className="md:col-span-4">
                <h3 className="eyebrow">Languages</h3>
                <ul className="mt-4 space-y-1.5">
                  {profile.languages.map((item) => {
                    const [language, level] = item.split(/\s+[—–-]\s+/);
                    return (
                      <li key={item} className="flex flex-wrap items-baseline justify-between gap-x-4 text-[0.9375rem]">
                        <span className="font-medium text-heading">{language}</span>
                        {level && <span className="text-body">{level}</span>}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </Reveal>
        )}
      </div>
    </section>
  );
};

export default About;
