// Vercel's CDN keeps a copy of the public content under this tag (see GET /api/content).
export const CONTENT_CACHE_TAG = "content";

/**
 * Drops the CDN's copy of the public content after an admin edit, so the next page load shows the edit.
 * It is deleted rather than marked stale: a stale copy would still be served once more. The site has
 * little traffic, so the one request that then goes to the database is no burden.
 * Outside Vercel there is no CDN copy, and this does nothing.
 */
export async function contentChanged() {
  if (!process.env.VERCEL) return;
  try {
    // Loaded here, not at the top: only admin edits need it, and every cold start would pay for it.
    const { dangerouslyDeleteByTag } = await import("@vercel/functions");
    await dangerouslyDeleteByTag(CONTENT_CACHE_TAG);
  } catch (error) {
    // The edit is saved either way; the CDN then refreshes its copy on the next page load after that.
    console.error(`[cdn] Could not refresh the cached content: ${error.message}`);
  }
}
