/** Splits text into paragraphs on blank lines. */
export const paragraphs = (text = "") =>
  String(text)
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .filter(Boolean);

export const hostname = (url = "") => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
};

export const isExternal = (url = "") => /^https?:\/\//i.test(url);

/** 3 → "03" — section and step numbers. */
export const twoDigits = (number) => String(number).padStart(2, "0");

/** Props for a CV link: a file served by the site downloads; a shared link (e.g. Google Drive) opens in a new tab. */
export const cvLinkProps = (url = "") => (url.startsWith("/") ? { download: "" } : {});

export const unique = (list) => [...new Set(list)];
