// Motion presets taken from the reference site's Framer "appear" settings.

/** Quick, bounce-free settle used for most reveals (stiffness 360, damping 60, mass 0.5). */
export const SPRING_SOFT = { type: "spring", stiffness: 360, damping: 60, mass: 0.5 };

/** Heavy, slow settle used for the project columns dropping into place. */
export const SPRING_SLOW = { type: "spring", stiffness: 50, damping: 30, mass: 1 };

/** Snappy spring for UI controls (nav items, buttons, pills). */
export const SPRING_UI = { type: "spring", stiffness: 200, damping: 40, mass: 1 };

export const EASE_OUT = [0.22, 1, 0.36, 1];

export const VIEWPORT_ONCE = { once: true, amount: 0.2 };

/** Props for the standard reveal (fade and lift into place when scrolled into view), as used by <Reveal>. */
export const revealMotion = ({ delay = 0, y = 28, amount = 0.2 } = {}) => ({
  initial: { opacity: 0, y },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount },
  transition: { ...SPRING_SOFT, delay },
});
