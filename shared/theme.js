// Colour design tokens for the whole site.
// Each token is a CSS custom property holding "R G B" channels, so Tailwind classes like
// `bg-canvas/80` keep working. The defaults are the approved reference palette
// (reeves.webflow.io); src/index.css declares the same values for first paint — keep them in sync.

export const THEME_TOKENS = [
  { key: "background", cssVar: "--c-bg", label: "Page background", group: "Backgrounds" },
  { key: "surface", cssVar: "--c-surface", label: "Panels & inputs", group: "Backgrounds" },
  { key: "surfaceRaised", cssVar: "--c-raised", label: "Cards & pills", group: "Backgrounds" },
  { key: "photoCard", cssVar: "--c-photo", label: "Photo & preview frames", group: "Backgrounds" },
  { key: "heading", cssVar: "--c-heading", label: "Headings", group: "Text" },
  { key: "body", cssVar: "--c-body", label: "Body text", group: "Text" },
  { key: "muted", cssVar: "--c-muted", label: "Muted labels", group: "Text" },
  { key: "border", cssVar: "--c-border", label: "Card & panel outlines", group: "Lines" },
  { key: "borderStrong", cssVar: "--c-border-strong", label: "Rules & dividers", group: "Lines" },
  { key: "accent", cssVar: "--c-accent", label: "Accent", group: "Accent & buttons" },
  { key: "onAccent", cssVar: "--c-on-accent", label: "Text on accent", group: "Accent & buttons" },
  { key: "button", cssVar: "--c-button", label: "Buttons & menu panel", group: "Accent & buttons" },
  { key: "buttonText", cssVar: "--c-button-text", label: "Text on buttons & menu", group: "Accent & buttons" },
];

export const THEME_PRESETS = [
  {
    id: "reeves",
    name: "Reeves Dark",
    description: "The approved reference palette (default).",
    colors: {
      background: "#232426",
      surface: "#2A2A2A",
      surfaceRaised: "#343537",
      photoCard: "#E3E1E2",
      heading: "#E1E1E1",
      body: "#CCCCCC",
      muted: "#8C8C94",
      border: "#343537",
      borderStrong: "#6B6C6C",
      accent: "#CBA385",
      onAccent: "#232426",
      button: "#E1E1E1",
      buttonText: "#232426",
    },
  },
  {
    id: "mine-shaft",
    name: "Mine Shaft",
    description: "Neutral charcoal from the colour-cube palette.",
    colors: {
      background: "#242424",
      surface: "#2A2A2A",
      surfaceRaised: "#343537",
      photoCard: "#D6D4D2",
      heading: "#E3E1E2",
      body: "#D6D4D2",
      muted: "#8C9492",
      border: "#343537",
      borderStrong: "#717070",
      accent: "#CBA385",
      onAccent: "#242424",
      button: "#E3E1E2",
      buttonText: "#242424",
    },
  },
  {
    id: "espresso",
    name: "Espresso",
    description: "Warmer variant using the tan tones.",
    colors: {
      background: "#242423",
      surface: "#2A2A2A",
      surfaceRaised: "#343537",
      photoCard: "#DCC2AD",
      heading: "#DCC2AD",
      body: "#CCCCCC",
      muted: "#8C8C94",
      border: "#343537",
      borderStrong: "#757575",
      accent: "#D2AC8E",
      onAccent: "#242423",
      button: "#D2AC8E",
      buttonText: "#242423",
    },
  },
  {
    id: "paper",
    name: "Paper",
    description: "Light version of the same palette.",
    colors: {
      background: "#E3E1E2",
      surface: "#D6D4D2",
      surfaceRaised: "#CCCCCC",
      photoCard: "#D6D4D2",
      heading: "#232426",
      body: "#343537",
      muted: "#5C5D5F",
      border: "#CCCCCC",
      borderStrong: "#8C8C94",
      accent: "#5C3424",
      onAccent: "#E3E1E2",
      button: "#232426",
      buttonText: "#E3E1E2",
    },
  },
  // Vintage presets: the default's lightness steps with a soft hue tint and a muted accent, so cards,
  // borders and text keep the same hierarchy and contrast on the dark background.
  {
    id: "muted-sage",
    name: "Muted Sage",
    description: "Soft grey-green on a sage-tinted charcoal.",
    colors: {
      background: "#212520",
      surface: "#282B27",
      surfaceRaised: "#323731",
      photoCard: "#D8DFD1",
      heading: "#DFE4DC",
      body: "#CACFC7",
      muted: "#8B9388",
      border: "#323731",
      borderStrong: "#686E67",
      accent: "#A2B395",
      onAccent: "#212520",
      button: "#D8DFD1",
      buttonText: "#212520",
    },
  },
  {
    id: "dusty-rose",
    name: "Dusty Rose",
    description: "Faded rose and blush on warm charcoal.",
    colors: {
      background: "#272222",
      surface: "#2E2828",
      surfaceRaised: "#3A3333",
      photoCard: "#E9D8D7",
      heading: "#E8E0E0",
      body: "#D3CBCB",
      muted: "#998C8C",
      border: "#3A3333",
      borderStrong: "#726A69",
      accent: "#CAA0A3",
      onAccent: "#272222",
      button: "#E9D8D7",
      buttonText: "#272222",
    },
  },
  {
    id: "warm-beige",
    name: "Warm Beige",
    description: "Sand and linen tones on warm brown-grey.",
    colors: {
      background: "#27231E",
      surface: "#2E2924",
      surfaceRaised: "#39342F",
      photoCard: "#E3D3BE",
      heading: "#E9E0D7",
      body: "#D3CCC3",
      muted: "#988E83",
      border: "#39342F",
      borderStrong: "#716B64",
      accent: "#C7AE90",
      onAccent: "#27231E",
      button: "#E5D7C4",
      buttonText: "#27231E",
    },
  },
  {
    id: "faded-terracotta",
    name: "Faded Terracotta",
    description: "Sun-faded clay with pale peach highlights.",
    colors: {
      background: "#272220",
      surface: "#2E2926",
      surfaceRaised: "#3A3430",
      photoCard: "#E9D7CB",
      heading: "#E9E0DB",
      body: "#D4CBC7",
      muted: "#9A8D86",
      border: "#3A3430",
      borderStrong: "#726A66",
      accent: "#CB9880",
      onAccent: "#272220",
      button: "#E9D7CB",
      buttonText: "#272220",
    },
  },
  {
    id: "soft-olive",
    name: "Soft Olive",
    description: "Gentle olive and khaki on olive-grey.",
    colors: {
      background: "#24241E",
      surface: "#2B2A24",
      surfaceRaised: "#36362E",
      photoCard: "#DDDCC6",
      heading: "#E3E3D8",
      body: "#CECEC4",
      muted: "#919183",
      border: "#36362E",
      borderStrong: "#6D6C64",
      accent: "#B4B286",
      onAccent: "#24241E",
      button: "#DDDCC6",
      buttonText: "#24241E",
    },
  },
  {
    id: "antique-cream",
    name: "Antique Cream",
    description: "Aged cream with an antique brass accent.",
    colors: {
      background: "#25231F",
      surface: "#2C2A25",
      surfaceRaised: "#38352F",
      photoCard: "#EDE4CC",
      heading: "#E9E1CF",
      body: "#D2CDC0",
      muted: "#958F84",
      border: "#38352F",
      borderStrong: "#6F6B64",
      accent: "#C5B17F",
      onAccent: "#25231F",
      button: "#ECE2C8",
      buttonText: "#25231F",
    },
  },
  {
    id: "faded-denim",
    name: "Faded Denim",
    description: "Washed-out denim blue, a cool counterpoint.",
    colors: {
      background: "#202428",
      surface: "#262B2F",
      surfaceRaised: "#31363B",
      photoCard: "#D5DFEA",
      heading: "#DEE2E7",
      body: "#C9CED3",
      muted: "#88919B",
      border: "#31363B",
      borderStrong: "#676C73",
      accent: "#96AEC7",
      onAccent: "#202428",
      button: "#D5DFEA",
      buttonText: "#202428",
    },
  },
  {
    id: "heather",
    name: "Heather",
    description: "Muted mauve and lilac-grey tones.",
    colors: {
      background: "#262226",
      surface: "#2C292D",
      surfaceRaised: "#383339",
      photoCard: "#E4DAE5",
      heading: "#E5E0E5",
      body: "#D0CBD0",
      muted: "#958C97",
      border: "#383339",
      borderStrong: "#6F6A70",
      accent: "#BCA3BC",
      onAccent: "#262226",
      button: "#E4DAE5",
      buttonText: "#262226",
    },
  },
  {
    id: "verdigris",
    name: "Verdigris",
    description: "Weathered copper-patina green.",
    colors: {
      background: "#1F2524",
      surface: "#252C2B",
      surfaceRaised: "#2F3736",
      photoCard: "#D3E2DF",
      heading: "#DCE4E2",
      body: "#C7CFCD",
      muted: "#849491",
      border: "#2F3736",
      borderStrong: "#646E6D",
      accent: "#8EB6AE",
      onAccent: "#1F2524",
      button: "#D3E2DF",
      buttonText: "#1F2524",
    },
  },
];

export const DEFAULT_THEME = THEME_PRESETS[0].colors;

export const HEX_PATTERN = /^#[0-9a-f]{6}$/i;

/** "#abc", "abc" or "#AABBCC" → "#AABBCC"; anything else → null. */
export function normalizeHex(value) {
  let hex = String(value ?? "").trim();
  if (!hex.startsWith("#")) hex = `#${hex}`;
  if (/^#[0-9a-f]{3}$/i.test(hex)) hex = `#${[...hex.slice(1)].map((c) => c + c).join("")}`;
  return HEX_PATTERN.test(hex) ? hex.toUpperCase() : null;
}

/** Fills gaps and drops invalid values, so the site always has a complete palette. */
export function resolveTheme(partial = {}) {
  return Object.fromEntries(
    THEME_TOKENS.map(({ key }) => [key, normalizeHex(partial?.[key]) || DEFAULT_THEME[key]])
  );
}

export const hexToChannels = (hex) => {
  const value = parseInt(hex.slice(1), 16);
  return `${(value >> 16) & 255} ${(value >> 8) & 255} ${value & 255}`;
};

/** CSS custom properties for a palette, e.g. { "--c-bg": "35 36 38", … } */
export const themeToCssVars = (theme) =>
  Object.fromEntries(THEME_TOKENS.map(({ key, cssVar }) => [cssVar, hexToChannels(theme[key])]));

const channelLuminance = (channel) => {
  const value = channel / 255;
  return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
};

const luminance = (hex) => {
  const value = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(value >> 16) & 255, (value >> 8) & 255, value & 255].map(channelLuminance);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

/** WCAG 2.x contrast ratio between two hex colours (1–21). */
export function contrastRatio(foreground, background) {
  const [lighter, darker] = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  return (lighter + 0.05) / (darker + 0.05);
}

/** True for palettes with a light page background (they get dark native controls swapped for light ones). */
export const isLightTheme = (theme) =>
  contrastRatio(resolveTheme(theme).background, "#000000") > contrastRatio(resolveTheme(theme).background, "#FFFFFF");

// Error text isn't part of the editable palette: a readable red is picked for dark or light backgrounds.
export const DANGER_COLORS = { dark: "#F2A196", light: "#9E2A1E" };
export const dangerColor = (theme) => DANGER_COLORS[isLightTheme(theme) ? "light" : "dark"];

// Every text/background pairing the site uses. `min` blocks saving; `recommended` only warns.
// (Muted labels are only placed on the page background.)
export const CONTRAST_RULES = [
  { fg: "heading", bg: "background", min: 4.5, label: "Headings on the page" },
  { fg: "body", bg: "background", min: 4.5, label: "Body text on the page" },
  { fg: "muted", bg: "background", min: 3, recommended: 4.5, label: "Muted labels on the page" },
  { fg: "accent", bg: "background", min: 3, recommended: 4.5, label: "Accent on the page" },
  { fg: "heading", bg: "surface", min: 4.5, label: "Headings on panels" },
  { fg: "body", bg: "surface", min: 4.5, label: "Text in panels & inputs" },
  { fg: "heading", bg: "surfaceRaised", min: 4.5, label: "Headings on cards" },
  { fg: "body", bg: "surfaceRaised", min: 4.5, label: "Body text on cards" },
  { fg: "accent", bg: "surfaceRaised", min: 3, label: "Accent on cards" },
  { fg: "onAccent", bg: "accent", min: 4.5, label: "Text on accent" },
  { fg: "buttonText", bg: "button", min: 4.5, label: "Text on buttons & the menu" },
];

/** Checks every rule; `errors` must be empty before a palette can be published. */
export function checkThemeContrast(theme) {
  const results = CONTRAST_RULES.map((rule) => {
    const ratio = contrastRatio(theme[rule.fg], theme[rule.bg]);
    return {
      ...rule,
      ratio,
      passes: ratio >= rule.min,
      meetsRecommended: ratio >= (rule.recommended ?? rule.min),
    };
  });
  return {
    results,
    errors: results.filter((result) => !result.passes),
    warnings: results.filter((result) => result.passes && !result.meetsRecommended),
  };
}
