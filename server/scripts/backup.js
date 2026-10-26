// Updates the backup copy of the published portfolio, shared/fallback-content.json — what the site shows
// if the database is unavailable, and what an empty database is restored from. Commit it afterwards.
//   npm run backup                          → from the database in .env (MONGODB_URI)
//   npm run backup -- --url https://site    → from a deployed site's public API (no credentials needed)
//   npm run backup -- --full                → also save a complete private backup (hidden items included)
//                                             to backups/ — git-ignored; keep a copy somewhere safe
//   npm run backup -- --force               → write even if an essential section would end up empty
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { ESSENTIAL_LISTS, createBackupFile, isUsableContent, missingParts } from "../../shared/content-backup.js";
import { SECTION_KEYS } from "../../shared/schema.js";
import { connectDatabase, disconnectDatabase } from "../db.js";
import { BACKUP_FILE, bundledBackup, fingerprintOf } from "../lib/backup.js";
import { currentBackupFile, exportAllContent } from "../lib/restore.js";
import { MIGRATION_IDS } from "../migrations/index.js";
import { Asset } from "../models/index.js";

const ROOT = fileURLToPath(new URL("../../", import.meta.url));
const ASSET_DIR = "public/backup-assets";
const ASSET_URL = /^\/api\/assets\/([a-f0-9]{24})$/i;
const EXTENSIONS = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif", "image/avif": "avif" };

const { values } = parseArgs({
  options: {
    url: { type: "string" },
    full: { type: "boolean", default: false },
    force: { type: "boolean", default: false },
  },
});

/** The published content from a deployed site's public API. */
async function fromSite(url) {
  const origin = url.replace(/\/+$/, "");
  const response = await fetch(`${origin}/api/content`, { signal: AbortSignal.timeout(30_000) });
  if (!response.ok) throw new Error(`${origin}/api/content answered ${response.status} — is the site's database up?`);
  const content = await response.json();
  const visible = new Set((content.sections || []).map((section) => section.key));
  const file = createBackupFile(content, {
    source: `${origin}/api/content`,
    fingerprint: fingerprintOf(content),
    hiddenSections: SECTION_KEYS.filter((key) => !visible.has(key)),
    migrations: MIGRATION_IDS,
  });
  const readUpload = async (id) => {
    const asset = await fetch(`${origin}/api/assets/${id}`, { signal: AbortSignal.timeout(30_000) });
    if (!asset.ok) throw new Error(`uploaded image ${id} answered ${asset.status}`);
    return { data: Buffer.from(await asset.arrayBuffer()), contentType: asset.headers.get("content-type") };
  };
  return { file, readUpload };
}

/** The published content straight from the database. */
async function fromDatabase() {
  await connectDatabase();
  const readUpload = async (id) => {
    const asset = await Asset.findById(id);
    if (!asset) throw new Error(`uploaded image ${id} is not in the database`);
    return { data: asset.data, contentType: asset.contentType };
  };
  return { file: await currentBackupFile("database"), readUpload };
}

/**
 * Uploaded images are stored in the database, so the backup gets its own copies in public/backup-assets/
 * (served as static files) and points at those instead.
 */
async function copyUploads(content, readUpload) {
  const urls = new Set();
  const collect = (value) => {
    if (typeof value === "string" && ASSET_URL.test(value)) urls.add(value);
    else if (value && typeof value === "object") Object.values(value).forEach(collect);
  };
  collect(content);
  if (!urls.size) return { content, copied: [] };

  mkdirSync(path.join(ROOT, ASSET_DIR), { recursive: true });
  const copies = {};
  for (const url of urls) {
    const id = url.match(ASSET_URL)[1];
    const { data, contentType } = await readUpload(id);
    const name = `${id}.${EXTENSIONS[String(contentType).split(";")[0]] || "img"}`;
    writeFileSync(path.join(ROOT, ASSET_DIR, name), data);
    copies[url] = `/backup-assets/${name}`;
  }
  const rewrite = (value) => {
    if (typeof value === "string") return copies[value] ?? value;
    if (Array.isArray(value)) return value.map(rewrite);
    if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, rewrite(item)]));
    return value;
  };
  return { content: rewrite(content), copied: Object.values(copies) };
}

try {
  if (values.full && values.url) throw new Error("--full needs the database (it includes hidden items), so it can't be combined with --url.");
  const { file, readUpload } = values.url ? await fromSite(values.url) : await fromDatabase();

  if (!isUsableContent(file.content) || missingParts(file.content).length) {
    throw new Error("The source returned incomplete content, so the existing backup was kept.");
  }
  // Never swap a good backup for a damaged copy without being told to.
  const previous = bundledBackup()?.content;
  const emptied = ESSENTIAL_LISTS.filter((name) => previous?.[name]?.length && !file.content[name]?.length);
  if (emptied.length && !values.force) {
    throw new Error(
      `Not written: ${emptied.join(", ")} would be empty in the new backup but the current one has items. ` +
        "If you removed them on purpose, run again with --force."
    );
  }

  const { content, copied } = await copyUploads(file.content, readUpload);
  writeFileSync(BACKUP_FILE, `${JSON.stringify({ ...file, content }, null, 2)}\n`);

  console.log(`Backup copy written: shared/fallback-content.json (from ${file.source}, ${file.generatedAt})`);
  console.log(`  Sections: ${content.sections.map((section) => section.key).join(", ")}`);
  console.log(`  Items: ${ESSENTIAL_LISTS.map((name) => `${name} ${content[name].length}`).join(", ")}`);
  if (copied.length) console.log(`  Uploaded images copied to ${ASSET_DIR}/: ${copied.length}`);
  console.log(`  Next: commit shared/fallback-content.json${copied.length ? ` and ${ASSET_DIR}/` : ""}, then deploy.`);

  if (values.full) {
    const full = await exportAllContent();
    const dir = path.join(ROOT, "backups");
    mkdirSync(dir, { recursive: true });
    const name = `portfolio-full-${full.exportedAt.replace(/[:.]/g, "-")}.json`;
    writeFileSync(path.join(dir, name), `${JSON.stringify(full, null, 2)}\n`);
    console.log(`Full private backup written: backups/${name} (git-ignored — keep a copy somewhere safe).`);
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  if (!values.url) await disconnectDatabase();
}
