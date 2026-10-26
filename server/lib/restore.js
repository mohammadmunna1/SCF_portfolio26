import { createBackupFile, readBackupFile } from "../../shared/content-backup.js";
import { DEFAULT_COLLECTIONS, DEFAULT_PROFILE, DEFAULT_SECTIONS } from "../../shared/default-content.js";
import { SINGLETONS } from "../../shared/schema.js";
import { appliedMigrations } from "../migrations/index.js";
import { CollectionModels, SingletonModels } from "../models/index.js";
import { fingerprintOf } from "./backup.js";
import {
  COLLECTION_NAMES,
  clearEmptiedOnPurpose,
  emptiedOnPurpose,
  hiddenSectionKeys,
  insertInOrder,
  loadPublicContent,
  toAdminItem,
} from "./content.js";

const OBJECT_ID = /^[a-f0-9]{24}$/i;
// Keep the original ids where there are any, so links and keys stay the same after a restore.
const idOf = (id) => (OBJECT_ID.test(String(id)) ? { _id: String(id) } : {});
const withoutTimestamps = ({ createdAt, updatedAt, ...rest } = {}) => rest;

/** Database documents for the seed defaults in shared/default-content.js. */
export function defaultDocuments() {
  const collections = Object.fromEntries(
    COLLECTION_NAMES.map((name) => [name, (DEFAULT_COLLECTIONS[name] || []).map((item, order) => ({ ...item, order, visible: true }))])
  );
  return { collections, profile: DEFAULT_PROFILE, theme: null };
}

/**
 * Database documents for a backup file: its ids and order, everything visible — except the homepage
 * sections that were hidden when the backup was taken, which come back hidden.
 */
export function documentsFromBackup({ content, hiddenSections = [] }) {
  const collections = {};
  for (const name of COLLECTION_NAMES) {
    collections[name] = (content[name] || []).map(({ id, ...fields }, order) => ({ ...fields, ...idOf(id), order, visible: true }));
  }
  for (const key of hiddenSections) {
    const section = DEFAULT_SECTIONS.find((item) => item.key === key);
    if (section && !collections.sections.some((item) => item.key === key)) {
      collections.sections.push({ ...section, order: collections.sections.length, visible: false });
    }
  }
  return { collections, profile: content.profile, theme: content.theme ?? null };
}

/** Database documents for a full backup (Admin → Backup → full backup): hidden items and order included. */
function documentsFromExport({ singletons = {}, collections = {} }) {
  const docs = {};
  for (const name of COLLECTION_NAMES) {
    docs[name] = (collections[name] || []).map(({ id, ...fields }) => ({ ...withoutTimestamps(fields), ...idOf(id) }));
  }
  const singleton = (key) => (Object.keys(singletons[key] || {}).length ? withoutTimestamps(singletons[key]) : null);
  return { collections: docs, profile: singleton("profile"), theme: singleton("theme") };
}

/** A restore source from a parsed file — a backup file or a full backup — or null if it's neither. */
export function documentsFromFile(file) {
  if (readBackupFile(file)) return { kind: "backup file", date: file.generatedAt, ...documentsFromBackup(file) };
  if (file?.collections && file?.singletons) return { kind: "full backup", date: file.exportedAt, ...documentsFromExport(file) };
  return null;
}

/** The backup file for what the public site shows right now (the content of shared/fallback-content.json). */
export async function currentBackupFile(source) {
  const { content } = await loadPublicContent();
  return createBackupFile(content, {
    source,
    fingerprint: fingerprintOf(content),
    hiddenSections: await hiddenSectionKeys(),
    migrations: await appliedMigrations(),
  });
}

/** Every piece of portfolio content, hidden items included — the private full backup (no messages or accounts). */
export async function exportAllContent() {
  const backup = { exportedAt: new Date().toISOString(), singletons: {}, collections: {} };
  for (const key of Object.keys(SINGLETONS)) {
    const { _id, __v, ...data } = (await SingletonModels[key].findOne().lean()) || {};
    backup.singletons[key] = data;
  }
  for (const name of COLLECTION_NAMES) {
    backup.collections[name] = (await CollectionModels[name].find().sort({ order: 1 }).lean()).map(toAdminItem);
  }
  return backup;
}

/**
 * Adds the `reference` sections that are missing from the database, each where the reference had it
 * (the existing sections keep their order). Returns the keys added.
 */
export async function restoreSections(reference, { dryRun = false } = {}) {
  const Sections = CollectionModels.sections;
  const stored = await Sections.find().sort({ order: 1, _id: 1 }).lean();
  const present = new Set(stored.map((section) => section.key));
  const missing = reference.filter((section) => !present.has(section.key));
  if (!missing.length || dryRun) return missing.map((section) => section.key);

  let sequence = stored;
  for (const section of missing) sequence = insertInOrder(sequence, section, reference);
  await Sections.bulkWrite(
    sequence.map((section, order) =>
      present.has(section.key)
        ? { updateOne: { filter: { _id: section._id }, update: { $set: { order } } } }
        : { insertOne: { document: { ...section, order } } }
    )
  );
  return missing.map((section) => section.key);
}

/**
 * Puts back only what is missing: lists with no items at all (unless an admin emptied them on purpose),
 * a deleted profile or palette, deleted homepage sections. Existing content is never changed.
 * Returns a description of each change (with `dryRun`, of each change it would make).
 */
export async function restoreMissing(source, { dryRun = false } = {}) {
  const changes = [];
  const skipped = [];
  const onPurpose = await emptiedOnPurpose();
  for (const name of COLLECTION_NAMES) {
    const docs = source.collections[name] || [];
    if (name === "sections" || !docs.length || (await CollectionModels[name].countDocuments()) > 0) continue;
    if (onPurpose[name]) {
      skipped.push(`${name} (emptied in the admin on purpose)`);
      continue;
    }
    if (!dryRun) await CollectionModels[name].insertMany(docs);
    changes.push(`${name}: ${docs.length} item${docs.length === 1 ? "" : "s"}`);
  }
  const sections = await restoreSections(source.collections.sections || [], { dryRun });
  if (sections.length) changes.push(`sections: ${sections.join(", ")}`);
  for (const [key, label] of [
    ["profile", "profile"],
    ["theme", "palette"],
  ]) {
    if (!source[key] || (await SingletonModels[key].exists({}))) continue;
    if (!dryRun) await SingletonModels[key].create(source[key]);
    changes.push(label);
  }
  return { changes, skipped };
}

/** Replaces all portfolio content (not messages, uploads or admin accounts) with the source. */
export async function restoreAll(source) {
  for (const name of COLLECTION_NAMES) {
    await CollectionModels[name].deleteMany({});
    if (source.collections[name]?.length) await CollectionModels[name].insertMany(source.collections[name]);
  }
  for (const key of ["profile", "theme"]) {
    await SingletonModels[key].deleteMany({});
    if (source[key]) await SingletonModels[key].create(source[key]);
  }
  await clearEmptiedOnPurpose();
}
