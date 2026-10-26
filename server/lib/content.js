import { ESSENTIAL_LISTS, ESSENTIAL_SECTIONS } from "../../shared/content-backup.js";
import { COLLECTIONS } from "../../shared/schema.js";
import { DEFAULT_PROFILE } from "../../shared/default-content.js";
import { normalizeHex, resolveTheme } from "../../shared/theme.js";
import { CollectionModels, Meta, SingletonModels } from "../models/index.js";
import { bundledBackup } from "./backup.js";

export const COLLECTION_NAMES = Object.keys(COLLECTIONS);

// Meta document naming the essential lists an admin emptied on purpose, which are then not refilled.
const EMPTIED_KEY = "emptied-on-purpose";

const VISIBLE_FIELD = { name: "visible", type: "boolean" };

/**
 * Keeps only the fields defined in the schema and normalises their types.
 * Fields missing from the payload are left untouched, so partial updates work.
 */
export function sanitizeInput(fields, body = {}) {
  const output = {};
  for (const field of [...fields, VISIBLE_FIELD]) {
    if (field.readOnly || !Object.hasOwn(body, field.name)) continue;
    const value = body[field.name];
    switch (field.type) {
      case "boolean":
        output[field.name] = value === true || value === "true";
        break;
      case "number":
        output[field.name] = value === "" || value === null ? undefined : Number(value);
        break;
      case "tags":
        output[field.name] = Array.isArray(value)
          ? [...new Set(value.map((entry) => String(entry).trim()).filter(Boolean))]
          : [];
        break;
      case "list":
        output[field.name] = (Array.isArray(value) ? value : String(value ?? "").split("\n"))
          .map((entry) => String(entry).trim())
          .filter(Boolean);
        break;
      case "color":
        // Invalid values pass through unchanged so the model validator can report them.
        output[field.name] = normalizeHex(value) ?? String(value ?? "").trim();
        break;
      default:
        output[field.name] = value == null ? "" : String(value).trim();
    }
  }
  return output;
}

/** Shape sent to the admin panel: keeps visibility, order and timestamps. */
export const toAdminItem = (doc) => {
  const { _id, __v, ...rest } = typeof doc.toObject === "function" ? doc.toObject() : doc;
  return { id: String(_id), ...rest };
};

/** Shape sent to the public site: only the content itself. */
const toPublicItem = ({ _id, __v, visible, order, createdAt, updatedAt, ...rest }) => ({
  id: String(_id),
  ...rest,
});

const stripMeta = (doc) => {
  if (!doc) return {};
  const { _id, __v, createdAt, updatedAt, ...rest } = doc;
  return rest;
};

export async function getProfile() {
  const doc = await SingletonModels.profile.findOne().lean();
  return { ...DEFAULT_PROFILE, ...stripMeta(doc) };
}

/** The saved palette merged over the defaults (always complete and valid). */
export async function getTheme() {
  return resolveTheme(stripMeta(await SingletonModels.theme.findOne().lean()));
}

/**
 * Records that the admin removed every item of an essential list on purpose (`emptied`), or added one
 * again, so the public site knows not to refill that list from the backup.
 */
export async function setEmptiedOnPurpose(name, emptied) {
  if (!ESSENTIAL_LISTS.includes(name)) return;
  const update = emptied ? { $set: { [`value.${name}`]: new Date() } } : { $unset: { [`value.${name}`]: "" } };
  await Meta.updateOne({ key: EMPTIED_KEY }, update, { upsert: emptied });
}

/** The essential lists an admin emptied on purpose, as { name: date }. */
export const emptiedOnPurpose = async () => (await Meta.findOne({ key: EMPTIED_KEY }).lean())?.value || {};

/** Forgets the "emptied on purpose" marks (used after a restore puts the lists back). */
export const clearEmptiedOnPurpose = () => Meta.deleteOne({ key: EMPTIED_KEY });

/** Keys of the homepage sections that are hidden — they aren't in the public content. */
export const hiddenSectionKeys = async () =>
  (await CollectionModels.sections.find({ visible: { $ne: true } }, { key: 1 }).sort({ order: 1 }).lean()).map(
    (section) => section.key
  );

/** Puts a section back where the reference list had it: before the first present section that followed it there. */
export function insertInOrder(sections, section, reference) {
  const rank = (key) => reference.findIndex((item) => item.key === key);
  const at = sections.findIndex((item) => rank(item.key) > rank(section.key));
  return at === -1 ? [...sections, section] : [...sections.slice(0, at), section, ...sections.slice(at)];
}

/**
 * Everything the public site needs, in one response. Hidden items and sections are excluded.
 *
 * Essential records that are missing from the database — not hidden, but gone — are filled in from the
 * bundled backup, so the sections in the reference screenshot never disappear: a deleted profile or
 * palette, a deleted homepage section, or an essential list with no items at all (unless the admin
 * emptied it on purpose). `filled` names the parts that came from the backup.
 */
export async function loadPublicContent() {
  const [profileDoc, themeDoc, emptied, ...lists] = await Promise.all([
    SingletonModels.profile.findOne().lean(),
    SingletonModels.theme.findOne().lean(),
    Meta.findOne({ key: EMPTIED_KEY }).lean(),
    ...COLLECTION_NAMES.map((name) => CollectionModels[name].find().sort({ order: 1, _id: 1 }).lean()),
  ]);
  const stored = Object.fromEntries(COLLECTION_NAMES.map((name, index) => [name, lists[index]]));
  const content = {
    profile: { ...DEFAULT_PROFILE, ...stripMeta(profileDoc) },
    theme: resolveTheme(stripMeta(themeDoc)),
  };
  for (const name of COLLECTION_NAMES) {
    content[name] = stored[name].filter((doc) => doc.visible === true).map(toPublicItem);
  }

  const filled = [];
  const backup = bundledBackup()?.content;
  if (!backup) return { content, filled };

  if (!profileDoc) {
    content.profile = { ...DEFAULT_PROFILE, ...backup.profile };
    filled.push("profile");
  }
  if (!themeDoc && backup.theme) {
    content.theme = resolveTheme(backup.theme);
    filled.push("theme");
  }
  const storedSections = new Set(stored.sections.map((section) => section.key));
  for (const key of Object.keys(ESSENTIAL_SECTIONS)) {
    const section = backup.sections?.find((item) => item.key === key);
    if (storedSections.has(key) || !section) continue;
    content.sections = insertInOrder(content.sections, section, backup.sections);
    filled.push(`section:${key}`);
  }
  const onPurpose = emptied?.value || {};
  for (const name of ESSENTIAL_LISTS) {
    if (stored[name].length || onPurpose[name] || !backup[name]?.length) continue;
    content[name] = backup[name];
    filled.push(name);
  }
  return { content, filled };
}

export const getPublicContent = async () => (await loadPublicContent()).content;
