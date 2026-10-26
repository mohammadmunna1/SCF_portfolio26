/** @type {import('tailwindcss').Config} */

// Every colour reads a CSS custom property (see src/index.css and shared/theme.js),
// so the palette can be changed from the admin panel without rebuilding.
const token = (name) => `rgb(var(${name}) / <alpha-value>)`;

export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        canvas: token("--c-bg"),
        surface: { DEFAULT: token("--c-surface"), raised: token("--c-raised") },
        photo: token("--c-photo"),
        heading: token("--c-heading"),
        body: token("--c-body"),
        muted: token("--c-muted"),
        line: { DEFAULT: token("--c-border"), strong: token("--c-border-strong") },
        accent: { DEFAULT: token("--c-accent"), on: token("--c-on-accent") },
        button: { DEFAULT: token("--c-button"), text: token("--c-button-text") },
        danger: token("--c-danger"),
      },
      fontFamily: {
        // The previous design's ultra-condensed face (Humane when its licensed files are added, see
        // src/lib/fonts.js; Six Caps otherwise). Headlines now use Geist — see `.display` in src/index.css.
        display: ["Humane", "Six Caps", "Arial Narrow", "sans-serif"],
        sans: ["Geist Variable", "Geist", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Cascadia Code", "Consolas", "Menlo", "monospace"],
      },
      fontSize: {
        // Geist headlines (used with the `.display` class), scaled fluidly from phones to wide screens.
        // Tighter tracking as the size grows, as large Geist is set.
        "display-hero": ["clamp(2.5rem, 1.55rem + 3.9vw, 4.5rem)", { lineHeight: "1.04", letterSpacing: "-0.035em" }],
        "display-xl": ["clamp(2.5rem, 1.4rem + 4.6vw, 5.25rem)", { lineHeight: "1.02", letterSpacing: "-0.04em" }],
        "display-lg": ["clamp(2rem, 1.45rem + 2.2vw, 3.25rem)", { lineHeight: "1.08", letterSpacing: "-0.03em" }],
        "display-md": ["clamp(1.5rem, 1.25rem + 1vw, 2.125rem)", { lineHeight: "1.15", letterSpacing: "-0.025em" }],
        "display-sm": ["clamp(1.25rem, 1.15rem + 0.4vw, 1.5rem)", { lineHeight: "1.3", letterSpacing: "-0.015em" }],
        // Body copy (Geist 16px / 1.6) is set on <body> in src/index.css.
        // No "body" size here: it would collide with the `text-body` colour class.
        lead: ["clamp(1.0625rem, 1rem + 0.3vw, 1.1875rem)", { lineHeight: "1.65" }],
        caps: ["0.8125rem", { lineHeight: "1.25rem", letterSpacing: "0.04em" }],
        micro: ["0.6875rem", { lineHeight: "1rem", letterSpacing: "0.08em" }],
      },
      maxWidth: {
        prose: "65ch",
      },
    },
  },
  plugins: [],
};
