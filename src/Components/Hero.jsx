import { motion } from "framer-motion";
import { LuArrowRight, LuArrowUpRight, LuDownload } from "react-icons/lu";
import { useContent } from "../context/ContentContext";
import { EASE_OUT } from "../lib/motion";
import { cvLinkProps } from "../lib/text";
import { Button } from "./ui/Buttons";

const appear = (delay) => ({
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: EASE_OUT, delay },
});

/**
 * Who and what at a glance: the positioning headline, a short introduction and the main actions. The first
 * screen of the page, with the start of the journey sketched behind it (see JourneyBackdrop).
 */
const Hero = () => {
  const { profile, socials } = useContent();
  const headline = profile.headline || profile.role || profile.name;
  const links = socials.filter((social) => social.showInHero);

  return (
    <section id="home" aria-labelledby="hero-title" className="relative min-h-[100svh]">
      <div className="container-site pb-28 pt-28 md:pt-36 lg:pt-40">
        <div className="max-w-[44rem]">
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
            {/* Page-coloured rather than see-through (like the links below), so the sketch behind never runs
                through the label */}
            <Button href="#about" variant="outline" className="bg-canvas">
              View my background
            </Button>
            {profile.resumeUrl && (
              <Button href={profile.resumeUrl} variant="quiet" leadingIcon={LuDownload} {...cvLinkProps(profile.resumeUrl)}>
                Download CV
              </Button>
            )}
          </motion.div>

          {links.length > 0 && (
            <motion.ul {...appear(0.4)} className="mt-8 flex flex-wrap gap-x-6 gap-y-2">
              {links.map((link) => (
                <li key={link.id}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link bg-canvas text-[0.9375rem] font-medium text-heading"
                  >
                    {link.label}
                    <LuArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" />
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </li>
              ))}
            </motion.ul>
          )}
        </div>
      </div>
    </section>
  );
};

export default Hero;
