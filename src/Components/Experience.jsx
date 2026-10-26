import { LuArrowUpRight } from "react-icons/lu";
import { useContent } from "../context/ContentContext";
import Reveal from "./ui/Reveal";
import SectionHeader from "./ui/SectionHeader";

/** One role on the timeline: dates on the left, a stop on the line, then the role, its focus and highlights. */
function Job({ job, last }) {
  const { current } = job;
  const highlights = job.highlights || [];
  const facts = [job.employmentType, job.location].filter(Boolean).join(" · ");

  return (
    <Reveal as="li" className="relative grid gap-x-8 pb-12 pl-10 last:pb-0 md:grid-cols-[11rem_1fr] md:pl-0 lg:grid-cols-[13rem_1fr]">
      {/* The line and this role's stop: down the left edge on phones, between the columns from tablets up */}
      {!last && (
        <span aria-hidden="true" className="absolute bottom-0 left-[0.4375rem] top-3 w-px bg-line md:left-[calc(11rem+1rem)] lg:left-[calc(13rem+1rem)]" />
      )}
      <span
        aria-hidden="true"
        className={`absolute left-0 top-1.5 grid h-[0.9375rem] w-[0.9375rem] place-items-center rounded-full border-2 md:left-[calc(11rem+1rem-0.4375rem)] lg:left-[calc(13rem+1rem-0.4375rem)] ${
          current ? "border-accent bg-accent/20" : "border-line-strong bg-canvas"
        }`}
      />

      <div className="md:pr-6 md:text-right">
        <p className={`meta ${current ? "text-accent" : "text-heading"}`}>{job.period}</p>
        {facts && <p className="mt-1 text-[0.875rem] text-muted">{facts}</p>}
      </div>

      <div className="mt-3 min-w-0 md:mt-0 md:pl-6">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <h3 className="title-item">{job.role}</h3>
          {current && <span className="tag border-accent/40 text-accent">Current</span>}
        </div>
        <p className="mt-1 text-[1rem] font-medium text-body">
          {job.companyUrl ? (
            <a href={job.companyUrl} target="_blank" rel="noopener noreferrer" className="link !inline text-heading">
              {job.company}
              <LuArrowUpRight aria-hidden="true" className="ml-1 inline-block h-3.5 w-3.5 align-[-0.1em]" />
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          ) : (
            job.company
          )}
        </p>
        {job.tags?.length > 0 && (
          <ul aria-label="Focus" className="mt-4 flex flex-wrap gap-1.5">
            {job.tags.map((tag) => (
              <li key={tag} className="chip chip-sm">
                {tag}
              </li>
            ))}
          </ul>
        )}
        {job.description && <p className="copy mt-4 max-w-3xl">{job.description}</p>}
        {highlights.length > 0 && (
          <ul className="copy mt-4 max-w-3xl space-y-2">
            {highlights.map((item) => (
              <li key={item} className="flex gap-3">
                <span aria-hidden="true" className={`mt-[0.75em] h-px w-3 shrink-0 ${current ? "bg-accent" : "bg-line-strong"}`} />
                {item}
              </li>
            ))}
          </ul>
        )}
      </div>
    </Reveal>
  );
}

/** Work history as a timeline, newest first — the current role always leads. */
const Experience = ({ section, index }) => {
  const { experience } = useContent();
  if (!experience.length) return null;
  // Keep the admin's order, but always lead with the current role(s).
  const jobs = [...experience].sort((a, b) => Number(Boolean(b.current)) - Number(Boolean(a.current)));

  return (
    <section id="experience" aria-labelledby="experience-title" className="section-y border-t border-line">
      <div className="container-site">
        <SectionHeader section={section} index={index} id="experience-title" />
        <ol className="mt-14 md:mt-16">
          {jobs.map((job, position) => (
            <Job key={job.id} job={job} last={position === jobs.length - 1} />
          ))}
        </ol>
      </div>
    </section>
  );
};

export default Experience;
