import { MaskText } from "./AnimatedText";
import Reveal from "./Reveal";

/** The reference's oversized title with its leading dash ("— My work process"). */
export function DisplayTitle({ id, text, as: Tag = "h2", className = "" }) {
  return (
    <Tag id={id} className={`display text-display-lg ${className}`}>
      <span aria-hidden="true" className="mr-[0.14em] inline-block h-[0.075em] w-[0.36em] bg-current align-[0.33em]" />
      <MaskText text={text} />
    </Tag>
  );
}

/** Small label, oversized title and an optional uppercase intro — the header used by every section. */
export default function SectionHeader({ section, id, className = "", children }) {
  return (
    <header className={className}>
      {section.eyebrow && (
        <Reveal as="p" y={12} className="caps mb-5 text-muted md:mb-6">
          {section.eyebrow}
        </Reveal>
      )}
      {section.title && <DisplayTitle id={id} text={section.title} />}
      {section.subtitle && (
        <Reveal as="p" y={16} delay={0.1} className="mt-6 max-w-[34rem] uppercase md:mt-8">
          {section.subtitle}
        </Reveal>
      )}
      {children}
    </header>
  );
}
