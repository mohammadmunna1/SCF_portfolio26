import bcrypt from "bcryptjs";
import { SECTION_KEYS } from "../shared/schema.js";
import { DEFAULT_SECTIONS } from "../shared/default-content.js";
import { config } from "./config.js";
import { bundledBackup } from "./lib/backup.js";
import { defaultDocuments, documentsFromBackup, restoreSections } from "./lib/restore.js";
import { markMigrationsApplied, runPendingMigrations } from "./migrations/index.js";
import { Admin, CollectionModels, Meta, SingletonModels } from "./models/index.js";

const SEED_VERSION = 2;

/**
 * Seeds the portfolio the first time the API meets an empty database — from the backup copy of the
 * published content (shared/fallback-content.json) when there's a valid one, so a lost or replaced
 * database comes back as the site last was; otherwise from the defaults in shared/default-content.js.
 * A marker document makes sure this happens only once, so content the admin deletes stays deleted.
 */
export async function seedIfNeeded({ log = console.log } = {}) {
  let claimed;
  try {
    const result = await Meta.updateOne(
      { key: "seed" },
      { $setOnInsert: { value: { version: SEED_VERSION, at: new Date() } } },
      { upsert: true }
    );
    claimed = result.upsertedCount === 1;
  } catch (error) {
    if (error.code === 11000) return false; // another instance is seeding right now
    throw error;
  }
  if (!claimed) return false;

  const backup = bundledBackup();
  const seed = backup ? documentsFromBackup(backup) : defaultDocuments();
  // The seed content already includes the existing migrations (or, for a backup, the ones it lists),
  // so those must not run on it again.
  await markMigrationsApplied(backup?.migrations);
  let inserted = 0;
  for (const [name, docs] of Object.entries(seed.collections)) {
    const Model = CollectionModels[name];
    if (docs.length && (await Model.estimatedDocumentCount()) === 0) {
      await Model.insertMany(docs);
      inserted++;
    }
  }
  if (!(await SingletonModels.profile.exists({}))) {
    await SingletonModels.profile.create(seed.profile);
    inserted++;
  }
  if (seed.theme && !(await SingletonModels.theme.exists({}))) await SingletonModels.theme.create(seed.theme);
  if (!inserted) log("[seed] The database already has portfolio content — nothing was added.");
  else if (backup) log(`[seed] Portfolio content restored from the backup copy taken ${backup.generatedAt}.`);
  else log("[seed] Default portfolio content inserted.");
  return true;
}

/**
 * Adds homepage sections missing from the database: ones the backup copy knows are put back where and
 * as they were (a section deleted by accident); new ones introduced since are added with their defaults.
 */
async function ensureSections() {
  const Sections = CollectionModels.sections;
  const existing = new Set((await Sections.find({}, { key: 1 }).lean()).map((doc) => doc.key));
  if (SECTION_KEYS.every((key) => existing.has(key))) return;
  const backup = bundledBackup();
  if (backup) await restoreSections(documentsFromBackup(backup).collections.sections);

  const restored = new Set((await Sections.find({}, { key: 1 }).lean()).map((doc) => doc.key));
  const missing = SECTION_KEYS.filter((key) => !restored.has(key));
  if (!missing.length) return;
  const last = await Sections.findOne().sort({ order: -1 }).select("order").lean();
  let order = (last?.order ?? -1) + 1;
  await Sections.insertMany(
    missing.map((key) => ({ ...DEFAULT_SECTIONS.find((section) => section.key === key), order: order++ }))
  );
}

/** Creates the first admin account from ADMIN_EMAIL / ADMIN_PASSWORD when none exists. */
async function ensureAdmin({ log = console.log } = {}) {
  if ((await Admin.estimatedDocumentCount()) > 0) {
    if (config.admin.password) {
      log("[admin] An admin account exists, so ADMIN_PASSWORD is no longer used — remove it from your environment.");
    }
    return;
  }
  const { email, password } = config.admin;
  if (!email || !password) {
    log("[admin] No admin account yet. Set ADMIN_EMAIL and ADMIN_PASSWORD, or run `npm run admin -- --email you@example.com`.");
    return;
  }
  if (password.length < config.minPasswordLength) {
    log(`[admin] ADMIN_PASSWORD must be at least ${config.minPasswordLength} characters — admin not created.`);
    return;
  }
  try {
    await Admin.create({ email, passwordHash: await bcrypt.hash(password, 12) });
    log(`[admin] Admin account created for ${email}.`);
  } catch (error) {
    if (error.code !== 11000) throw error;
  }
}

let bootstrapPromise;

/** Runs once per process (or serverless instance) before the first API request. */
export function ensureBootstrapped() {
  bootstrapPromise ??= (async () => {
    await seedIfNeeded();
    await runPendingMigrations();
    // Independent of each other, so they share a round trip to the database.
    await Promise.all([ensureSections(), ensureAdmin()]);
  })().catch((error) => {
    bootstrapPromise = undefined;
    throw error;
  });
  return bootstrapPromise;
}
