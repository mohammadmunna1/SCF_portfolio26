import { twoDigits } from "../../lib/text";
import Reveal from "./Reveal";

/**
 * The header every section shares: its number and label ("03 — Projects") in small monospace type, like a
 * field on a shipping manifest, then the title and an optional introduction. `index` is the section's
 * position on the page (see Layouts/Home.jsx); without it the label stands alone.
 */
export default function SectionHeader({ section, id, index, className = "", children }) {
  const label = section.eyebrow;
  return (
    <Reveal as="header" className={className}>
      {(label || index) && (
        <p className="eyebrow flex items-center gap-3">
          {index && <span className="text-accent">{twoDigits(index)}</span>}
          {index && label && <span aria-hidden="true" className="h-px w-8 bg-line-strong" />}
          {label}
        </p>
      )}
      {section.title && (
        <h2 id={id} className="display mt-4 max-w-[22ch] text-balance text-display-lg">
          {section.title}
        </h2>
      )}
      {section.subtitle && <p className="mt-5 max-w-[42rem] text-lead text-body">{section.subtitle}</p>}
      {children}
    </Reveal>
  );
}
