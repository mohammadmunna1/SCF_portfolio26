import { LuArrowUpRight } from "react-icons/lu";
import { useContent } from "../context/ContentContext";
import Reveal from "./ui/Reveal";
import RollText from "./ui/RollText";
import SectionHeader, { DisplayTitle } from "./ui/SectionHeader";

const number = (index) => `${String(index + 1).padStart(2, "0")}.`;

function Degree({ item }) {
  const facts = [
    ["Result", item.grade],
    ["Thesis", item.thesis],
  ].filter(([, value]) => value);

  return (
    <Reveal as="li" className="grid gap-6 border-t border-line-strong/60 py-10 md:grid-cols-12 md:gap-8 md:py-12">
      <div className="md:col-span-4 lg:col-span-3">
        <p className="meta text-heading">{item.period}</p>
        <p className="mt-2 max-w-[32ch] text-[0.9375rem] font-light leading-relaxed text-body">{item.institution}</p>
      </div>
      <div className="md:col-span-8 lg:col-span-9">
        <h3 className="title-item">{item.degree}</h3>
        {facts.length > 0 && (
          <dl className="mt-6 grid gap-x-10 gap-y-5 sm:grid-cols-2">
            {facts.map(([label, value]) => (
              <div key={label}>
                <dt className="meta text-muted">{label}</dt>
                <dd className="mt-1.5 text-[1.0625rem] font-light text-heading">{value}</dd>
              </div>
            ))}
          </dl>
        )}
        {item.details && <p className="copy mt-5 max-w-3xl">{item.details}</p>}
      </div>
    </Reveal>
  );
}

/**
 * Reference-style numbered list under its own display heading ("— Certifications"), set like every
 * section title. Each row: number and title on the left, a label on the right, a rule beneath; hovering
 * fills the row from the bottom while the title rolls up.
 */
function NumberedList({ id, title, children }) {
  return (
    <div className="min-w-0">
      <DisplayTitle as="h3" id={id} text={title} />
      <Reveal as="ol" className="mt-10 md:mt-14">
        {children}
      </Reveal>
    </div>
  );
}

function Row({ index, title, detail, meta, href }) {
  const body = (
    <>
      <span aria-hidden="true" className="hover-fill-soft w-7 shrink-0 text-[13px] text-muted">
        {number(index)}
      </span>
      <span className="min-w-0 flex-1">
        <RollText className="hover-fill-ink grid text-[15px] uppercase text-heading">{title}</RollText>
        {detail && <span className="hover-fill-ink mt-1.5 block text-[0.9375rem] font-light leading-relaxed">{detail}</span>}
      </span>
      {(meta || href) && (
        <span className="caps hover-fill-ink flex shrink-0 items-center gap-1.5 text-right text-body">
          {meta}
          {href && (
            <>
              <LuArrowUpRight aria-hidden="true" className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              <span className="sr-only">(view certificate, opens in a new tab)</span>
            </>
          )}
        </span>
      )}
    </>
  );
  const className = "hover-fill roll-host flex items-baseline gap-4 border-b border-line-strong/60 px-3 py-4";
  return (
    <li>
      {href ? (
        <a href={href} target="_blank" rel="noopener noreferrer" className={`group ${className}`}>
          {body}
        </a>
      ) : (
        <div className={className}>{body}</div>
      )}
    </li>
  );
}

/** Degree, certifications and achievements. */
const Education = ({ section }) => {
  const { education, certifications, achievements } = useContent();
  if (!education.length && !certifications.length && !achievements.length) return null;

  return (
    <section id="education" aria-labelledby="education-title" className="section-y">
      <div className="container-site">
        <SectionHeader section={section} id="education-title" />

        {education.length > 0 && (
          <ol className="mt-14 md:mt-20">
            {education.map((item) => (
              <Degree key={item.id} item={item} />
            ))}
          </ol>
        )}

        {(certifications.length > 0 || achievements.length > 0) && (
          <div className="mt-20 grid gap-20 md:mt-28 md:gap-24 lg:grid-cols-2 lg:gap-12 xl:gap-20">
            {certifications.length > 0 && (
              <NumberedList id="certifications-title" title="Certifications">
                {certifications.map((item, index) => (
                  <Row key={item.id} index={index} title={item.title} meta={[item.issuer, item.issued].filter(Boolean).join(" · ")} href={item.url} />
                ))}
              </NumberedList>
            )}
            {achievements.length > 0 && (
              <NumberedList id="achievements-title" title="Achievements">
                {achievements.map((item, index) => (
                  <Row
                    key={item.id}
                    index={index}
                    title={`${item.role} — ${item.organization}`}
                    detail={item.description}
                    meta={item.period}
                  />
                ))}
              </NumberedList>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default Education;
