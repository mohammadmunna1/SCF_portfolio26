import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { LuArrowUpRight, LuMaximize2 } from "react-icons/lu";
import { useContent } from "../context/ContentContext";
import { resolveAsset } from "../lib/api";
import { getIcon } from "../lib/icons";
import { Button } from "./ui/Buttons";
import FilterTabs from "./ui/FilterTabs";
import Modal from "./ui/Modal";
import Reveal from "./ui/Reveal";
import SectionHeader from "./ui/SectionHeader";
import StatusBadge from "./ui/StatusBadge";

// Supply chain training leads; any other category follows under "Other".
const GROUPS = [
  { key: "supply-chain", label: "Supply chain & ERP" },
  { key: "technology", label: "Technology & quality" },
  { key: "professional", label: "Professional skills" },
];
const groupOf = (course) => (GROUPS.some((group) => group.key === course.category) ? course.category : "other");
const groupLabel = (key) => GROUPS.find((group) => group.key === key)?.label || "Other";

/** "Jan 2025 · Online · 80 hours" — when, how and a short detail (a course in progress shows when it began). */
function detailsOf(course) {
  const prefix = { ongoing: "Since ", planned: "From " }[course.status] || "";
  return [course.issued && `${prefix}${course.issued}`, course.mode, course.note].filter(Boolean).join(" · ");
}

/** A provider logo on its white tile (logos are drawn for white backgrounds, in dark palettes too). */
function ProviderLogo({ src, name, size = "sm" }) {
  return (
    <span className={`logo-tile shrink-0 ${size === "lg" ? "h-24 w-[min(13rem,70%)] p-5" : "h-7 px-2"}`}>
      <img
        src={resolveAsset(src)}
        alt={name ? `${name} logo` : ""}
        loading="lazy"
        decoding="async"
        className={`object-contain ${size === "lg" ? "max-h-full max-w-full" : "max-h-4 max-w-[4.5rem]"}`}
      />
    </span>
  );
}

/**
 * The course's picture in a fixed 4:3 frame, so every card lines up: the certificate or official course
 * image shown whole (it opens larger), else the provider's logo, else the course's icon.
 */
function CourseFrame({ course, onExpand }) {
  const Icon = getIcon(course.icon);
  return (
    <div className="relative aspect-[4/3] overflow-hidden border-b border-line bg-surface">
      <div aria-hidden="true" className="dot-grid absolute inset-0 opacity-60" />
      {course.image ? (
        <button
          type="button"
          onClick={onExpand}
          className="group/frame absolute inset-4 grid place-items-center rounded-md"
        >
          <img
            src={resolveAsset(course.image)}
            alt={`${course.title} — ${course.status === "completed" ? "certificate" : "course image"}`}
            loading="lazy"
            decoding="async"
            className="max-h-full max-w-full rounded-[3px] bg-white object-contain shadow-[0_6px_18px_-6px_rgb(0_0_0/0.28)] ring-1 ring-black/5 transition-transform duration-300 group-hover/frame:-translate-y-0.5"
          />
          <span className="absolute bottom-0 right-0 grid h-8 w-8 place-items-center rounded-full border border-line bg-surface-raised text-heading opacity-0 shadow-sm transition-opacity duration-200 group-hover/frame:opacity-100 group-focus-visible/frame:opacity-100">
            <LuMaximize2 aria-hidden="true" className="h-3.5 w-3.5" />
          </span>
          <span className="sr-only">View {course.title} larger</span>
        </button>
      ) : (
        <div className="absolute inset-4 grid place-items-center">
          {course.logo ? (
            <ProviderLogo src={course.logo} name={course.issuer} size="lg" />
          ) : (
            <span aria-hidden="true" className="grid h-16 w-16 place-items-center rounded-2xl border border-line bg-surface-raised text-heading">
              <Icon className="h-7 w-7" />
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function CourseCard({ course, onExpand }) {
  const details = detailsOf(course);
  return (
    <article className="card flex h-full flex-col overflow-hidden">
      <CourseFrame course={course} onExpand={onExpand} />
      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="eyebrow text-[0.6875rem]">{groupLabel(groupOf(course))}</p>
          <StatusBadge status={course.status} />
        </div>
        <h3 className="title-card mt-3">{course.title}</h3>
        {course.issuer && (
          <div className="mt-3 flex min-w-0 items-center gap-2.5">
            {course.logo && course.image && <ProviderLogo src={course.logo} name={course.issuer} />}
            <p className="min-w-0 text-[0.875rem] font-medium leading-snug text-body">{course.issuer}</p>
          </div>
        )}
        {details && <p className="mt-2 text-[0.8125rem] text-muted">{details}</p>}
        {course.url && (
          <a href={course.url} target="_blank" rel="noopener noreferrer" className="link mt-auto self-start pt-4 text-[0.875rem] font-medium text-heading">
            {course.urlLabel || "View certificate"}
            <LuArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" />
            <span className="sr-only">: {course.title} (opens in a new tab)</span>
          </a>
        )}
      </div>
    </article>
  );
}

/** The certificate or course image at full size, with what it is and a link to the original. */
function CourseLightbox({ course, open, onClose }) {
  return (
    <Modal open={open} onClose={onClose} labelledBy="course-lightbox-title" className="max-w-4xl">
      {course && (
        <figure>
          <div className="dot-grid grid place-items-center border-b border-line bg-surface px-4 pb-6 pt-14 sm:px-10">
            <img
              src={resolveAsset(course.image)}
              alt={`${course.title} — ${course.status === "completed" ? "certificate" : "course image"}`}
              className="max-h-[68svh] w-auto max-w-full rounded-[3px] bg-white object-contain shadow-[0_10px_30px_-10px_rgb(0_0_0/0.35)] ring-1 ring-black/5"
            />
          </div>
          <figcaption className="flex flex-wrap items-center justify-between gap-4 px-6 py-5 sm:px-10">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <StatusBadge status={course.status} />
                {course.issuer && <span className="text-[0.875rem] font-medium text-body">{course.issuer}</span>}
              </div>
              <h2 id="course-lightbox-title" className="title-item mt-2">
                {course.title}
              </h2>
              {detailsOf(course) && <p className="mt-1 text-[0.875rem] text-muted">{detailsOf(course)}</p>}
            </div>
            {course.url && (
              <Button href={course.url} size="sm" variant="primary" icon={LuArrowUpRight}>
                {course.urlLabel || "View certificate"}
              </Button>
            )}
          </figcaption>
        </figure>
      )}
    </Modal>
  );
}

/**
 * Courses & certifications, each with its own image — the certificate, the official course image or the
 * provider's logo — its status, provider and date. Supply chain training comes first; the tabs narrow the
 * grid to one group.
 */
const Courses = ({ section, index }) => {
  const { certifications } = useContent();
  const [filter, setFilter] = useState("all");
  const [expanded, setExpanded] = useState({ course: null, open: false });
  if (!certifications.length) return null;

  const order = [...GROUPS.map((group) => group.key), "other"];
  const courses = [...certifications].sort((a, b) => order.indexOf(groupOf(a)) - order.indexOf(groupOf(b)));
  const present = order.filter((key) => courses.some((course) => groupOf(course) === key));
  const tabs = [
    { key: "all", label: "All", count: courses.length },
    ...present.map((key) => ({ key, label: groupLabel(key), count: courses.filter((course) => groupOf(course) === key).length })),
  ];
  const shown = filter === "all" ? courses : courses.filter((course) => groupOf(course) === filter);

  return (
    <section id="courses" aria-labelledby="courses-title" className="section-y">
      <div className="container-site">
        <SectionHeader section={section} index={index} id="courses-title" />
        {present.length > 1 && (
          <Reveal className="mt-10">
            <FilterTabs items={tabs} value={filter} onChange={setFilter} label="Filter courses by group" layoutId="courses-filter" />
          </Reveal>
        )}

        <AnimatePresence mode="wait" initial={false}>
          <motion.ul
            key={filter}
            className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            {shown.map((course) => (
              <li key={course.id} className="min-w-0">
                <CourseCard course={course} onExpand={() => setExpanded({ course, open: true })} />
              </li>
            ))}
          </motion.ul>
        </AnimatePresence>
      </div>
      <CourseLightbox
        course={expanded.course}
        open={expanded.open}
        onClose={() => setExpanded((current) => ({ ...current, open: false }))}
      />
    </section>
  );
};

export default Courses;
