import { useContent } from "../context/ContentContext";
import { resolveAsset } from "../lib/api";
import Marquee from "./ui/Marquee";
import SectionHeader from "./ui/SectionHeader";

const initials = (name = "") =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

function TestimonialCard({ item }) {
  const rating = Math.max(0, Math.min(5, Math.round(Number(item.rating) || 0)));
  return (
    <figure className="card flex h-full w-[300px] flex-col p-7 md:w-[420px] md:p-9">
      <blockquote className="copy flex-1 text-heading">“{item.quote}”</blockquote>
      <figcaption className="mt-8 flex items-center gap-4">
        {item.avatar ? (
          <img src={resolveAsset(item.avatar)} alt="" loading="lazy" className="h-12 w-12 rounded-full bg-photo object-cover" />
        ) : (
          <span aria-hidden="true" className="grid h-12 w-12 place-items-center rounded-full bg-canvas text-sm text-heading">
            {initials(item.name)}
          </span>
        )}
        <span>
          <span className="block font-normal text-heading">{item.name}</span>
          {item.role && <span className="block text-sm">{item.role}</span>}
          {rating > 0 && <span className="meta mt-1 block text-accent">Rated {rating} / 5</span>}
        </span>
      </figcaption>
    </figure>
  );
}

/** Rendered only when testimonials exist — add them from the admin panel. */
const Testimonials = ({ section, index }) => {
  const { testimonials } = useContent();
  if (!testimonials.length) return null;

  return (
    <section id="testimonials" aria-labelledby="testimonials-title" className="section-y border-t border-line">
      <div className="container-site">
        <SectionHeader section={section} index={index} id="testimonials-title" />
      </div>
      <div className="mt-14 md:mt-20">
        <Marquee
          label={section.title}
          items={testimonials}
          duration={70}
          gap={20}
          minItems={6}
          renderItem={(item) => <TestimonialCard item={item} />}
        />
      </div>
    </section>
  );
};

export default Testimonials;
