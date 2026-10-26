import { THEME_TOKENS, dangerColor, hexToChannels, isLightTheme, normalizeHex, resolveTheme } from "../../shared/theme.js";

export const CONTENT_CACHE_KEY = "portfolio:content:v2";
const PREVIEW_PARAM = "previewTheme";
const EXTRA_VARS = ["--c-danger"];

/** Applies a palette to the whole document through the CSS custom properties. */
export function applyTheme(theme) {
  const palette = resolveTheme(theme);
  const root = document.documentElement;
  for (const { key, cssVar } of THEME_TOKENS) root.style.setProperty(cssVar, hexToChannels(palette[key]));
  root.style.setProperty("--c-danger", hexToChannels(dangerColor(palette)));
  // Light palettes get light native controls (scrollbars, form fields).
  root.style.colorScheme = isLightTheme(palette) ? "light" : "dark";
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", palette.background);
}

/** Restores the stylesheet defaults (used when leaving the public site for the admin). */
export function clearTheme() {
  const root = document.documentElement;
  for (const { cssVar } of THEME_TOKENS) root.style.removeProperty(cssVar);
  for (const cssVar of EXTRA_VARS) root.style.removeProperty(cssVar);
  root.style.removeProperty("color-scheme");
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", resolveTheme().background);
}

/** Compact, URL-safe form of a palette: hex values (without #) in token order, dot-separated. */
export const encodePreviewTheme = (theme) => {
  const palette = resolveTheme(theme);
  return THEME_TOKENS.map(({ key }) => palette[key].slice(1)).join(".");
};

/** Unsaved palette passed by the admin "Preview on site" button, or null. Never persisted. */
export function readPreviewTheme(search = window.location.search) {
  const raw = new URLSearchParams(search).get(PREVIEW_PARAM);
  if (!raw) return null;
  const values = raw.split(".");
  if (values.length !== THEME_TOKENS.length) return null;
  const palette = {};
  for (const [index, { key }] of THEME_TOKENS.entries()) {
    const hex = normalizeHex(values[index]);
    if (!hex) return null;
    palette[key] = hex;
  }
  return palette;
}

export const previewUrl = (theme, path = "/") => `${path}?${PREVIEW_PARAM}=${encodePreviewTheme(theme)}`;

/** Applies the previewed (or last cached) palette before the first render, so colours don't flash. */
export function applyInitialTheme() {
  if (window.location.pathname.startsWith("/admin")) return;
  const preview = readPreviewTheme();
  if (preview) {
    applyTheme(preview);
    return;
  }
  try {
    const cached = JSON.parse(localStorage.getItem(CONTENT_CACHE_KEY) || "null");
    if (cached?.theme) applyTheme(cached.theme);
  } catch {
    // No cache yet (or storage unavailable): the stylesheet defaults apply.
  }
}
