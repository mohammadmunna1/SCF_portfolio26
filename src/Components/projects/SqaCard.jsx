import { LuArrowUpRight } from "react-icons/lu";
import { SiGithub } from "react-icons/si";
import { resolveAsset } from "../../lib/api";
import { getToolIcon } from "../../lib/icons";
import { Button } from "../ui/Buttons";
import { bentoClasses } from "./bento";
import { highlight, languageFor } from "./highlight";
import { CardChips } from "./ProjectParts";
import { counter } from "./projectUtils";

const TONE_CLASS = { keyword: "text-accent", string: "text-heading", comment: "text-muted", tag: "text-muted" };

/** Title bar shared by the code and tool previews, so every card's preview reads the same way. */
function WindowBar({ label }) {
  return (
    <figcaption className="flex h-8 shrink-0 items-center gap-3 border-b border-line px-3">
      <span aria-hidden="true" className="flex gap-1.5">
        <span className="h-2 w-2 rounded-full bg-heading/25" />
        <span className="h-2 w-2 rounded-full bg-heading/15" />
        <span className="h-2 w-2 rounded-full bg-heading/10" />
      </span>
      <span className="truncate font-mono text-[11px] text-body">{label}</span>
    </figcaption>
  );
}

/**
 * A code-editor window showing a short excerpt from the repository. In a card it is cut to the
 * preview's height and fades out (`clip`); the details dialog shows every line.
 */
export function CodeWindow({ project, clip = true }) {
  const lines = highlight(project.snippet, languageFor(project));
  const fileName = project.snippetFile || `${project.title}.txt`;
  return (
    <figure className="flex h-full flex-col overflow-hidden bg-surface">
      <WindowBar label={fileName} />
      <pre
        aria-label={`Code excerpt from ${fileName}`}
        className={`flex-1 px-4 py-4 font-mono ${
          clip ? "mask-fade-code overflow-hidden text-[12px] leading-[1.7]" : "overflow-x-auto text-[13px] leading-[1.75]"
        }`}
      >
        <code>
          {lines.map((parts, lineIndex) => (
            <span key={lineIndex} className="block whitespace-pre">
              <span aria-hidden="true" className="mr-4 inline-block w-5 select-none text-right text-muted">
                {lineIndex + 1}
              </span>
              {parts.map((part, partIndex) => (
                <span key={partIndex} className={TONE_CLASS[part.tone] || "text-body"}>
                  {part.text}
                </span>
              ))}
            </span>
          ))}
        </code>
      </pre>
    </figure>
  );
}

/** Without a screenshot or code excerpt: the project's tools as a small stack, plus the browsers covered. */
function ToolStack({ project }) {
  const tools = (project.tools?.length ? project.tools : [project.framework || `${project.type} testing`]).slice(0, 4);
  return (
    <figure className="flex h-full flex-col overflow-hidden bg-surface">
      <WindowBar label={`Tool stack · ${project.type} testing`} />
      <div className="flex flex-1 flex-col gap-3 p-4">
        {/* Two columns at every size so the tiles suit a narrow card; an odd last tile takes the whole row */}
        <ul className="grid flex-1 auto-rows-fr grid-cols-2 gap-2">
          {tools.map((tool, index) => {
            const Icon = getToolIcon(tool);
            const wide = tools.length % 2 === 1 && index === tools.length - 1;
            return (
              <li
                key={tool}
                className={`flex min-w-0 items-center gap-2.5 rounded-xl border border-line bg-canvas px-3 py-2 ${wide ? "col-span-2" : ""}`}
              >
                <Icon aria-hidden="true" className="h-5 w-5 shrink-0 text-heading" />
                <span className="text-sm font-light leading-snug text-heading">{tool}</span>
              </li>
            );
          })}
        </ul>
        {project.browsers?.length > 0 && (
          <p className="meta truncate text-body">
            <span className="text-muted">Browsers ·</span> {project.browsers.join(" · ")}
          </p>
        )}
      </div>
    </figure>
  );
}

/**
 * Preview priority: screenshot → code excerpt → tool stack. Same proportions on every card; nothing
 * overlaid. `className` sizes it differently (the Bento showcase sets a height from tablets up).
 */
function SqaPreview({ project, className = "" }) {
  let preview;
  if (project.image) {
    preview = (
      <img
        src={resolveAsset(project.image)}
        alt={`${project.title} preview`}
        loading="lazy"
        decoding="async"
        className="h-full w-full bg-photo object-cover object-top"
      />
    );
  } else if (project.snippet) {
    preview = <CodeWindow project={project} />;
  } else {
    preview = <ToolStack project={project} />;
  }
  return <div className={`aspect-[16/10] overflow-hidden rounded-2xl border border-line ${className}`}>{preview}</div>;
}

/** The card's one paragraph: the summary, or the framework and testing type when there's no summary. */
const description = (project) => project.summary || [project.framework, project.testingType].filter(Boolean).join(" · ");

/**
 * SQA / test automation project card — compact, so three fit a row on large screens. Long content
 * (highlights, setup, the whole code excerpt) is in the details dialog that `onOpen` shows. On phones
 * it sits on a card surface, like the Experience and Skills cards it stacks with. `bento` (a cell from
 * bentoCells) lays it out for the homepage showcase: always on a card, sized by its cell.
 */
export default function SqaCard({ project, index, total, onOpen, bento }) {
  const text = description(project);
  const cell = bentoClasses(bento);

  return (
    <article className={`flex h-full min-w-0 flex-col ${cell ? cell.card : "max-md:card max-md:p-3"}`}>
      <SqaPreview project={project} className={cell ? `md:aspect-auto ${cell.preview}` : ""} />
      <div className={`flex min-w-0 flex-1 flex-col ${cell ? cell.details : "pt-4 max-md:px-2 max-md:pb-2"}`}>
        <div className="flex items-center justify-between gap-3">
          <span className="meta tabular-nums text-body">
            <span className="sr-only">Project </span>
            {counter(index, total)}
          </span>
          <span className="tag">{project.type}</span>
        </div>
        <h3 className={`title-card mt-2.5 ${cell?.title ?? ""}`}>{project.title}</h3>
        {/* Three lines at most, so cards in a row stay level */}
        {text && <p className="copy-card mt-1.5 line-clamp-3">{text}</p>}
        <CardChips items={project.tools} label="Tools" onCard={Boolean(cell)} />

        <div className="mt-auto flex flex-wrap gap-2 pt-5">
          {onOpen && (
            <Button size="sm" variant="primary" onClick={() => onOpen(project)}>
              Details<span className="sr-only">: {project.title}</span>
            </Button>
          )}
          {project.repoUrl && (
            <Button href={project.repoUrl} size="sm" leadingIcon={SiGithub}>
              GitHub<span className="sr-only"> repository: {project.title}</span>
            </Button>
          )}
          {project.liveUrl && (
            <Button href={project.liveUrl} size="sm" variant="quiet" icon={LuArrowUpRight}>
              Live demo<span className="sr-only">: {project.title}</span>
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}
