import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  CONTENT_LISTS,
  isUsableContent,
  missingParts,
  readBackupFile,
  usesUploadedImages,
  withParts,
} from "../../shared/content-backup.js";
import { resolveTheme } from "../../shared/theme.js";
import { apiFetch } from "../lib/api";
import { CONTENT_CACHE_KEY } from "../lib/theme";

// Without valid live content by then, the backup copy is shown (live content still replaces it if it arrives).
const BACKUP_AFTER_MS = 6000;
// While the backup is showing, the API is tried again after these delays, so the site recovers on its own.
const RETRY_DELAYS_MS = [20_000, 60_000, 180_000];

const ContentContext = createContext(null);

/** Guarantees every list exists (and the palette is complete) so components can use them safely. */
function normalizeContent(data) {
  const content = { profile: { ...(data?.profile || {}) }, theme: resolveTheme(data?.theme) };
  for (const key of CONTENT_LISTS) content[key] = Array.isArray(data?.[key]) ? data[key] : [];
  return content;
}

/** This browser's copy of the last valid live content (instant first paint on the next visit), or null. */
const readCache = () => {
  try {
    const { savedAt, ...data } = JSON.parse(localStorage.getItem(CONTENT_CACHE_KEY) || "null") || {};
    if (!isUsableContent(data) || missingParts(data).length) return null;
    return { content: normalizeContent(data), savedAt: Date.parse(savedAt) || 0 };
  } catch {
    return null;
  }
};

const writeCache = (content) => {
  try {
    localStorage.setItem(CONTENT_CACHE_KEY, JSON.stringify({ ...content, savedAt: new Date().toISOString() }));
    localStorage.removeItem("portfolio:content:v1"); // cache from the previous design
  } catch {
    // Storage can be unavailable (private mode, quota) — the cache is only an optimisation.
  }
};

// The backup copy of the published content (shared/fallback-content.json), downloaded only when needed.
// Should that file ever be unusable, the original default content is the last resort.
let backupRequest;
const loadBackup = () =>
  (backupRequest ??= import("../../shared/fallback-content.json")
    .then(({ default: file }) => {
      const backup = readBackupFile(file);
      if (!backup) throw new Error("The backup copy is not valid.");
      return { content: normalizeContent(backup.content), savedAt: Date.parse(backup.generatedAt) || 0 };
    })
    .catch(() =>
      import("../../shared/default-content.js").then(({ DEFAULT_CONTENT }) => ({
        content: normalizeContent(DEFAULT_CONTENT),
        savedAt: 0,
      }))
    )
    .catch((error) => {
      backupRequest = undefined; // offline: try again next time
      throw error;
    }));

const setMeta = (name, value) => {
  if (!value) return;
  let tag = document.querySelector(`meta[name="${name}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.name = name;
    document.head.appendChild(tag);
  }
  tag.content = value;
};

/**
 * Loads the portfolio content. The database (through the API) is the source whenever it answers with
 * valid content. When it can't — the API or database is down, slow, or answers with an error or broken
 * data — the backup copy bundled with the site is shown instead, unless this browser holds a newer copy
 * of live content. A partial answer is completed from the backup. Nothing here ever writes to the
 * database, and live content replaces the backup as soon as the API answers again.
 */
export function ContentProvider({ children }) {
  const [state, setState] = useState(() => {
    const cached = readCache();
    return cached ? { ...cached, source: "cache" } : { content: null, savedAt: 0, source: "loading" };
  });

  useEffect(() => {
    const controller = new AbortController();
    let live = false;
    let retries = 0;
    let retryTimer;

    const showBackup = () =>
      loadBackup()
        .then((backup) => {
          if (controller.signal.aborted || live) return;
          setState((current) => {
            // A newer copy of live content stays — as long as its images don't need the database.
            const keep =
              current.content &&
              (current.source === "backup" || (current.savedAt >= backup.savedAt && !usesUploadedImages(current.content)));
            return keep ? current : { ...backup, source: "backup" };
          });
        })
        .catch(() => {}); // offline and nothing to show: the preloader stays until a retry succeeds

    const load = async () => {
      try {
        // Requested by index.html already, while the scripts were still downloading.
        const data = await apiFetch("/api/content", { signal: controller.signal, preloaded: true });
        if (!isUsableContent(data)) throw new Error("The API answered with invalid content");
        const missing = missingParts(data);
        const complete = missing.length ? withParts(data, (await loadBackup()).content, missing) : data;
        if (controller.signal.aborted) return;
        live = true;
        const content = normalizeContent(complete);
        if (!missing.length) writeCache(content);
        setState({ content, savedAt: Date.now(), source: missing.length ? "live+backup" : "live" });
      } catch (error) {
        if (controller.signal.aborted) return;
        console.info(`[content] ${error.message} — showing the backup copy.`);
        showBackup();
        if (retries < RETRY_DELAYS_MS.length) retryTimer = setTimeout(load, RETRY_DELAYS_MS[retries++]);
      }
    };

    const timer = setTimeout(showBackup, BACKUP_AFTER_MS);
    load().finally(() => clearTimeout(timer));

    return () => {
      controller.abort();
      clearTimeout(timer);
      clearTimeout(retryTimer);
    };
  }, []);

  // Which copy is on screen (live, cache, backup…), for QA checks and debugging.
  useEffect(() => {
    document.documentElement.dataset.contentSource = state.source;
  }, [state.source]);

  const profile = state.content?.profile;
  useEffect(() => {
    if (!profile) return;
    if (profile.siteTitle) document.title = profile.siteTitle;
    setMeta("description", profile.siteDescription);
  }, [profile]);

  const value = useMemo(() => state, [state]);
  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

export function useContentState() {
  const context = useContext(ContentContext);
  if (!context) throw new Error("useContentState must be used inside <ContentProvider>");
  return context;
}

/** The portfolio content (only call below the preloader, once content is available). */
export const useContent = () => useContentState().content;
