// Content migrations: one-off updates applied to existing databases on startup.
// Each runs once (tracked in the `meta` collection) and must be safe to re-run.
// Fresh databases are seeded with current content and skip the migrations it already includes.

import { Meta } from "../models/index.js";
import designCopyRefresh from "./2026-10-design-copy-refresh.js";
import logoHover from "./2026-10-logo-hover.js";
import siteName from "./2026-10-site-name.js";
import sqaProfileRefresh from "./2026-10-sqa-profile-refresh.js";

// Applied in this order. Never edit or remove one that may have run somewhere — add a new one instead.
const MIGRATIONS = [sqaProfileRefresh, designCopyRefresh, siteName, logoHover];

export const MIGRATION_IDS = MIGRATIONS.map((migration) => migration.id);

const LOCK_PREFIX = "migration:";
const lockKey = (id) => `${LOCK_PREFIX}${id}`;

/** Ids of the migrations this database has applied — recorded in backups, whose content includes them. */
export async function appliedMigrations() {
  const docs = await Meta.find({ key: { $in: MIGRATION_IDS.map(lockKey) }, "value.status": "applied" }, { key: 1 }).lean();
  return docs.map((doc) => doc.key.slice(LOCK_PREFIX.length));
}

/**
 * Records migrations as applied right after seeding a new database: all of them when it was seeded from
 * the current defaults, or the ones a backup's content already includes (newer ones then still run).
 */
export async function markMigrationsApplied(ids = MIGRATION_IDS) {
  await Promise.all(
    MIGRATIONS.filter((migration) => ids.includes(migration.id)).map((migration) =>
      Meta.updateOne(
        { key: lockKey(migration.id) },
        { $setOnInsert: { value: { status: "applied", at: new Date(), seeded: true } } },
        { upsert: true }
      )
    )
  );
}

/** Applies pending migrations in order. A lock document stops two instances running the same one. */
export async function runPendingMigrations({ log = console.log } = {}) {
  // One read finds the migrations already claimed (applied, or running elsewhere), so a start with nothing
  // to run costs a single round trip rather than a write per migration.
  const locked = new Set(
    (await Meta.find({ key: { $in: MIGRATION_IDS.map(lockKey) } }, { key: 1 }).lean()).map((doc) => doc.key)
  );
  for (const migration of MIGRATIONS) {
    if (locked.has(lockKey(migration.id))) continue;
    let claimed = false;
    try {
      const result = await Meta.updateOne(
        { key: lockKey(migration.id) },
        { $setOnInsert: { value: { status: "running", at: new Date() } } },
        { upsert: true }
      );
      claimed = result.upsertedCount === 1;
    } catch (error) {
      if (error.code !== 11000) throw error; // another instance claimed it first
    }
    if (!claimed) continue;

    log(`[migrate] Running ${migration.id} — ${migration.description}`);
    try {
      await migration.up({ log: (message) => log(`[migrate]   ${message}`) });
      await Meta.updateOne({ key: lockKey(migration.id) }, { $set: { value: { status: "applied", at: new Date() } } });
      log(`[migrate] ${migration.id} applied.`);
    } catch (error) {
      // Release the lock so the migration is retried on the next start.
      await Meta.deleteOne({ key: lockKey(migration.id) });
      throw error;
    }
  }
}
