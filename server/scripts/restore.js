// Restores portfolio content into the database (MONGODB_URI in .env) from the backup copy.
//   npm run restore                   → dry run: lists what is missing and would be put back
//   npm run restore -- --missing      → puts back only what is missing (lists with no items, a deleted
//                                       profile, palette or section) — existing content is never changed
//   npm run restore -- --all          → replaces ALL portfolio content with the backup; a full copy of
//                                       the current content is saved to backups/ first
//   --file <path>                     → restore from another file instead of shared/fallback-content.json:
//                                       an older backup file, or a full backup from Admin → Backup
// Messages, uploaded images and admin accounts are never touched (re-create an admin: npm run admin).
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { connectDatabase, disconnectDatabase } from "../db.js";
import { BACKUP_FILE } from "../lib/backup.js";
import { documentsFromFile, exportAllContent, restoreAll, restoreMissing } from "../lib/restore.js";

const ROOT = fileURLToPath(new URL("../../", import.meta.url));

const { values } = parseArgs({
  options: {
    missing: { type: "boolean", default: false },
    all: { type: "boolean", default: false },
    file: { type: "string" },
  },
});

try {
  if (values.missing && values.all) throw new Error("Choose either --missing or --all.");
  const filePath = values.file ? path.resolve(values.file) : fileURLToPath(BACKUP_FILE);
  const source = documentsFromFile(JSON.parse(readFileSync(filePath, "utf8")));
  if (!source) throw new Error(`${filePath} is not a backup file or a full backup.`);
  console.log(`Source: ${path.relative(ROOT, filePath) || filePath} (${source.kind}, ${source.date})`);

  await connectDatabase();

  if (values.all) {
    const current = await exportAllContent();
    const dir = path.join(ROOT, "backups");
    mkdirSync(dir, { recursive: true });
    const name = `before-restore-${current.exportedAt.replace(/[:.]/g, "-")}.json`;
    writeFileSync(path.join(dir, name), `${JSON.stringify(current, null, 2)}\n`);
    console.log(`Current content saved to backups/${name} (restore it with --all --file backups/${name}).`);
    await restoreAll(source);
    console.log("All portfolio content was replaced with the backup.");
  } else {
    const { changes, skipped } = await restoreMissing(source, { dryRun: !values.missing });
    if (!changes.length) console.log("Nothing is missing — the database already has all of this content.");
    else {
      console.log(values.missing ? "Restored:" : "Missing from the database (run with --missing to put it back):");
      for (const change of changes) console.log(`  • ${change}`);
    }
    for (const item of skipped) console.log(`  – skipped: ${item}`);
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await disconnectDatabase();
}
