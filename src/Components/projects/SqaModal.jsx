import { LuArrowUpRight } from "react-icons/lu";
import { SiGithub } from "react-icons/si";
import { Button } from "../ui/Buttons";
import Modal from "../ui/Modal";
import { CodeWindow } from "./SqaCard";

/** Everything about an SQA project: summary, highlights, setup, the full code excerpt, tools and links. */
export default function SqaModal({ project, open, onClose }) {
  const highlights = project?.highlights || [];
  const details = project
    ? [
        ["Framework", project.framework],
        ["Testing", project.testingType],
        ["Reporting", project.reportingTool],
        ["Methodology", project.methodology],
        ["Browsers", project.browsers?.join(", ")],
      ].filter(([, value]) => value)
    : [];

  return (
    <Modal open={open} onClose={onClose} labelledBy="sqa-modal-title" className="max-w-3xl">
      {project && (
        <article className="px-6 pb-8 pt-7 sm:px-10 sm:pb-10 sm:pt-9">
          {/* Right padding keeps the first line clear of the close button */}
          <div className="flex flex-wrap items-center gap-3 pr-12">
            <span className="tag">{project.type}</span>
            {project.testingType && <span className="meta">{project.testingType}</span>}
          </div>
          <h2
            id="sqa-modal-title"
            className="mt-4 text-[2rem] font-normal leading-[1.1] tracking-[-0.02em] text-heading md:text-[2.5rem]"
          >
            {project.title}
          </h2>
          {project.summary && <p className="copy mt-4 max-w-prose">{project.summary}</p>}

          {highlights.length > 0 && (
            <ul className="copy mt-6 max-w-prose space-y-2.5">
              {highlights.map((item) => (
                <li key={item} className="flex gap-3">
                  <span aria-hidden="true" className="mt-[0.8em] h-px w-3 shrink-0 bg-accent" />
                  {item}
                </li>
              ))}
            </ul>
          )}

          {details.length > 0 && (
            <>
              <div className="rule my-7" />
              <dl className="grid gap-x-10 gap-y-5 sm:grid-cols-2">
                {details.map(([label, value]) => (
                  <div key={label}>
                    <dt className="meta text-muted">{label}</dt>
                    <dd className="mt-1.5 text-base font-light leading-relaxed text-heading">{value}</dd>
                  </div>
                ))}
              </dl>
            </>
          )}

          {project.snippet && (
            <div className="mt-8 overflow-hidden rounded-2xl border border-line">
              <CodeWindow project={project} clip={false} />
            </div>
          )}

          {project.tools?.length > 0 && (
            <div className="mt-8">
              <h3 className="meta">Tools</h3>
              <ul className="mt-3 flex flex-wrap gap-2">
                {project.tools.map((tool) => (
                  <li key={tool} className="chip-line">
                    {tool}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {(project.repoUrl || project.liveUrl) && (
            <div className="mt-10 flex flex-wrap gap-2">
              {project.repoUrl && (
                <Button size="sm" variant="primary" href={project.repoUrl} leadingIcon={SiGithub}>
                  GitHub repository
                </Button>
              )}
              {project.liveUrl && (
                <Button size="sm" href={project.liveUrl} icon={LuArrowUpRight}>
                  Live demo
                </Button>
              )}
            </div>
          )}
        </article>
      )}
    </Modal>
  );
}
