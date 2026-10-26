import { LuArrowUpRight } from "react-icons/lu";
import { SiGithub } from "react-icons/si";
import { resolveAsset } from "../../lib/api";
import { hostname } from "../../lib/text";
import { Button } from "../ui/Buttons";
import { bentoClasses } from "./bento";
import { CATEGORY_LABELS, counter } from "./projectUtils";

/**
 * Screenshot in a slim browser window — the image runs edge to edge under a thin address bar.
 * A quiet typographic stand-in is shown when there's no screenshot. With `fill`, from tablets up the
 * window fills its parent's height (the image is cropped from the top) instead of keeping 2:1.
 */
export function BrowserFrame({
  src,
  url,
  title,
  alt = "",
  eager = false,
  fill = false,
  className = "",
  imageClassName = "",
  barClassName = "h-7 px-3",
}) {
  return (
    <div className={`overflow-hidden bg-surface ${fill ? "md:flex md:h-full md:flex-col" : ""} ${className}`}>
      <div className={`flex shrink-0 items-center gap-1.5 border-b border-line ${barClassName}`}>
        <span className="h-2 w-2 rounded-full bg-heading/25" />
        <span className="h-2 w-2 rounded-full bg-heading/15" />
        <span className="h-2 w-2 rounded-full bg-heading/10" />
        {url && <span className="ml-2 truncate text-[11px] leading-none text-body">{hostname(url)}</span>}
      </div>
      <div className={`aspect-[2/1] overflow-hidden bg-photo ${fill ? "md:aspect-auto md:min-h-0 md:flex-1" : ""}`}>
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
            <span>
              <span className="block text-[clamp(1.25rem,2.6vw,2rem)] font-light leading-tight tracking-[-0.02em] text-heading">
                {title}
              </span>
              <span className="meta mt-2 block text-body">Preview not available</span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// Pills on a card surface are outlined, like the Skills cards' pills — project cards always are on the
// homepage showcase (`onCard`), elsewhere only on phones.
const CARD_CHIP = "chip chip-sm max-md:border max-md:border-heading/15 max-md:bg-transparent";
const ON_CARD_CHIP = "chip-line chip-sm";

/** Compact technology / tool pills for a card: the first few, then "+3" for the rest (all are in the details). */
export function CardChips({ items = [], label, max = 4, onCard = false }) {
  if (!items.length) return null;
  const shown = items.slice(0, max);
  const more = items.length - shown.length;
  const chip = onCard ? ON_CARD_CHIP : CARD_CHIP;
  return (
    <ul aria-label={label} className="mt-3.5 flex flex-wrap gap-1.5">
      {shown.map((item) => (
        <li key={item} className={chip}>
          {item}
        </li>
      ))}
      {more > 0 && (
        <li className={`${chip} text-body`}>
          +{more}
          <span className="sr-only"> more</span>
        </li>
      )}
    </ul>
  );
}

/**
 * Development project: the screenshot leads, followed by a compact caption and small actions. On phones
 * it sits on a card surface, like the Experience and Skills cards it stacks with. `bento` (a cell from
 * bentoCells) lays it out for the homepage showcase: always on a card, sized by its cell.
 */
export function DevProjectCard({ project, index, total, onOpen, bento }) {
  const cell = bentoClasses(bento);
  return (
    <article className={`group flex h-full flex-col ${cell ? cell.card : "max-md:card max-md:p-3"}`}>
      <button
        type="button"
        onClick={() => onOpen(project)}
        className={`block w-full overflow-hidden rounded-2xl border border-line text-left transition-colors duration-300 hover:border-line-strong ${
          cell?.preview ?? ""
        }`}
      >
        <span className="sr-only">View details: {project.title}</span>
        <BrowserFrame
          src={project.image}
          url={project.liveUrl}
          title={project.title}
          fill={Boolean(cell)}
          imageClassName="transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.02]"
        />
      </button>

      <div className={`flex min-w-0 flex-1 flex-col ${cell ? cell.details : "pt-4 max-md:px-2 max-md:pb-2"}`}>
        <div className="flex items-center justify-between gap-3">
          <p className="meta flex min-w-0 items-center gap-x-3">
            <span className="shrink-0 tabular-nums text-body">
              <span className="sr-only">Project </span>
              {counter(index, total)}
            </span>
            {project.context && <span className="truncate text-muted">{project.context}</span>}
          </p>
          {CATEGORY_LABELS[project.category] && <span className="tag shrink-0">{CATEGORY_LABELS[project.category]}</span>}
        </div>
        <h3 className={`title-card mt-2.5 ${cell?.title ?? ""}`}>{project.title}</h3>
        {project.tagline && <p className="copy-card mt-1.5">{project.tagline}</p>}
        <CardChips items={project.technologies} label="Technologies" onCard={Boolean(cell)} />
        <div className="mt-auto flex flex-wrap gap-2 pt-5">
          <Button size="sm" variant="primary" onClick={() => onOpen(project)}>
            Details<span className="sr-only">: {project.title}</span>
          </Button>
          {project.liveUrl && (
            <Button size="sm" href={project.liveUrl} icon={LuArrowUpRight}>
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
