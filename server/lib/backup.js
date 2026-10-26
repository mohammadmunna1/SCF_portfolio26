import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { canonicalJson, readBackupFile } from "../../shared/content-backup.js";

/** The committed backup copy. vercel.json lists it under `includeFiles`, so the serverless API ships with it. */
export const BACKUP_FILE = new URL("../../shared/fallback-content.json", import.meta.url);

let bundled;

/** The bundled backup file (shared/fallback-content.json), or null when it's missing or invalid. Read once. */
export function bundledBackup() {
  if (bundled !== undefined) return bundled;
  try {
    bundled = readBackupFile(JSON.parse(readFileSync(BACKUP_FILE, "utf8")));
    if (!bundled) console.error("[backup] shared/fallback-content.json is not a valid backup file — it is ignored.");
  } catch (error) {
    console.error(`[backup] Could not read shared/fallback-content.json: ${error.message}`);
    bundled = null;
  }
  return bundled;
}

/** Short fingerprint of public content — tells whether the backup still matches what's published. */
export const fingerprintOf = (content) =>
  createHash("sha256")
    .update(canonicalJson(JSON.parse(JSON.stringify(content))))
    .digest("hex")
    .slice(0, 16);
