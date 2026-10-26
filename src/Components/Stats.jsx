import { useContent } from "../context/ContentContext";
import Reveal from "./ui/Reveal";

/**
 * Key figures as a ruled strip under the hero, read like the fields of a manifest: four across on large
 * screens, two by two below that. Static numbers — nothing counts up.
 */
const Stats = ({ section }) => {
  const { stats } = useContent();
  if (!stats.length) return null;

  return (
    <section id="stats" aria-labelledby="stats-title" className="pb-16 md:pb-24">
      <h2 id="stats-title" className="sr-only">
        {section.title || "At a glance"}
      </h2>
      <div className="container-site">
        <Reveal as="dl" className="grid grid-cols-2 border-y border-line lg:auto-cols-fr lg:grid-flow-col lg:grid-cols-none">
          {stats.map((stat, index) => (
            <div
              key={stat.id}
              className={`flex flex-col gap-2 py-6 md:py-8 ${index % 2 ? "pl-5 sm:pl-8" : "pr-5"} ${
                index >= 2 ? "max-lg:border-t max-lg:border-line" : ""
              } ${index > 0 ? "lg:border-l lg:border-line lg:pl-8" : "lg:pl-0"} lg:pr-6`}
            >
              <dt className="order-2 text-[0.875rem] leading-snug text-body">{stat.label}</dt>
              <dd className="order-1 text-[2rem] font-semibold leading-none tracking-[-0.03em] text-heading md:text-[2.5rem]">
                {stat.value}
              </dd>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
};

export default Stats;
