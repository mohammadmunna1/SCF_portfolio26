import { motion } from "framer-motion";
import { LuArrowDown, LuArrowUpRight } from "react-icons/lu";
import { useContent } from "../context/ContentContext";
import { resolveAsset } from "../lib/api";
import { EASE_OUT } from "../lib/motion";
import { MaskText } from "./ui/AnimatedText";
import { Button, NodesIcon } from "./ui/Buttons";

const appear = (delay, y = 16) => ({
  initial: { opacity: 0, y },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: EASE_OUT, delay },
});

/** "Spectrum Software & Consulting (Pvt.) Ltd. (SSCL)" → "SSCL" */
const shortCompany = (company = "") => company.match(/\(([^()]+)\)\s*$/)?.[1] || company;

/**
 * The single portrait on the site: a pill-shaped photo card set between the headline's words.
 * It is exactly as tall as the capitals and rests on their baseline (see .hero-capsule).
 */
function Portrait({ src, name }) {
  return (
    <motion.span
      className="hero-capsule relative inline-block shrink-0 overflow-hidden rounded-full bg-photo"
      initial={{ clipPath: "inset(50% 0% 50% 0% round 999px)" }}
      animate={{ clipPath: "inset(0% 0% 0% 0% round 999px)" }}
      transition={{ duration: 1.1, ease: EASE_OUT, delay: 0.35 }}
    >
      <img
        src={resolveAsset(src)}
        alt={name}
        // The largest image on the first screen, so it's fetched ahead of everything else.
        // eslint-disable-next-line react/no-unknown-property -- React 18 has no fetchPriority prop; the attribute passes through as is
        fetchpriority="high"
        decoding="async"
        className="absolute inset-x-0 bottom-0 h-[94%] w-full object-cover object-[46%_0%]"
      />
    </motion.span>
  );
}

/** Oversized headline with the portrait, a short introduction and the main call to action. */
const Hero = () => {
  const { profile, socials, experience } = useContent();
  const headline = profile.headline || profile.role || profile.name;
  const [firstWord, ...otherWords] = headline.split(/\s+/);
  const current = experience.find((job) => job.current);
  const links = [
    profile.resumeUrl && { label: "Resume", href: profile.resumeUrl },
    ...socials.filter((social) => social.showInHero).map((social) => ({ label: social.label, href: social.url })),
  ].filter(Boolean);

  return (
    <section id="home" aria-labelledby="hero-title" className="relative flex min-h-[100svh] flex-col">
      <div className="container-site flex flex-1 flex-col items-center justify-center pb-24 pt-32 text-center md:pb-28 md:pt-36">
        <h1 id="hero-title" className="display text-[40vw] leading-[0.72] sm:text-display-hero">
          <span className="sr-only">{`${profile.name} — ${headline}`}</span>
          <span aria-hidden="true" className="flex flex-wrap items-baseline justify-center gap-x-[0.07em] gap-y-[0.06em]">
            <MaskText text={firstWord} immediate delay={0.15} />
            {profile.portrait && <Portrait src={profile.portrait} name={profile.name} />}
            {otherWords.length > 0 && <MaskText text={otherWords.join(" ")} immediate delay={0.25} />}
          </span>
        </h1>

        {profile.heroIntro && (
          <motion.p {...appear(0.7)} className="mt-10 max-w-[33rem] uppercase md:mt-12">
            {profile.heroIntro}
          </motion.p>
        )}

        <motion.div {...appear(0.85)} className="mt-9 flex flex-col items-center gap-6 md:mt-10">
          <Button href="#contact" leadingIcon={NodesIcon}>
            {profile.ctaButtonLabel || "Get in touch"}
          </Button>
          {links.length > 0 && (
            <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2">
              {links.map((link) => (
                <li key={link.label}>
                  <a href={link.href} target="_blank" rel="noopener noreferrer" className="caps link text-heading">
                    {link.label}
                    <LuArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" />
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </motion.div>
      </div>

      <motion.div
        {...appear(1.1, 0)}
        className="container-site absolute inset-x-0 bottom-6 flex items-end justify-between gap-6 md:bottom-9"
      >
        <p className="caps flex items-center gap-2.5">
          {profile.availableForWork && (
            <>
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-accent" />
              Available for work
            </>
          )}
        </p>
        {current && (
          <a href="#experience" className="caps link text-right">
            Currently at {shortCompany(current.company)}
            <LuArrowDown aria-hidden="true" className="h-3.5 w-3.5" />
          </a>
        )}
      </motion.div>
    </section>
  );
};

export default Hero;
