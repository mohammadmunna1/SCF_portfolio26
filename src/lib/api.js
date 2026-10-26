// Same-origin by default (Vite proxies /api in development); set VITE_API_URL to use a separate API host.
export const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

export class ApiError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

/**
 * JSON fetch helper. Sends cookies and the CSRF header the API expects — except for a `preloaded` request:
 * the one index.html preloads (see vite.config.js), which must be a plain GET for the browser to hand
 * over the response it already has.
 */
export async function apiFetch(path, { method = "GET", body, headers, signal, raw = false, preloaded = false } = {}) {
  const init = preloaded
    ? { method, signal, headers: {} }
    : {
        method,
        signal,
        credentials: "include",
        headers: { "X-Requested-With": "XMLHttpRequest", ...headers },
      };
  if (body !== undefined) {
    if (raw) {
      init.body = body;
    } else {
      init.body = JSON.stringify(body);
      init.headers["Content-Type"] = "application/json";
    }
  }

  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, init);
  } catch (error) {
    if (error.name === "AbortError") throw error;
    throw new ApiError(0, "Can't reach the server. Check your connection and that the API is running.");
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError(response.status, data.error || `Request failed (${response.status})`, data.details);
  }
  return data;
}

/** Resolves uploaded-asset paths against the API host when it's on another origin. */
export const resolveAsset = (url) => (url && url.startsWith("/api/") ? `${API_BASE}${url}` : url || "");
