// Everything drawn over the journey's world — and the sky behind it — painted from the journey's progress:
// the hero text, the stage captions, the progress controls, the time of day and the ink colour that keeps
// the text readable against it. Light enough to ship with the first screen.

import { alpha, clamp, css, curve, lerp, span } from "./keyframes";
import { CLOSING, HERO_END, STAGES, stageAt } from "./stages";

const FADE = 0.012;

// Text colours over the sky: dark ink by day, light ink once it's dusk. Values are "R G B" channels, like
// the site palette they stand in for inside the journey.
const INK = {
  "--c-heading": [
    [16, 27, 43],
    [246, 243, 236],
  ],
  "--c-body": [
    [40, 52, 70],
    [218, 224, 233],
  ],
  "--c-muted": [
    [68, 80, 98],
    [176, 188, 204],
  ],
  "--c-border": [
    [205, 201, 192],
    [86, 98, 120],
  ],
  "--c-border-strong": [
    [93, 104, 120],
    [150, 162, 180],
  ],
  "--c-raised": [
    [255, 255, 255],
    [28, 38, 58],
  ],
  "--c-button": [
    [16, 27, 43],
    [246, 243, 236],
  ],
  "--c-button-text": [
    [246, 243, 236],
    [16, 27, 43],
  ],
};

const mixChannels = ([a, b], t) => a.map((channel, i) => Math.round(lerp(channel, b[i], t))).join(" ");

// The veil behind the text: the light sky's colour by day, the night's after dusk.
const VEIL = [
  [232, 237, 240],
  [16, 24, 44],
];

// The sun's arc across the day, in stage percentages; it rises on the right and sets ahead of the ship.
export const SUN_X = curve([
  [0, 80],
  [0.12, 72],
  [0.7, 66],
  [0.8, 70],
  [0.88, 74],
]);
const SUN_Y = curve([
  [0, 47],
  [0.12, 15],
  [0.62, 12],
  [0.78, 36],
  [0.88, 66],
]);
const SUN_TONES = [
  { at: 0, core: [255, 240, 212], glow: [255, 204, 150] },
  { at: 0.12, core: [255, 251, 238], glow: [255, 244, 218] },
  { at: 0.74, core: [255, 228, 170], glow: [255, 176, 104] },
  { at: 0.86, core: [255, 196, 140], glow: [255, 136, 92] },
];

function sunTone(p) {
  let i = 0;
  while (i < SUN_TONES.length - 2 && p > SUN_TONES[i + 1].at) i++;
  const [a, b] = [SUN_TONES[i], SUN_TONES[i + 1]];
  const t = clamp((p - a.at) / (b.at - a.at));
  return {
    core: mixChannels([a.core, b.core], t),
    glow: mixChannels([a.glow, b.glow], t),
  };
}

/** Finds the overlay's parts under the stage once; `paint(p)` then updates them for any progress. */
export function createOverlay(stage) {
  const one = (name) => stage.querySelector(`[data-o="${name}"]`);
  const parts = {
    hero: one("hero"),
    veil: one("veil"),
    scrim: one("scrim"),
    ink: one("ink"),
    counter: one("counter"),
    counterLabel: one("counter-label"),
    sun: one("sun"),
    moon: one("moon"),
    stars: one("stars"),
    skies: ["day", "golden", "dusk", "night"].map((key) => one(`sky-${key}`)),
    captions: [...stage.querySelectorAll("[data-caption]")],
    segments: [...stage.querySelectorAll("[data-segment]")],
  };
  let size = { width: stage.clientWidth, height: stage.clientHeight };
  let activeStage = null;

  const showCaption = (element, opacity, entering) => {
    css(element, "opacity", alpha(opacity));
    css(element, "visibility", opacity > 0.001 ? "visible" : "hidden");
    css(element, "transform", `translate3d(0, ${Math.round((1 - opacity) * (entering ? 14 : -14))}px, 0)`);
  };

  return {
    measure() {
      size = { width: stage.clientWidth, height: stage.clientHeight };
    },

    paint(p) {
      // Hero text out, first caption in
      const heroOut = span(p, 0.006, HERO_END - 0.004, (t) => t);
      css(parts.hero, "opacity", alpha(1 - heroOut));
      css(parts.hero, "visibility", heroOut < 0.999 ? "visible" : "hidden");
      css(parts.hero, "transform", `translate3d(0, ${Math.round(-30 * heroOut)}px, 0)`);
      css(parts.scrim, "opacity", alpha(1 - span(p, 0, 0.012)));

      // Each caption fades in just after its stage starts and out just before it ends, so two never overlap
      STAGES.forEach((stage, i) => {
        const opacity = Math.min(
          span(p, stage.start, stage.start + FADE, (t) => t),
          1 - span(p, stage.end - FADE, stage.end, (t) => t),
        );
        showCaption(parts.captions[i], opacity, p < stage.start + FADE);
      });
      showCaption(
        parts.captions[STAGES.length],
        span(p, CLOSING.start, CLOSING.start + FADE, (t) => t),
        true,
      );

      // Progress controls: one segment per stage, the current one marked
      parts.segments.forEach((segment, i) => {
        const fill = clamp((p - STAGES[i].start) / (STAGES[i].end - STAGES[i].start));
        css(segment.firstElementChild.firstElementChild, "transform", `scaleX(${Math.round(fill * 1000) / 1000})`);
      });
      const index = stageAt(p);
      if (index !== activeStage) {
        activeStage = index;
        const shown = clamp(index, 0, STAGES.length - 1);
        parts.counter.textContent = String(shown + 1).padStart(2, "0");
        parts.counterLabel.textContent =
          index < 0 ? "Scroll to begin" : index >= STAGES.length ? "Delivered" : STAGES[index].label;
        parts.segments.forEach((segment, i) => {
          if (i === index) segment.setAttribute("aria-current", "step");
          else segment.removeAttribute("aria-current");
        });
      }

      // Time of day: each sky fades in over the one before
      const skies = [span(p, 0.035, 0.13), span(p, 0.7, 0.77), span(p, 0.79, 0.84), span(p, 0.9, 0.96)];
      skies.forEach((value, i) => css(parts.skies[i], "opacity", alpha(value)));
      const tone = sunTone(p);
      css(parts.sun, "--sun-core", tone.core);
      css(parts.sun, "--sun-glow", tone.glow);
      css(parts.sun, "opacity", alpha(1 - span(p, 0.85, 0.89)));
      css(
        parts.sun,
        "transform",
        `translate3d(${Math.round((SUN_X(p) / 100) * size.width)}px, ${Math.round((SUN_Y(p) / 100) * size.height)}px, 0)`,
      );
      css(parts.stars, "opacity", alpha(span(p, 0.9, 0.985)));
      css(parts.moon, "opacity", alpha(span(p, 0.93, 0.99)));

      // Ink follows the light, and so does the veil behind it
      const night = span(p, 0.803, 0.823);
      for (const [name, pair] of Object.entries(INK)) css(parts.ink, name, mixChannels(pair, night));
      const veil = mixChannels(VEIL, night);
      css(parts.veil, "--veil", veil);
      css(parts.ink, "--veil-text", veil);
    },
  };
}
