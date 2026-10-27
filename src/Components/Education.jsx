import { useContent } from "../context/ContentContext";
import Reveal from "./ui/Reveal";
import SectionHeader from "./ui/SectionHeader";
import StatusBadge from "./ui/StatusBadge";

// The first entries (the degrees) are shown as cards; school results below them as compact rows.
const FEATURED = 2;

function DegreeCard({ item }) {
  const facts = [
    [item.status === "ongoing" ? "Stage" : "Result", item.grade],
    ["Thesis", item.thesis],
  ].filter(([, value]) => value);

  return (
    <Reveal as="li" className="card flex flex-col p-6 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="meta text-muted">{item.period}</p>
        <StatusBadge status={item.status} />
      </div>
      <h3 className="title-item mt-5">{item.degree}</h3>
      <p className="mt-1.5 text-[0.9375rem] font-medium text-body">{item.institution}</p>
      {facts.length > 0 && (
        <dl className="mt-6 grid gap-x-8 gap-y-4 border-t border-line pt-5 sm:grid-cols-2">
          {facts.map(([label, value]) => (
            <div key={label}>
              <dt className="eyebrow text-[0.6875rem]">{label}</dt>
              <dd className="mt-1 text-[0.9375rem] font-medium text-heading">{value}</dd>
            </div>
          ))}
        </dl>
      )}
      {item.details && <p className="copy-card mt-4">{item.details}</p>}
    </Reveal>
  );
}

function SchoolRow({ item }) {
  return (
    <li className="grid gap-x-6 gap-y-1 border-b border-line py-4 sm:grid-cols-[1fr_auto] md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_auto_auto] md:items-baseline">
      <p className="font-medium text-heading">{item.degree}</p>
      <p className="text-[0.9375rem] text-body md:order-none">{item.institution}</p>
      <p className="text-[0.9375rem] font-medium text-heading md:text-right">{item.grade}</p>
      <p className="meta text-muted md:w-16 md:text-right">{item.period}</p>
    </li>
  );
}

/** Degrees (the one in progress clearly marked), school results and activities. */
const Education = ({ section, index }) => {
  const { education, achievements } = useContent();
  if (!education.length && !achievements.length) return null;
  const degrees = education.slice(0, FEATURED);
  const schools = education.slice(FEATURED);

  return (
    <section id="education" aria-labelledby="education-title" className="section-y">
      <div className="container-site">
        <SectionHeader section={section} index={index} id="education-title" />

        {degrees.length > 0 && (
          <ol className="mt-12 grid gap-5 md:mt-16 lg:grid-cols-2">
            {degrees.map((item) => (
              <DegreeCard key={item.id} item={item} />
            ))}
          </ol>
        )}

        {schools.length > 0 && (
          <Reveal as="ol" className="mt-8 border-t border-line">
            {schools.map((item) => (
              <SchoolRow key={item.id} item={item} />
            ))}
          </Reveal>
        )}

        {achievements.length > 0 && (
          <Reveal className="mt-16 md:mt-20">
            <h3 className="eyebrow">Activities &amp; accomplishments</h3>
            <ul className="mt-5 grid gap-x-10 gap-y-6 md:grid-cols-3">
              {achievements.map((item) => (
                <li key={item.id} className="border-t border-line-strong pt-4">
                  <p className="meta text-muted">{item.period}</p>
                  <p className="mt-2 font-semibold text-heading">
                    {item.role} <span className="font-normal text-body">· {item.organization}</span>
                  </p>
                  {item.description && <p className="copy-card mt-1.5">{item.description}</p>}
                </li>
              ))}
            </ul>
          </Reveal>
        )}
      </div>
    </section>
  );
};

export default Education;
