import { LuArrowUpRight, LuCheck, LuServer } from "react-icons/lu";
import { SiGithub } from "react-icons/si";
import { paragraphs, twoDigits } from "../../lib/text";
import { Button } from "../ui/Buttons";
import Reveal from "../ui/Reveal";
import { ProjectPreview } from "./ProjectParts";

/**
 * A supply chain project told as a short case study: on one side the screenshot (or its workflow) with
 * the stack and links to the live system and the code; on the other what it does and what I did.
 * `reverse` swaps the sides on large screens, so consecutive case studies alternate.
 */
export default function CaseStudy({ project, index, reverse = false }) {
  const highlights = project.highlights || [];
  const [summary] = paragraphs(project.description);
  const hasLinks = project.liveUrl || project.repoUrl || project.serverRepoUrl;

  return (
    <Reveal as="article" className="grid items-start gap-8 lg:grid-cols-12 lg:gap-14" aria-labelledby={`case-${project.id}`}>
      <div className={`lg:col-span-7 ${reverse ? "lg:order-2" : ""}`}>
        <div className="overflow-hidden rounded-2xl border border-line shadow-sm">
          <ProjectPreview project={project} />
        </div>
        {(project.technologies?.length > 0 || hasLinks) && (
          <div className="mt-5 flex flex-wrap items-center justify-between gap-x-6 gap-y-4">
            {project.technologies?.length > 0 && (
              <ul aria-label="Technologies" className="flex flex-wrap gap-1.5">
                {project.technologies.map((tech) => (
                  <li key={tech} className="chip chip-sm">
                    {tech}
                  </li>
                ))}
              </ul>
            )}
            {hasLinks && (
              <div className="flex flex-wrap gap-2">
                {project.liveUrl && (
                  <Button size="sm" variant="primary" href={project.liveUrl} icon={LuArrowUpRight}>
                    Live demo<span className="sr-only">: {project.title}</span>
                  </Button>
                )}
                {project.repoUrl && (
                  <Button size="sm" variant="outline" href={project.repoUrl} leadingIcon={SiGithub}>
                    {project.serverRepoUrl ? "Client code" : "Source code"}
                    <span className="sr-only">: {project.title}</span>
                  </Button>
                )}
                {project.serverRepoUrl && (
                  <Button size="sm" variant="outline" href={project.serverRepoUrl} leadingIcon={LuServer}>
                    Server code<span className="sr-only">: {project.title}</span>
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className={`lg:col-span-5 ${reverse ? "lg:order-1" : ""}`}>
        <p className="eyebrow flex flex-wrap items-center gap-x-3">
          <span className="text-accent">Case {twoDigits(index + 1)}</span>
          {project.context && (
            <>
              <span aria-hidden="true" className="h-px w-6 bg-line-strong" />
              {project.context}
            </>
          )}
        </p>
        <h3 id={`case-${project.id}`} className="display mt-3 text-display-md">
          {project.title}
        </h3>
        {project.tagline && <p className="mt-1.5 text-[1.0625rem] font-medium text-heading">{project.tagline}</p>}
        {summary && <p className="copy mt-4">{summary}</p>}

        {highlights.length > 0 && (
          <div className="mt-6">
            <h4 className="eyebrow text-[0.6875rem]">What I did</h4>
            <ul className="mt-3 space-y-2">
              {highlights.map((item) => (
                <li key={item} className="flex gap-3 text-[0.9375rem] leading-relaxed text-body">
                  <LuCheck aria-hidden="true" className="mt-[0.3em] h-4 w-4 shrink-0 text-accent" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Reveal>
  );
}
