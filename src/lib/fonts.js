// Humane (the display face from the design reference) isn't openly licensed, so it isn't bundled.
// Add your licensed .woff2/.woff files to src/assets/fonts/humane/ — they're picked up at build time
// and registered below. Until then the display stack falls back to Six Caps (SIL OFL), loaded in main.jsx.

const files = import.meta.glob("../assets/fonts/humane/*.{woff2,woff}", {
  eager: true,
  query: "?url",
  import: "default",
});

// Longest names first, so "extralight" isn't read as "light" or "semibold" as "bold".
const WEIGHTS = [
  ["extralight", 200],
  ["ultralight", 200],
  ["extrabold", 800],
  ["semibold", 600],
  ["demibold", 600],
  ["regular", 400],
  ["medium", 500],
  ["light", 300],
  ["black", 900],
  ["heavy", 900],
  ["thin", 100],
  ["bold", 700],
];

const weightOf = (fileName) => {
  const name = fileName.toLowerCase().replace(/[^a-z]/g, "");
  return WEIGHTS.find(([keyword]) => name.includes(keyword))?.[1] ?? 400;
};

export const humaneInstalled = Object.keys(files).length > 0;

/** Registers the Humane files (if any) with the browser's font loader. */
export function loadHumane() {
  if (!humaneInstalled || typeof FontFace === "undefined") return;
  const byWeight = new Map();
  for (const [path, url] of Object.entries(files)) {
    const weight = weightOf(path.split("/").pop());
    const format = path.endsWith(".woff2") ? "woff2" : "woff";
    const sources = byWeight.get(weight) || [];
    sources.push({ format, src: `url(${url}) format("${format}")` });
    byWeight.set(weight, sources);
  }
  for (const [weight, sources] of byWeight) {
    sources.sort((a, b) => (a.format === "woff2" ? -1 : b.format === "woff2" ? 1 : 0));
    const face = new FontFace("Humane", sources.map((source) => source.src).join(", "), {
      weight: String(weight),
      display: "swap",
    });
    document.fonts.add(face);
    face.load().catch(() => {});
  }
}
