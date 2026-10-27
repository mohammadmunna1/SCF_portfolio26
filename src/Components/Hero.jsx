import { motion } from "framer-motion";
import { LuArrowRight, LuDownload } from "react-icons/lu";
import { useContent } from "../context/ContentContext";
import { resolveAsset } from "../lib/api";
import { EASE_OUT } from "../lib/motion";
import { cvLinkProps } from "../lib/text";
import SupplyJourney from "./illustrations/SupplyJourney";
import { Button } from "./ui/Buttons";

const appear = (delay) => ({
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: EASE_OUT, delay },
});

/** "Spectrum Software & Consulting (Pvt.) Ltd." → "Spectrum Software & Consulting" */
const shortCompany = (company = "") => company.replace(/\s*\((?:pvt\.?|private)\)\s*ltd\.?$|\s+(?:pvt\.?\s+)?ltd\.?$/i, "");

/** "Postgraduate Diploma (PGD) in Logistics & …" → "PGD · Logistics & …"; other names as they are. */
const compactDegree = (degree = "") => {
  const match = degree.match(/\(([A-Z]{2,6})\)\s+in\s+(.+)$/);
  return match ? `${match[1]} · ${match[2]}` : degree;
};

/** "Academy of Business Professionals (ABP)" → "ABP" */
const shortName = (name = "") => name.match(/\(([A-Z]{2,8})\)\s*$/)?.[1] || name;

/**
 * A small card pinned to the portrait — like a label on a parcel — with a status line, a title and a note.
 * Compact until wide screens (where `extra` is added to the note), so it never hides a stop of the ring.
 */
function PortraitLabel({ status, title, note, extra, accent = false, className = "" }) {
  return (
    <div className={`absolute w-[min(16rem,54%)] rounded-xl border border-line bg-surface-raised/95 p-2.5 shadow-lg backdrop-blur xl:p-3.5 ${className}`}>
      <p className="eyebrow flex items-center gap-2 text-[0.625rem] xl:text-[0.6875rem]">
        <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${accent ? "bg-accent" : "bg-heading/40"}`} />
        {status}
      </p>
      <p className="mt-1 text-[0.8125rem] font-semibold leading-snug text-heading xl:mt-1.5 xl:text-[0.875rem]">{title}</p>
      {note && (
        <p className="mt-0.5 text-[0.75rem] leading-snug text-body xl:text-[0.8125rem]">
          {note}
          {extra && <span className="hidden xl:inline"> · {extra}</span>}
        </p>
      )}
    </div>
  );
}

/**
 * The portrait inside the field-to-consumer ring, with the current role and the degree in progress pinned
 * to it. The bottom margin leaves room for the ring's caption.
 */
function HeroVisual({ profile, current, studying }) {
  return (
    <div className="relative mx-auto mb-12 aspect-[5/6] w-full max-w-[25rem] lg:max-w-[28rem]">
      <SupplyJourney />
      <div className="absolute inset-x-[14%] bottom-[10%] top-[6.7%] overflow-hidden rounded-[1.75rem] bg-photo">
        <div aria-hidden="true" className="dot-grid absolute inset-0 opacity-60" />
        {profile.portrait && (
          <img
            src={resolveAsset(profile.portrait)}
            alt={profile.name}
            // The largest image on the first screen, so it's fetched ahead of everything else.
            // eslint-disable-next-line react/no-unknown-property -- React 18 has no fetchPriority prop; the attribute passes through as is
            fetchpriority="high"
            decoding="async"
            className="absolute inset-x-0 bottom-0 h-[96%] w-full object-cover object-[50%_0%]"
          />
        )}
      </div>
      {studying && (
        <PortraitLabel
          status="In progress"
          title={compactDegree(studying.degree)}
          note={shortName(studying.institution)}
          className="right-0 top-[2%] sm:-right-[4%]"
        />
      )}
      {current && (
        <PortraitLabel
          status="Now"
          accent
          title={current.role}
          note={shortCompany(current.company)}
          extra={current.tags?.[0]}
          className="bottom-[17%] left-0 sm:-left-[4%]"
        />
      )}
    </div>
  );
}

/**
 * Who and what at a glance: the positioning headline, a short introduction, the main actions and the
 * portrait — the first screen of the page, with the start of the journey sketched behind it (see
 * JourneyBackdrop).
 */
const Hero = () => {
  const { profile, experience, education } = useContent();
  const headline = profile.headline || profile.role || profile.name;
  const current = experience.find((job) => job.current);
  const studying = education.find((item) => item.status === "ongoing");

  return (
    <section id="home" aria-labelledby="hero-title" className="relative min-h-[100svh] overflow-hidden">
      <div className="container-site relative grid items-center gap-14 pb-16 pt-28 md:pb-20 md:pt-36 lg:grid-cols-12 lg:gap-10 lg:pt-40">
        <div className="lg:col-span-7">
          {profile.availableForWork && profile.availability && (
            <motion.p
              {...appear(0)}
              className="inline-flex items-center gap-2.5 rounded-full border border-line bg-surface-raised px-3.5 py-1.5 text-[0.8125rem] font-medium text-heading"
            >
              <span aria-hidden="true" className="h-2 w-2 rounded-full bg-accent" />
              {profile.availability}
            </motion.p>
          )}
          {profile.role && (
            <motion.p {...appear(0.05)} className="eyebrow mt-8">
              {profile.role}
            </motion.p>
          )}
          <motion.h1 {...appear(0.1)} id="hero-title" className="display mt-4 max-w-[16ch] text-display-hero">
            <span className="sr-only">{profile.name} — </span>
            {headline}
          </motion.h1>
          {profile.heroIntro && (
            <motion.p {...appear(0.2)} className="mt-6 max-w-[38rem] text-lead text-body">
              {profile.heroIntro}
            </motion.p>
          )}

          <motion.div {...appear(0.3)} className="mt-9 flex flex-wrap items-center gap-3">
            <Button href="#work" variant="primary" icon={LuArrowRight}>
              Explore my projects
            </Button>
            {/* Page-coloured rather than see-through, so the sketch behind never runs through the label */}
            <Button href="#about" variant="outline" className="bg-canvas">
              View my background
            </Button>
            {profile.resumeUrl && (
              <Button href={profile.resumeUrl} variant="quiet" leadingIcon={LuDownload} {...cvLinkProps(profile.resumeUrl)}>
                Download CV
              </Button>
            )}
          </motion.div>
        </div>

        <motion.div {...appear(0.15)} className="lg:col-span-5">
          <HeroVisual profile={profile} current={current} studying={studying} />
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
