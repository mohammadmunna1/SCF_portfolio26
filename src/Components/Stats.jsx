import { useContent } from "../context/ContentContext";
import CountUp from "./ui/CountUp";
import Reveal from "./ui/Reveal";

/**
 * Key numbers in large light numerals, counting up into view (reference: about page stats).
 * Desktop: one row from the container's left edge to its right edge, equal gaps between the stats,
 * each label on a single line. Below that: an even 2 × 2 grid, numbers and labels on shared lines —
 * centred in their columns on phones.
 */
const Stats = ({ section }) => {
  const { stats } = useContent();
  if (!stats.length) return null;

  return (
    <section id="stats" aria-labelledby="stats-title" className="pb-24 md:pb-32">
      <h2 id="stats-title" className="sr-only">
        {section.title || "Highlights"}
      </h2>
      <div className="container-site">
        <dl className="grid grid-cols-2 gap-x-6 gap-y-12 sm:gap-x-10 lg:flex lg:justify-between lg:gap-x-12">
          {stats.map((stat, index) => (
            <Reveal key={stat.id} delay={index * 0.06} className="flex min-w-0 flex-col max-md:items-center max-md:text-center">
              {/* No width cap: a label only breaks (into balanced lines) when its column is too narrow, as on phones */}
              <dt className="caps order-2 mt-3 text-balance">{stat.label}</dt>
              <dd className="order-1 text-[clamp(3.75rem,8vw,7rem)] font-extralight leading-none tracking-[-0.03em] text-heading">
                <CountUp value={stat.value} affixClassName="text-muted" />
              </dd>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
};

export default Stats;
