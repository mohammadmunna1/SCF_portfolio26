import { useId } from "react";
import { useContent } from "../context/ContentContext";
import { useCardStack } from "../hooks/useCardStack";
import { revealMotion } from "../lib/motion";
import SectionHeader from "./ui/SectionHeader";
import StackItem from "./ui/StackItem";

const KIND_LABELS = { qa: "Quality assurance", development: "Development", other: "Technical" };

/** The reference's circular badge: a label ringed by slowly rotating text (still for reduced motion). */
function RotatingBadge({ label, ring, className = "" }) {
  const pathId = useId();
  return (
    <div
      aria-hidden="true"
      className={`relative h-40 w-40 shrink-0 place-items-center rounded-full bg-button text-button-text xl:h-44 xl:w-44 ${className}`}
    >
      <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full animate-spin-slow">
        <defs>
          <path id={pathId} d="M100,100 m-76,0 a76,76 0 1,1 152,0 a76,76 0 1,1 -152,0" />
        </defs>
        <text className="fill-current text-[13px] uppercase">
          <textPath href={`#${pathId}`} textLength="474" lengthAdjust="spacing">
            {`${ring} · `.repeat(2)}
          </textPath>
        </text>
      </svg>
      <span className="display text-[3.25rem] leading-none text-button-text">{label}</span>
    </div>
  );
}

/** Skill groups from the CV as cards — quality assurance first. On phones the cards stack as you scroll. */
const Skills = ({ section }) => {
  const { skills } = useContent();
  const stack = useCardStack(skills.length);
  if (!skills.length) return null;

  return (
    <section id="skills" aria-labelledby="skills-title" className="section-y">
      <div className="container-site">
        <div className="flex items-end justify-between gap-10">
          <SectionHeader section={section} id="skills-title" />
          <RotatingBadge label="Skills" ring="Quality first · What I use" className="hidden md:grid" />
        </div>

        <ul {...stack.listProps} className="stack mt-14 grid gap-4 md:mt-20 md:grid-cols-2 md:gap-5 xl:grid-cols-3">
          {skills.map((group, index) => (
            <StackItem key={group.id} stack={stack} index={index} className="flex" {...revealMotion({ delay: (index % 3) * 0.06 })}>
              <div className="card flex w-full flex-col p-6 md:p-9">
                <div className="flex items-start justify-between gap-4">
                  <span aria-hidden="true" className="text-[2.5rem] font-extralight leading-none text-body/70">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {KIND_LABELS[group.kind] && (
                    <span className={`meta ${group.kind === "qa" ? "text-accent" : "text-body"}`}>
                      {KIND_LABELS[group.kind]}
                    </span>
                  )}
                </div>
                <h3 className="title-item mt-8">{group.title}</h3>
                <ul className="mt-5 flex flex-wrap gap-2">
                  {group.items.map((item) => (
                    <li key={item} className="chip-line">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </StackItem>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default Skills;
