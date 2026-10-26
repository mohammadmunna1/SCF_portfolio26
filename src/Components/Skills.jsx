import { LuCheck } from "react-icons/lu";
import { useContent } from "../context/ContentContext";
import { getIcon } from "../lib/icons";
import Reveal from "./ui/Reveal";
import SectionHeader from "./ui/SectionHeader";

/**
 * Skills in two tiers: the supply chain capabilities as cards with a checked list each, then the technical
 * toolkit behind them as a compact table of chips (every category other than supply chain).
 */
const Skills = ({ section, index }) => {
  const { skills } = useContent();
  if (!skills.length) return null;
  const capabilities = skills.filter((group) => group.kind === "supply-chain");
  const toolkit = skills.filter((group) => group.kind !== "supply-chain");

  return (
    <section id="skills" aria-labelledby="skills-title" className="section-y border-t border-line">
      <div className="container-site">
        <SectionHeader section={section} index={index} id="skills-title" />

        {capabilities.length > 0 && (
          <div className="mt-12 md:mt-16">
            <h3 className="eyebrow">Supply chain capabilities</h3>
            <ul className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {capabilities.map((group, position) => {
                const Icon = getIcon(group.icon);
                return (
                  <Reveal as="li" key={group.id} delay={(position % 4) * 0.04} className="card flex flex-col p-6">
                    <span className="grid h-11 w-11 place-items-center rounded-xl bg-accent/10 text-accent">
                      <Icon aria-hidden="true" className="h-5 w-5" />
                    </span>
                    <h4 className="title-card mt-5">{group.title}</h4>
                    <ul className="mt-4 space-y-2">
                      {group.items.map((item) => (
                        <li key={item} className="flex gap-2.5 text-[0.9375rem] leading-snug text-body">
                          <LuCheck aria-hidden="true" className="mt-[0.2em] h-4 w-4 shrink-0 text-heading/60" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </Reveal>
                );
              })}
            </ul>
          </div>
        )}

        {toolkit.length > 0 && (
          <Reveal className="mt-14 md:mt-16">
            <h3 className="eyebrow">Technical toolkit</h3>
            <dl className="mt-5 border-t border-line">
              {toolkit.map((group) => {
                const Icon = getIcon(group.icon);
                return (
                  <div key={group.id} className="grid gap-3 border-b border-line py-5 md:grid-cols-[15rem_1fr] md:gap-8">
                    <dt className="flex items-center gap-3 font-semibold text-heading">
                      <Icon aria-hidden="true" className="h-[1.125rem] w-[1.125rem] text-muted" />
                      {group.title}
                    </dt>
                    <dd>
                      <ul className="flex flex-wrap gap-1.5">
                        {group.items.map((item) => (
                          <li key={item} className="chip chip-sm">
                            {item}
                          </li>
                        ))}
                      </ul>
                    </dd>
                  </div>
                );
              })}
            </dl>
          </Reveal>
        )}
      </div>
    </section>
  );
};

export default Skills;
