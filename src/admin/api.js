import { API_BASE, ApiError, apiFetch } from "../lib/api";

const collection = (name) => `/api/admin/collections/${name}`;

/** Saves a file the API sends as an attachment (with the session cookie). */
async function download(path, fallbackName) {
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: { "X-Requested-With": "XMLHttpRequest" },
  });
  if (!response.ok) throw new ApiError(response.status, "Could not download the file.");
  const blob = await response.blob();
  const name = response.headers.get("Content-Disposition")?.match(/filename="(.+)"/)?.[1] || fallbackName;
  const url = URL.createObjectURL(blob);
  const link = Object.assign(document.createElement("a"), { href: url, download: name });
  link.click();
  URL.revokeObjectURL(url);
}

// Header values must be ASCII.
const asciiName = (name = "image") => name.replace(/[^\x20-\x7E]/g, "_").slice(0, 120);

export const adminApi = {
  me: () => apiFetch("/api/auth/me").then((data) => data.admin),
  login: (email, password) => apiFetch("/api/auth/login", { method: "POST", body: { email, password } }).then((data) => data.admin),
  logout: () => apiFetch("/api/auth/logout", { method: "POST" }),
  changePassword: (currentPassword, newPassword) =>
    apiFetch("/api/auth/password", { method: "PUT", body: { currentPassword, newPassword } }),

  overview: () => apiFetch("/api/admin/overview"),

  list: (name) => apiFetch(collection(name)).then((data) => data.items),
  create: (name, item) => apiFetch(collection(name), { method: "POST", body: item }).then((data) => data.item),
  update: (name, id, changes) => apiFetch(`${collection(name)}/${id}`, { method: "PUT", body: changes }).then((data) => data.item),
  remove: (name, id) => apiFetch(`${collection(name)}/${id}`, { method: "DELETE" }),
  reorder: (name, ids) => apiFetch(`${collection(name)}/order`, { method: "PUT", body: { ids } }),

  getSingleton: (key) => apiFetch(`/api/admin/singletons/${key}`).then((data) => data.data),
  saveSingleton: (key, values) => apiFetch(`/api/admin/singletons/${key}`, { method: "PUT", body: values }).then((data) => data.data),

  upload: (blob, fileName) =>
    apiFetch("/api/admin/assets", {
      method: "POST",
      body: blob,
      raw: true,
      headers: { "Content-Type": blob.type, "X-File-Name": asciiName(fileName) },
    }),

  messages: () => apiFetch("/api/admin/messages").then((data) => data.items),
  markMessage: (id, read) => apiFetch(`/api/admin/messages/${id}`, { method: "PATCH", body: { read } }).then((data) => data.item),
  deleteMessage: (id) => apiFetch(`/api/admin/messages/${id}`, { method: "DELETE" }),

  backupStatus: () => apiFetch("/api/admin/backup"),
  /** The backup copy the site falls back on (replaces shared/fallback-content.json in the code). */
  downloadBackupFile: () => download("/api/admin/backup/file", "fallback-content.json"),
  /** Full private backup: all content, hidden items included. */
  downloadBackup: () => download("/api/admin/export", "portfolio-backup.json"),
};
