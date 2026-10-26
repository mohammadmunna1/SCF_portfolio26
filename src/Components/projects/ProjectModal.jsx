import { LuArrowUpRight, LuServer } from "react-icons/lu";
import { SiGithub } from "react-icons/si";
import { paragraphs } from "../../lib/text";
import { Button } from "../ui/Buttons";
import Modal from "../ui/Modal";
import { BrowserFrame } from "./ProjectParts";
import { CATEGORY_LABELS } from "./projectUtils";

export default function ProjectModal({ project, open, onClose }) {
  return (
    <Modal open={open} onClose={onClose} labelledBy="project-modal-title" className="max-w-4xl">
      {project && (
        <article>
          {/* Screenshot edge to edge; the dialog's close button sits in the window bar, not on the image */}
          <BrowserFrame
            src={project.image}
            url={project.liveUrl}
            title={project.title}
            alt={`${project.title} screenshot`}
            eager
            barClassName="h-14 pl-5 pr-16"
          />
          <div className="px-6 pb-8 pt-8 sm:px-10 sm:pb-10">
            <div className="flex flex-wrap items-center gap-3">
              {CATEGORY_LABELS[project.category] && <span className="tag">{CATEGORY_LABELS[project.category]}</span>}
              {project.context && <span className="meta">{project.context}</span>}
            </div>
            <h2
              id="project-modal-title"
              className="mt-4 text-[2rem] font-normal leading-[1.1] tracking-[-0.02em] text-heading md:text-[2.5rem]"
            >
              {project.title}
            </h2>
            {project.tagline && <p className="copy mt-3 text-heading">{project.tagline}</p>}

            <div className="rule my-7" />
            <div className="copy max-w-prose space-y-4">
              {paragraphs(project.description).map((text) => (
                <p key={text.slice(0, 40)}>{text}</p>
              ))}
            </div>

            {project.technologies?.length > 0 && (
              <div className="mt-8">
                <h3 className="meta">Tech stack</h3>
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
                  <Button size="sm" href={project.repoUrl} leadingIcon={SiGithub}>
                    {project.serverRepoUrl ? "Client code" : "Source code"}
                  </Button>
                )}
                {project.serverRepoUrl && (
                  <Button size="sm" href={project.serverRepoUrl} leadingIcon={LuServer}>
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
