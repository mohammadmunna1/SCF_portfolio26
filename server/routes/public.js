import express from "express";
import mongoose from "mongoose";
import { config } from "../config.js";
import { CONTENT_CACHE_TAG } from "../lib/cdn.js";
import { getProfile, getPublicContent } from "../lib/content.js";
import { HttpError, asyncHandler, withTimeout } from "../lib/http.js";
import { sendContactEmail } from "../lib/mailer.js";
import { messageLimiter } from "../middleware/common.js";
import { Asset, Message } from "../models/index.js";

const router = express.Router();

// The site switches to its backup copy after 6 s, so a slower answer is better reported as a failure.
const CONTENT_TIMEOUT_MS = 5000;

router.get(
  "/content",
  asyncHandler(async (req, res) => {
    const content = await withTimeout(getPublicContent(), CONTENT_TIMEOUT_MS);
    // Browsers always revalidate (a cheap 304 thanks to the ETag), so published edits — like a new
    // palette — show on the next page load. The CDN answers from its copy straight away and refreshes it
    // in the background, so visitors don't wait for a cold function and the database; admin edits drop
    // the copy (contentChanged), so they still show on the next page load.
    res.set({
      "Cache-Control": "no-cache",
      "CDN-Cache-Control": "public, max-age=10, stale-while-revalidate=604800",
      "Vercel-Cache-Tag": CONTENT_CACHE_TAG,
    });
    res.json(content);
  })
);

const SUCCESS = "Thank you! Your message has been sent.";

const receiveMessage = (alwaysEmail) =>
  asyncHandler(async (req, res) => {
    const { name, email, subject, message, website } = req.body || {};
    // Honeypot field: real visitors never fill it in, bots usually do.
    if (website) return res.status(201).json({ ok: true, success: true, message: SUCCESS });

    const saved = await Message.create({ name, email, subject, message });
    if (alwaysEmail || config.mail.notifyOnMessage) {
      try {
        const { email: ownerEmail } = await getProfile();
        await sendContactEmail(saved, ownerEmail);
      } catch (error) {
        console.error("[mail] Could not send notification:", error.message);
      }
    }
    res.status(201).json({ ok: true, success: true, message: SUCCESS });
  });

const jsonBody = express.json({ limit: "20kb" });
router.post("/messages", messageLimiter, jsonBody, receiveMessage(false));
// Kept for compatibility with the original server.js contact endpoint.
router.post("/send-email", messageLimiter, jsonBody, receiveMessage(true));

router.get(
  "/assets/:id",
  asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) throw new HttpError(404, "Not found");
    const asset = await Asset.findById(req.params.id);
    if (!asset) throw new HttpError(404, "Not found");
    res.set({
      "Content-Type": asset.contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Security-Policy": "default-src 'none'",
      "Cross-Origin-Resource-Policy": "cross-origin",
    });
    res.send(asset.data);
  })
);

export default router;
