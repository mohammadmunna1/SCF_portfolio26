import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { Component, lazy, Suspense, useEffect, useRef, useState } from "react";
import { LuArrowDown, LuArrowRight, LuArrowUpRight, LuDownload } from "react-icons/lu";
import { useContent } from "../context/ContentContext";
import { EASE_OUT } from "../lib/motion";
import { cvLinkProps, twoDigits } from "../lib/text";
import { createOverlay } from "./journey/overlay";
import { CLOSING, STAGES, stillAt } from "./journey/stages";
import { Button } from "./ui/Buttons";

// The illustrated world and its choreography come in their own chunk, requested as soon as this module
// loads, so the first screen (sky, text and buttons) never waits for them.
const sceneRequest = import("./journey/JourneyScene");
sceneRequest.catch(() => {}); // handled by SceneBoundary when it renders
const JourneyScene = lazy(() => sceneRequest);

// Scroll is smoothed with a spring, so the journey glides to a stop instead of following each wheel notch.
const SMOOTHING = { stiffness: 150, damping: 30, mass: 0.55, restDelta: 0.00002 };

const appear = (delay) => ({
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: EASE_OUT, delay },
});

/** If the world can't load (offline mid-visit), the hero stays a single, still screen. */
class SceneBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    this.props.onFail();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

// A fixed field of stars for the night sky (positions in %, deterministic).
const STARS = Array.from({ length: 70 }, (_, i) => {
  const a = Math.sin(i * 127.1) * 43758.5453;
  const b = Math.sin(i * 311.7) * 24634.6345;
  return { x: (a - Math.floor(a)) * 100, y: (b - Math.floor(b)) * 62, r: i % 9 === 0 ? 1.4 : 0.8 };
});

/** The sky behind the world: dawn, day, golden hour, dusk and night, with the sun, moon and stars. */
function Sky() {
  return (
    <div aria-hidden="true" className="absolute inset-0">
      <div className="journey-sky journey-sky-dawn" />
      {["day", "golden", "dusk", "night"].map((key) => (
        <div key={key} data-o={`sky-${key}`} className={`journey-sky journey-sky-${key}`} style={{ opacity: 0 }} />
      ))}
      <svg data-o="stars" className="absolute inset-0 h-full w-full" style={{ opacity: 0 }}>
        {STARS.map((star) => (
          <circle key={`${star.x} ${star.y}`} cx={`${star.x}%`} cy={`${star.y}%`} r={star.r} fill="#F4F1EA" />
        ))}
      </svg>
      <div data-o="moon" className="journey-moon" style={{ opacity: 0 }} />
      <div data-o="sun" className="journey-sun" />
    </div>
  );
}

/** The opening frame's text: who and what, the short introduction and the main actions. */
function HeroCopy({ profile, socials }) {
  const headline = profile.headline || profile.role || profile.name;
  const links = socials.filter((social) => social.showInHero);

  return (
    <div data-o="hero" className="journey-hero absolute inset-x-0 top-0">
      <div className="container-site">
        <div className="max-w-[42rem]">
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
            <motion.p {...appear(0.05)} className="eyebrow mt-5 text-body sm:mt-6">
              {profile.role}
            </motion.p>
          )}
          <motion.h1
            {...appear(0.1)}
            id="hero-title"
            className="display journey-headline journey-glow mt-3 max-w-[20ch]"
          >
            <span className="sr-only">{profile.name} — </span>
            {headline}
          </motion.h1>
          {profile.heroIntro && (
            <motion.p
              {...appear(0.2)}
              className="journey-intro journey-glow mt-4 line-clamp-3 max-w-[40rem] text-body sm:line-clamp-none"
            >
              {profile.heroIntro}
            </motion.p>
          )}
          <motion.div {...appear(0.3)} className="mt-6 flex flex-wrap items-center gap-2.5 sm:mt-7 sm:gap-3">
            <Button href="#work" variant="primary" icon={LuArrowRight}>
              Explore my projects
            </Button>
            <Button href="#about" variant="outline" className="bg-surface-raised/50">
              View my background
            </Button>
            {profile.resumeUrl && (
              <Button
                href={profile.resumeUrl}
                variant="quiet"
                leadingIcon={LuDownload}
                {...cvLinkProps(profile.resumeUrl)}
              >
                Download CV
              </Button>
            )}
          </motion.div>
          {links.length > 0 && (
            <motion.ul {...appear(0.4)} className="mt-5 flex flex-wrap gap-x-6 gap-y-2">
              {links.map((link) => (
                <li key={link.id}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link text-[0.9375rem] font-medium text-heading"
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
    </div>
  );
}

/** One stage's caption: number, title and a line of explanation. Decorative — the summary below is read instead. */
function Caption({ stage, index }) {
  return (
    <div
      data-caption={index}
      aria-hidden="true"
      className="journey-caption"
      style={{ opacity: 0, visibility: "hidden" }}
    >
      <p className="eyebrow flex items-center gap-3 text-body">
        <span className="text-accent">{twoDigits(index + 1)}</span>
        <span className="h-px w-8 bg-heading/30" />
        {stage.label}
      </p>
      <p className="display journey-glow mt-3 max-w-[18ch] text-display-lg">{stage.title}</p>
      <p className="journey-glow mt-3 max-w-[32rem] text-lead text-body">{stage.text}</p>
    </div>
  );
}

/**
 * The hero: a scroll-driven supply chain journey. The section is several screens tall and its stage sticks
 * to the viewport while the page scrolls through it, so the story plays as you scroll — forwards and back.
 * The opening frame carries the introduction; the controls jump between stages or skip past the journey.
 */
const Hero = () => {
  const { profile, socials } = useContent();
  const sectionRef = useRef(null);
  const stageRef = useRef(null);
  const endRef = useRef(null);
  const [failed, setFailed] = useState(false);
  const reduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  const smooth = useSpring(scrollYProgress, SMOOTHING);
  // With reduced motion the scene cuts from one still frame to the next instead of moving.
  const stepped = useTransform(scrollYProgress, stillAt);
  // Development only: ?journey=0.42 holds the journey at that point and window.__journey(p) moves it.
  const held = useMotionValue(0);
  const hold = import.meta.env.DEV ? new URLSearchParams(window.location.search).get("journey") : null;
  const progress = hold !== null ? held : reduceMotion ? stepped : smooth;

  useEffect(() => {
    if (hold === null) return undefined;
    held.set(Number(hold) || 0);
    window.__journey = (p) => held.set(p);
    return () => delete window.__journey;
  }, [hold, held]);

  useEffect(() => {
    const stage = stageRef.current;
    const overlay = createOverlay(stage);
    const paint = (value) => overlay.paint(value);
    paint(progress.get());
    const unsubscribe = progress.on("change", paint);
    const observer = new ResizeObserver(() => {
      overlay.measure();
      paint(progress.get());
    });
    observer.observe(stage);
    return () => {
      unsubscribe();
      observer.disconnect();
    };
  }, [progress]);

  /** Scrolls to the point `p` (0–1) of the journey. */
  const goTo = (p) => {
    const section = sectionRef.current;
    const top = section.getBoundingClientRect().top + window.scrollY;
    const range = section.offsetHeight - window.innerHeight;
    window.scrollTo({ top: top + range * p, behavior: reduceMotion ? "instant" : "smooth" });
  };

  const skip = (event) => {
    event.preventDefault();
    window.scrollTo({ top: endRef.current.getBoundingClientRect().top + window.scrollY, behavior: "instant" });
    endRef.current.focus({ preventScroll: true });
  };

  return (
    <>
      <section
        id="home"
        ref={sectionRef}
        aria-labelledby="hero-title"
        className="journey relative"
        data-static={failed || undefined}
      >
        <div ref={stageRef} className="journey-stage">
          <Sky />
          {!failed && (
            <SceneBoundary onFail={() => setFailed(true)}>
              <Suspense fallback={null}>
                <JourneyScene progress={progress} reduceMotion={reduceMotion} />
              </Suspense>
            </SceneBoundary>
          )}
          {/* Under the header, the page colour, so its links read on any palette until the page scrolls */}
          <div
            data-o="scrim"
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-canvas to-canvas/0"
          />

          <div data-o="ink" className="journey-ink absolute inset-0">
            <div data-o="veil" aria-hidden="true" className="journey-veil" />
            <HeroCopy profile={profile} socials={socials} />

            {!failed && (
              <>
                <div className="journey-captions pointer-events-none absolute inset-x-0 top-0">
                  <div className="container-site">
                    <div className="relative">
                      {STAGES.map((stage, index) => (
                        <Caption key={stage.key} stage={stage} index={index} />
                      ))}
                      <div
                        data-caption={STAGES.length}
                        className="journey-caption"
                        style={{ opacity: 0, visibility: "hidden" }}
                      >
                        <p className="eyebrow flex items-center gap-3 text-body">
                          <span aria-hidden="true" className="h-2 w-2 rounded-full bg-accent" />
                          Delivered
                        </p>
                        <h2 className="display journey-glow mt-3 max-w-[20ch] text-display-lg">{CLOSING.title}</h2>
                        <p className="journey-glow mt-3 max-w-[32rem] text-lead text-body">{CLOSING.text}</p>
                        <div className="pointer-events-auto mt-6 flex flex-wrap gap-2.5 sm:gap-3">
                          <Button href="#work" variant="primary" icon={LuArrowRight}>
                            Explore my projects
                          </Button>
                          <Button href="#about" variant="outline">
                            View my background
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="journey-controls">
                  <div className="container-site">
                    <nav aria-label="Supply chain journey" className="journey-rail">
                      <p aria-hidden="true" className="meta flex items-center gap-2 whitespace-nowrap pl-1">
                        <span data-o="counter">01</span>
                        <span className="opacity-50">/ {twoDigits(STAGES.length)}</span>
                        <span data-o="counter-label" className="hidden min-w-[7.5rem] sm:inline">
                          Scroll to begin
                        </span>
                      </p>
                      <ol className="flex items-center">
                        {STAGES.map((stage, index) => (
                          <li key={stage.key}>
                            <button
                              type="button"
                              data-segment={index}
                              onClick={() => goTo(stage.still)}
                              aria-label={`Stage ${index + 1} of ${STAGES.length}: ${stage.title}`}
                              className="journey-segment"
                            >
                              <span>
                                <span />
                              </span>
                            </button>
                          </li>
                        ))}
                      </ol>
                      <a href="#journey-end" onClick={skip} className="journey-skip">
                        Skip
                        <span className="hidden sm:inline">&nbsp;the journey</span>
                        <LuArrowDown aria-hidden="true" className="h-3.5 w-3.5" />
                      </a>
                    </nav>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="sr-only">
          <h2>The supply chain journey</h2>
          <ol>
            {STAGES.map((stage) => (
              <li key={stage.key}>
                {stage.title}: {stage.text}
              </li>
            ))}
          </ol>
        </div>
      </section>
      <div id="journey-end" ref={endRef} tabIndex={-1} className="h-16 outline-none md:h-24" />
    </>
  );
};

export default Hero;
