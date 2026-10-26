import { COLLECTIONS, singletonFields, SINGLETONS } from "../../shared/schema.js";
import { Asset, CollectionModels, SingletonModels } from "../models/index.js";

export const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"]);

const ASSET_URL = /^\/api\/assets\/([a-f0-9]{24})$/i;

/** Identifies an image by its magic bytes so the declared type can't lie. SVG is deliberately unsupported. */
export function detectImageType(buffer) {
  if (buffer.length < 12) return null;
  const ascii = (start, end) => buffer.toString("ascii", start, end);
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return "image/jpeg";
  if (buffer.readUInt32BE(0) === 0x89504e47 && buffer.readUInt32BE(4) === 0x0d0a1a0a) return "image/png";
  if (ascii(0, 6) === "GIF87a" || ascii(0, 6) === "GIF89a") return "image/gif";
  if (ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return "image/webp";
  if (ascii(4, 12) === "ftypavif" || ascii(4, 12) === "ftypavis") return "image/avif";
  return null;
}

const imageFieldsOf = (fields) => fields.filter((field) => field.type === "image").map((field) => field.name);

const referenceTargets = [
  ...Object.entries(COLLECTIONS).map(([name, def]) => [CollectionModels[name], imageFieldsOf(def.fields)]),
  ...Object.keys(SINGLETONS).map((key) => [SingletonModels[key], imageFieldsOf(singletonFields(key))]),
].filter(([, fields]) => fields.length);

/** Asset URLs found in the image fields of a document. */
export function assetUrlsIn(doc, fields) {
  return imageFieldsOf(fields)
    .map((name) => doc?.[name])
    .filter((value) => typeof value === "string" && ASSET_URL.test(value));
}

/** Deletes uploaded images that are no longer referenced anywhere. */
export async function releaseAssets(urls) {
  for (const url of new Set(urls)) {
    const [, id] = url.match(ASSET_URL) || [];
    if (!id) continue;
    const checks = await Promise.all(
      referenceTargets.map(([Model, fields]) => Model.exists({ $or: fields.map((name) => ({ [name]: url })) }))
    );
    if (!checks.some(Boolean)) await Asset.deleteOne({ _id: id });
  }
}
