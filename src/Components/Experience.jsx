import { LuArrowUpRight } from "react-icons/lu";
import { useContent } from "../context/ContentContext";
import { useCardStack } from "../hooks/useCardStack";
import { revealMotion } from "../lib/motion";
import SectionHeader from "./ui/SectionHeader";
import StackItem from "./ui/StackItem";

const TRACKS = { qa: "Quality assurance", development: "Software development" };

/** One role as a card (the current one marked by an accent edge and a badge). */
function Job({ job, index, stack }) {
  const { current } = job;
  const highlights = job.highlights || [];

  return (
    <StackItem stack={stack} index={index} {...revealMotion({ y: 36, amount: 0.15 })}>
      <div className="card relative overflow-hidden p-6 md:p-10">
        {current && <span aria-hidden="true" className="absolute inset-y-0 left-0 w-[3px] bg-accent" />}
        <div className="grid gap-6 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-4 lg:col-span-3">
            {current && (
              <p className="meta mb-5 inline-flex rounded-full bg-accent px-3 py-1 text-accent-on">Current role</p>
            )}
            {/* On a card, secondary labels use body text (muted is for the page background) */}
            <p className="meta text-heading">{job.period}</p>
            {job.location && <p className="meta mt-2 text-body">{job.location}</p>}
            {TRACKS[job.track] && <p className="meta mt-2 text-body">{TRACKS[job.track]}</p>}
          </div>

          <div className="md:col-span-8 lg:col-span-9">
            <h3 className="title-item">{job.role}</h3>
            <p className="mt-2 text-base font-light text-heading md:text-[1.0625rem]">
              {job.companyUrl ? (
                <a href={job.companyUrl} target="_blank" rel="noopener noreferrer" className="link">
                  {job.company}
                  <LuArrowUpRight aria-hidden="true" className="h-4 w-4" />
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              ) : (
                job.company
              )}
              {job.employmentType && <span className="text-body"> · {job.employmentType}</span>}
            </p>
            {job.description && <p className="copy mt-5 max-w-3xl">{job.description}</p>}
            {highlights.length > 0 && (
              <ul className="copy mt-6 max-w-3xl space-y-3">
                {highlights.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span aria-hidden="true" className={`mt-[0.8em] h-px w-3 shrink-0 ${current ? "bg-accent" : "bg-line-strong"}`} />
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </StackItem>
  );
}

/**
 * Work history, newest first and the current role leading, as cards that stack as you scroll — on
 * every screen size (the other card lists stack on phones only; see useCardStack).
 */
const Experience = ({ section }) => {
  const { experience } = useContent();
  const stack = useCardStack(experience.length, { allScreens: true });
  if (!experience.length) return null;
  // Keep the admin's order, but always lead with the current role(s).
  const jobs = [...experience].sort((a, b) => Number(Boolean(b.current)) - Number(Boolean(a.current)));

  return (
    <section id="experience" aria-labelledby="experience-title" className="section-y">
      <div className="container-site">
        <SectionHeader section={section} id="experience-title" />
        <ol {...stack.listProps} className="stack mt-14 grid gap-4 md:mt-20 md:gap-6">
          {jobs.map((job, index) => (
            <Job key={job.id} job={job} index={index} stack={stack} />
          ))}
        </ol>
      </div>
    </section>
  );
};

export default Experience;
