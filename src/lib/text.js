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

/** "5+" → { prefix: "", number: 5, suffix: "+" }, so stats can count up. */
export function parseStat(value = "") {
  const match = String(value).match(/^(\D*?)(\d+(?:\.\d+)?)(.*)$/);
  if (!match) return null;
  return { prefix: match[1], number: Number(match[2]), suffix: match[3], decimals: (match[2].split(".")[1] || "").length };
}

export const isExternal = (url = "") => /^https?:\/\//i.test(url);

export const unique = (list) => [...new Set(list)];
