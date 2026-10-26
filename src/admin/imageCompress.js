const ACCEPTED = /^image\/(jpeg|png|webp|gif|avif)$/;
const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

/**
 * Downscales and re-encodes an image in the browser before upload (WebP where supported),
 * so uploads stay small and the public site stays fast. GIFs are kept as-is to preserve animation.
 */
export async function compressImage(file, { maxSize = 1800, quality = 0.84 } = {}) {
  if (!ACCEPTED.test(file.type)) throw new Error("Please choose a JPEG, PNG, WebP, GIF or AVIF image.");

  let output = file;
  if (file.type !== "image/gif") {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close?.();
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/webp", quality));
    if (blob && ACCEPTED.test(blob.type) && blob.size < file.size) output = blob;
  }

  if (output.size > MAX_UPLOAD_BYTES) throw new Error("That image is too large (max 4 MB after compression).");
  return output;
}
