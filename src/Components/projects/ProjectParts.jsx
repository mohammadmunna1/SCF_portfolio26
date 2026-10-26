import { LuArrowUpRight } from "react-icons/lu";
import { SiGithub } from "react-icons/si";
import { resolveAsset } from "../../lib/api";
import { hostname } from "../../lib/text";
import FlowDiagram from "../illustrations/FlowDiagram";
import { Button } from "../ui/Buttons";
import { CATEGORY_LABELS, counter } from "./projectUtils";

/**
 * Screenshot in a slim browser window — the image runs edge to edge under a thin address bar, at 2:1.
 * A quiet typographic stand-in is shown when there's no screenshot.
 */
export function BrowserFrame({ src, url, title, alt = "", eager = false, className = "", imageClassName = "", barClassName = "h-7 px-3" }) {
  return (
    <div className={`overflow-hidden bg-surface ${className}`}>
      <div className={`flex shrink-0 items-center gap-1.5 border-b border-line ${barClassName}`}>
        <span className="h-2 w-2 rounded-full bg-heading/20" />
        <span className="h-2 w-2 rounded-full bg-heading/15" />
        <span className="h-2 w-2 rounded-full bg-heading/10" />
        {url && <span className="ml-2 truncate font-mono text-[11px] leading-none text-muted">{hostname(url)}</span>}
      </div>
      <div className="aspect-[2/1] overflow-hidden bg-photo">
        {src ? (
          <img
            src={resolveAsset(src)}
            alt={alt}
            loading={eager ? "eager" : "lazy"}
            decoding="async"
            className={`block h-full w-full object-cover object-top ${imageClassName}`}
          />
        ) : (
          <div aria-hidden="true" className="grid h-full place-items-center bg-surface-raised px-6 text-center">
            <span className="text-[clamp(1.25rem,2.6vw,1.75rem)] font-semibold tracking-[-0.02em] text-heading">{title}</span>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Stand-in for a project without a screenshot: its workflow steps drawn as a route, on planning paper,
 * at the same 2:1 proportion as a screenshot.
 */
export function FlowPanel({ project, size = "md", className = "" }) {
  return (
    <figure className={`relative flex aspect-[2/1] flex-col justify-center overflow-hidden bg-surface ${className}`}>
      <div aria-hidden="true" className="dot-grid absolute inset-0 opacity-70" />
      <figcaption className="eyebrow absolute left-4 top-3 text-[0.6875rem]">Workflow · {project.title}</figcaption>
      <FlowDiagram steps={project.flow} size={size} className={size === "md" ? "mx-6 mt-4 md:mx-10" : "mx-3 mt-5"} />
    </figure>
  );
}

/** A project's preview: the screenshot, else its workflow, else the title on a plain frame. */
export function ProjectPreview({ project, size = "md", eager = false, className = "", imageClassName = "", barClassName }) {
  if (!project.image && project.flow?.length) return <FlowPanel project={project} size={size} className={className} />;
  return (
    <BrowserFrame
      src={project.image}
      url={project.liveUrl}
      title={project.title}
      alt={`${project.title} — screenshot`}
      eager={eager}
      className={className}
      imageClassName={imageClassName}
      barClassName={barClassName}
    />
  );
}

/** Compact technology / tool pills for a card: the first few, then "+3" for the rest (all are in the details). */
export function CardChips({ items = [], label, max = 4 }) {
  if (!items.length) return null;
  const shown = items.slice(0, max);
  const more = items.length - shown.length;
  return (
    <ul aria-label={label} className="mt-4 flex flex-wrap gap-1.5">
      {shown.map((item) => (
        <li key={item} className="chip-line chip-sm">
          {item}
        </li>
      ))}
      {more > 0 && (
        <li className="chip-line chip-sm text-body">
          +{more}
          <span className="sr-only"> more</span>
        </li>
      )}
    </ul>
  );
}

/** A project card: the preview leads, then a compact caption and small actions. `onOpen` shows the details. */
export function DevProjectCard({ project, index, total, onOpen }) {
  return (
    <article className="card group flex h-full flex-col overflow-hidden">
      <button
        type="button"
        onClick={() => onOpen(project)}
        className="block w-full overflow-hidden border-b border-line text-left"
      >
        <span className="sr-only">View details: {project.title}</span>
        <ProjectPreview
          project={project}
          size="sm"
          imageClassName="transition-transform duration-500 ease-out group-hover:scale-[1.02]"
        />
      </button>

      <div className="flex min-w-0 flex-1 flex-col p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="meta flex min-w-0 items-center gap-x-3 text-muted">
            <span className="shrink-0 tabular-nums">
              <span className="sr-only">Project </span>
              {counter(index, total)}
            </span>
            {project.context && <span className="truncate">{project.context}</span>}
          </p>
          {CATEGORY_LABELS[project.category] && <span className="tag shrink-0">{CATEGORY_LABELS[project.category]}</span>}
        </div>
        <h3 className="title-card mt-3">{project.title}</h3>
        {project.tagline && <p className="copy-card mt-1">{project.tagline}</p>}
        <CardChips items={project.technologies} label="Technologies" />
        <div className="mt-auto flex flex-wrap gap-2 pt-5">
          <Button size="sm" variant="primary" onClick={() => onOpen(project)}>
            Details<span className="sr-only">: {project.title}</span>
          </Button>
          {project.liveUrl && (
            <Button size="sm" variant="outline" href={project.liveUrl} icon={LuArrowUpRight}>
              Live site<span className="sr-only">: {project.title}</span>
            </Button>
          )}
          {project.repoUrl && (
            <Button size="sm" variant="quiet" href={project.repoUrl} leadingIcon={SiGithub}>
              Code<span className="sr-only">: {project.title}</span>
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}
