/**
 * The backup copy of the published portfolio, and the rules for using it.
 *
 * shared/fallback-content.json is a snapshot of the public content (exactly what GET /api/content
 * returns), committed with the code. The site shows it when the API can't deliver valid content, the
 * API uses it to fill in essential records that have gone missing from the database, and an empty
 * database is seeded from it. It holds public content only — never credentials or secrets.
 *
 * Update it with `npm run backup` (or Admin → Backup), commit it and deploy. See README → Backup & fallback.
 */

export const BACKUP_FORMAT = 1;

/** Every list in the public content (one per editable collection). */
export const CONTENT_LISTS = [
  "sections",
  "projects",
  "sqaProjects",
  "experience",
  "education",
  "certifications",
  "achievements",
  "skills",
  "stats",
  "socials",
  "faqs",
  "testimonials",
];

/**
 * The homepage sections that must never disappear, and the lists each one is built from. The hero, the
 * About text, contact details and the footer come from the profile.
 */
export const ESSENTIAL_SECTIONS = {
  stats: ["stats"],
  about: [],
  experience: ["experience"],
  work: ["projects"],
  sqa: ["sqaProjects"],
  education: ["education", "achievements"],
  courses: ["certifications"],
  skills: ["skills"],
  contact: ["socials"],
};

export const ESSENTIAL_LISTS = [...new Set(Object.values(ESSENTIAL_SECTIONS).flat())];

const isObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value);

const isList = (key, value) =>
  Array.isArray(value) && value.every((item) => isObject(item) && (key !== "sections" || typeof item.key === "string"));

/**
 * True when content (from the API, a browser cache or a backup file) can be rendered: an object with a
 * named profile, where every list that is present is a list of objects. A list may be absent — see
 * `missingParts` — but a wrong type means a corrupt response.
 */
export function isUsableContent(data) {
  if (!isObject(data) || !isObject(data.profile)) return false;
  if (typeof data.profile.name !== "string" || !data.profile.name.trim()) return false;
  if (data.theme !== undefined && !isObject(data.theme)) return false;
  return CONTENT_LISTS.every((key) => data[key] === undefined || isList(key, data[key]));
}

/** Essential parts absent from otherwise usable content (e.g. a partial response), to take from the backup. */
export const missingParts = (data) => [
  ...["sections", ...ESSENTIAL_LISTS].filter((key) => !Array.isArray(data[key])),
  ...(isObject(data.theme) ? [] : ["theme"]),
];

/** The content with the given parts copied from the backup content. */
export function withParts(data, backup, parts) {
  const next = { ...data };
  for (const part of parts) if (backup?.[part] !== undefined) next[part] = backup[part];
  return next;
}

/** True when any image in the content is an upload served from the database (/api/assets/…). */
export const usesUploadedImages = (content) => JSON.stringify(content).includes('"/api/assets/');

/**
 * Wraps content in the backup file format. `hiddenSections` lists the homepage sections that were hidden
 * when the snapshot was taken (they aren't in the public content), so a restore keeps them hidden;
 * `migrations` the content migrations its content already includes, so a restore runs only newer ones.
 */
export const createBackupFile = (
  content,
  { source, fingerprint, hiddenSections = [], migrations, generatedAt = new Date().toISOString() }
) => ({
  format: BACKUP_FORMAT,
  generatedAt,
  source,
  fingerprint,
  hiddenSections,
  ...(migrations && { migrations }),
  content,
});

/** The backup file if it's valid, otherwise null — a broken file must never replace good content. */
export const readBackupFile = (file) =>
  isObject(file) && file.format === BACKUP_FORMAT && isUsableContent(file.content) ? file : null;

const isBlank = (value) => value === undefined || value === null || value === "" || (Array.isArray(value) && !value.length);

/**
 * Stable text form of content for fingerprints: object keys sorted, blank fields left out — a field
 * that's missing and one that's empty ("" or []) render the same, so they count as the same content.
 */
export function canonicalJson(value) {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (isObject(value)) {
    const keys = Object.keys(value)
      .filter((key) => !isBlank(value[key]))
      .sort();
    return `{${keys.map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(",")}}`;
  }
  return JSON.stringify(value) ?? "null";
}
