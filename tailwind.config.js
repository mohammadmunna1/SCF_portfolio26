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
        // Humane loads automatically when its licensed files are added (src/lib/fonts.js);
        // Six Caps (OFL) is the bundled stand-in with the same ultra-condensed proportions.
        display: ["Humane", "Six Caps", "Arial Narrow", "sans-serif"],
        sans: ["Geist Variable", "Geist", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Cascadia Code", "Consolas", "Menlo", "monospace"],
      },
      fontSize: {
        // Reference: Humane 320px / 224px line height at 1440px wide — scaled fluidly below that.
        // Line heights stay ≥ 0.9 where titles can wrap, so stacked lines never touch.
        "display-hero": ["clamp(6.5rem, 22.2vw, 20rem)", { lineHeight: "0.72" }],
        "display-xl": ["clamp(5rem, 16vw, 15rem)", { lineHeight: "0.9" }],
        "display-lg": ["clamp(3.75rem, 9vw, 8.5rem)", { lineHeight: "0.9" }],
        "display-md": ["clamp(2.75rem, 5vw, 4.75rem)", { lineHeight: "0.92" }],
        "display-sm": ["clamp(2rem, 2.6vw, 2.75rem)", { lineHeight: "0.92" }],
        // Body copy (reference: Geist 16px / 22px, weight 300) is set on <body> in src/index.css.
        // No "body" size here: it would collide with the `text-body` colour class.
        lead: ["clamp(1.0625rem, 1rem + 0.3vw, 1.25rem)", { lineHeight: "1.5" }],
        caps: ["0.8125rem", { lineHeight: "1.25rem", letterSpacing: "0.02em" }],
        micro: ["0.6875rem", { lineHeight: "1rem", letterSpacing: "0.06em" }],
      },
      maxWidth: {
        prose: "65ch",
      },
      animation: {
        "spin-slow": "spin 24s linear infinite",
      },
    },
  },
  plugins: [],
};
