import { LuArrowUpRight, LuCheck, LuServer } from "react-icons/lu";
import { SiGithub } from "react-icons/si";
import { paragraphs } from "../../lib/text";
import { Button } from "../ui/Buttons";
import Modal from "../ui/Modal";
import { ProjectPreview } from "./ProjectParts";
import { CATEGORY_LABELS } from "./projectUtils";

/** Everything about a project: preview (screenshot or workflow), description, what I did, stack and links. */
export default function ProjectModal({ project, open, onClose }) {
  const highlights = project?.highlights || [];
  return (
    <Modal open={open} onClose={onClose} labelledBy="project-modal-title" className="max-w-4xl">
      {project && (
        <article>
          {/* Preview edge to edge; the dialog's close button sits in the window bar, not on the image */}
          {project.image ? (
            <ProjectPreview project={project} eager barClassName="h-14 pl-5 pr-16" />
          ) : (
            <div className="border-b border-line pt-12">
              <ProjectPreview project={project} />
            </div>
          )}
          <div className="px-6 pb-8 pt-8 sm:px-10 sm:pb-10">
            <div className="flex flex-wrap items-center gap-3">
              {CATEGORY_LABELS[project.category] && <span className="tag">{CATEGORY_LABELS[project.category]}</span>}
              {project.context && <span className="meta text-muted">{project.context}</span>}
            </div>
            <h2 id="project-modal-title" className="display mt-4 text-display-md">
              {project.title}
            </h2>
            {project.tagline && <p className="mt-2 text-[1.0625rem] font-medium text-heading">{project.tagline}</p>}

            <div className="rule my-7" />
            <div className="copy max-w-prose space-y-4">
              {paragraphs(project.description).map((text) => (
                <p key={text.slice(0, 40)}>{text}</p>
              ))}
            </div>

            {highlights.length > 0 && (
              <div className="mt-8">
                <h3 className="eyebrow">What I did</h3>
                <ul className="mt-3 max-w-prose space-y-2">
                  {highlights.map((item) => (
                    <li key={item} className="flex gap-3 text-[0.9375rem] leading-relaxed text-body">
                      <LuCheck aria-hidden="true" className="mt-[0.3em] h-4 w-4 shrink-0 text-accent" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {project.technologies?.length > 0 && (
              <div className="mt-8">
                <h3 className="eyebrow">Tech stack</h3>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {project.technologies.map((tech) => (
                    <li key={tech} className="chip-line">
                      {tech}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {(project.liveUrl || project.repoUrl || project.serverRepoUrl) && (
              <div className="mt-10 flex flex-wrap gap-2">
                {project.liveUrl && (
                  <Button size="sm" variant="primary" href={project.liveUrl} icon={LuArrowUpRight}>
                    Live site
                  </Button>
                )}
                {project.repoUrl && (
                  <Button size="sm" variant="outline" href={project.repoUrl} leadingIcon={SiGithub}>
                    {project.serverRepoUrl ? "Client code" : "Source code"}
                  </Button>
                )}
                {project.serverRepoUrl && (
                  <Button size="sm" variant="outline" href={project.serverRepoUrl} leadingIcon={LuServer}>
                    Server code
                  </Button>
                )}
              </div>
            )}
          </div>
        </article>
      )}
    </Modal>
  );
}
