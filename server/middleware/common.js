import mongoose from "mongoose";
import { rateLimit } from "express-rate-limit";
import { ensureBootstrapped } from "../bootstrap.js";
import { connectDatabase } from "../db.js";
import { asyncHandler } from "../lib/http.js";

export const withDatabase = asyncHandler(async (req, res, next) => {
  await connectDatabase();
  await ensureBootstrapped();
  next();
});

const limiter = (windowMinutes, limit, error) =>
  rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    limit,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { error },
  });

export const loginLimiter = limiter(15, 20, "Too many login attempts. Please try again in a few minutes.");
export const messageLimiter = limiter(10, 5, "Too many messages. Please try again a little later.");

export function notFound(req, res) {
  res.status(404).json({ error: "Not found" });
}

// eslint-disable-next-line no-unused-vars -- Express identifies error handlers by their four arguments
export function errorHandler(error, req, res, next) {
  if (error instanceof mongoose.Error.ValidationError) {
    const details = Object.fromEntries(Object.entries(error.errors).map(([path, err]) => [path, err.message]));
    return res.status(400).json({ error: Object.values(details)[0] || "Invalid data.", details });
  }
  if (error instanceof mongoose.Error.CastError) {
    return res.status(400).json({ error: `Invalid value for ${error.path}.` });
  }
  if (error.type === "entity.too.large") return res.status(413).json({ error: "The upload is too large (max 4 MB)." });
  if (error.type === "entity.parse.failed") return res.status(400).json({ error: "Malformed JSON body." });
  if (error.code === 11000) return res.status(409).json({ error: "That entry already exists." });

  const status = error.status || 500;
  if (status >= 500 && !error.expose) console.error(error);
  // A failure must never be cached by the browser or the CDN: the next request should try again.
  if (status >= 500) res.set("Cache-Control", "no-store");
  res.status(status).json({
    error: error.expose ? error.message : "Something went wrong. Please try again.",
    ...(error.details && { details: error.details }),
  });
}
