import express from "express";
import mongoose from "mongoose";
import { ESSENTIAL_LISTS, ESSENTIAL_SECTIONS, usesUploadedImages } from "../../shared/content-backup.js";
import { COLLECTIONS, SINGLETONS, singletonFields } from "../../shared/schema.js";
import { DEFAULT_PROFILE } from "../../shared/default-content.js";
import { DEFAULT_THEME, checkThemeContrast, resolveTheme } from "../../shared/theme.js";
import { config } from "../config.js";
import { ALLOWED_IMAGE_TYPES, assetUrlsIn, detectImageType, releaseAssets } from "../lib/assets.js";
import { bundledBackup, fingerprintOf } from "../lib/backup.js";
import { contentChanged } from "../lib/cdn.js";
import { COLLECTION_NAMES, loadPublicContent, sanitizeInput, setEmptiedOnPurpose, toAdminItem } from "../lib/content.js";
import { currentBackupFile, exportAllContent } from "../lib/restore.js";
import { HttpError, asyncHandler } from "../lib/http.js";
import { requireAdmin, requireAjaxHeader } from "../middleware/auth.js";
import { Asset, CollectionModels, Message, SingletonModels } from "../models/index.js";

const router = express.Router();
router.use(requireAjaxHeader, requireAdmin);

const json = express.json({ limit: "200kb" });

const assertObjectId = (id) => {
  if (!mongoose.isValidObjectId(id)) throw new HttpError(404, "Item not found.");
};

/** Resolves :name to its schema definition and model. */
router.param("name", (req, res, next, name) => {
  if (!Object.hasOwn(COLLECTIONS, name)) return next(new HttpError(404, "Unknown collection."));
  req.collection = { name, definition: COLLECTIONS[name], Model: CollectionModels[name] };
  next();
});

router.get(
  "/overview",
  asyncHandler(async (req, res) => {
    const [counts, unread, totalMessages, recentMessages, { filled }] = await Promise.all([
      Promise.all(
        COLLECTION_NAMES.map(async (name) => [
          name,
          {
            total: await CollectionModels[name].countDocuments(),
            visible: await CollectionModels[name].countDocuments({ visible: true }),
          },
        ])
      ),
      Message.countDocuments({ read: false }),
      Message.countDocuments(),
      Message.find().sort({ createdAt: -1 }).limit(5).lean(),
      loadPublicContent(),
    ]);
    res.json({
      counts: Object.fromEntries(counts),
      messages: { total: totalMessages, unread, recent: recentMessages.map(toAdminItem) },
      database: { name: mongoose.connection.name, accountEmail: config.mongoAccountEmail },
      // Parts the public site is showing from the backup copy because they're missing from the database
      backupFilled: filled,
    });
  })
);

// ---- Collections -------------------------------------------------------------

router.get(
  "/collections/:name",
  asyncHandler(async (req, res) => {
    const items = await req.collection.Model.find().sort({ order: 1, _id: 1 }).lean();
    res.json({ items: items.map(toAdminItem) });
  })
);

router.post(
  "/collections/:name",
  json,
  asyncHandler(async (req, res) => {
    const { definition, Model } = req.collection;
    if (definition.fixed) throw new HttpError(405, `${definition.label} can't be added or removed.`);
    const last = await Model.findOne().sort({ order: -1 }).select("order").lean();
    const doc = new Model({ ...sanitizeInput(definition.fields, req.body), order: (last?.order ?? -1) + 1 });
    await doc.save();
    await setEmptiedOnPurpose(req.collection.name, false);
    await contentChanged();
    res.status(201).json({ item: toAdminItem(doc) });
  })
);

// Registered before "/:id" so "order" isn't treated as an id.
router.put(
  "/collections/:name/order",
  json,
  asyncHandler(async (req, res) => {
    const ids = req.body?.ids;
    if (!Array.isArray(ids) || !ids.every((id) => mongoose.isValidObjectId(id))) {
      throw new HttpError(400, "Expected a list of item ids.");
    }
    await req.collection.Model.bulkWrite(
      ids.map((id, order) => ({ updateOne: { filter: { _id: id }, update: { $set: { order } } } }))
    );
    await contentChanged();
    res.json({ ok: true });
  })
);

router.put(
  "/collections/:name/:id",
  json,
  asyncHandler(async (req, res) => {
    const { definition, Model } = req.collection;
    assertObjectId(req.params.id);
    const doc = await Model.findById(req.params.id);
    if (!doc) throw new HttpError(404, "Item not found.");
    const previousAssets = assetUrlsIn(doc, definition.fields);
    doc.set(sanitizeInput(definition.fields, req.body));
    await doc.save();
    const currentAssets = new Set(assetUrlsIn(doc, definition.fields));
    await releaseAssets(previousAssets.filter((url) => !currentAssets.has(url)));
    await contentChanged();
    res.json({ item: toAdminItem(doc) });
  })
);

router.delete(
  "/collections/:name/:id",
  asyncHandler(async (req, res) => {
    const { definition, Model } = req.collection;
    if (definition.fixed) throw new HttpError(405, `${definition.label} can't be added or removed.`);
    assertObjectId(req.params.id);
    const doc = await Model.findByIdAndDelete(req.params.id).lean();
    if (!doc) throw new HttpError(404, "Item not found.");
    await releaseAssets(assetUrlsIn(doc, definition.fields));
    // Deleting the last item here is a choice, not data loss: the site mustn't refill it from the backup.
    if (!(await Model.exists({}))) await setEmptiedOnPurpose(req.collection.name, true);
    await contentChanged();
    res.json({ ok: true });
  })
);

// ---- Singletons (profile, theme) ---------------------------------------------

router.param("key", (req, res, next, key) => {
  if (!Object.hasOwn(SINGLETONS, key)) return next(new HttpError(404, "Unknown settings group."));
  req.singleton = { key, fields: singletonFields(key), Model: SingletonModels[key] };
  next();
});

const singletonDefaults = { profile: DEFAULT_PROFILE, theme: DEFAULT_THEME };

/** A palette is only published if its text stays readable (same rules as the admin editor). */
function assertReadableTheme(doc) {
  const { errors } = checkThemeContrast(resolveTheme(doc.toObject()));
  if (!errors.length) return;
  const details = Object.fromEntries(
    errors.map((error) => [error.fg, `${error.label}: contrast ${error.ratio.toFixed(2)}:1, needs ${error.min}:1`])
  );
  throw new HttpError(400, "Some colour combinations are too low-contrast to read.", details);
}

router.get(
  "/singletons/:key",
  asyncHandler(async (req, res) => {
    const { key, Model } = req.singleton;
    const doc = await Model.findOne().lean();
    const { _id, __v, ...data } = doc || {};
    res.json({ data: { ...singletonDefaults[key], ...data } });
  })
);

router.put(
  "/singletons/:key",
  json,
  asyncHandler(async (req, res) => {
    const { key, fields, Model } = req.singleton;
    const doc = (await Model.findOne()) || new Model();
    const previousAssets = assetUrlsIn(doc, fields);
    doc.set(sanitizeInput(fields, req.body));
    if (key === "theme") {
      await doc.validate(); // reports malformed hex values first
      assertReadableTheme(doc);
    }
    await doc.save();
    const currentAssets = new Set(assetUrlsIn(doc, fields));
    await releaseAssets(previousAssets.filter((url) => !currentAssets.has(url)));
    await contentChanged();
    const { _id, __v, ...data } = doc.toObject();
    res.json({ data });
  })
);

// ---- Uploads -----------------------------------------------------------------

router.post(
  "/assets",
  express.raw({ type: () => true, limit: config.uploadLimitBytes }),
  asyncHandler(async (req, res) => {
    const contentType = String(req.get("content-type") || "").split(";")[0].trim().toLowerCase();
    if (!ALLOWED_IMAGE_TYPES.has(contentType)) {
      throw new HttpError(415, "Upload a JPEG, PNG, WebP, GIF or AVIF image.");
    }
    if (!Buffer.isBuffer(req.body) || req.body.length === 0) throw new HttpError(400, "The upload was empty.");
    if (detectImageType(req.body) !== contentType) {
      throw new HttpError(415, "The file content doesn't match its image type.");
    }
    const name = String(req.get("x-file-name") || "").slice(0, 200);
    const asset = await Asset.create({ data: req.body, contentType, size: req.body.length, name });
    res.status(201).json({ id: String(asset._id), url: `/api/assets/${asset._id}` });
  })
);

// ---- Messages ----------------------------------------------------------------

router.get(
  "/messages",
  asyncHandler(async (req, res) => {
    const items = await Message.find().sort({ createdAt: -1 }).limit(500).lean();
    res.json({ items: items.map(toAdminItem) });
  })
);

router.patch(
  "/messages/:id",
  json,
  asyncHandler(async (req, res) => {
    assertObjectId(req.params.id);
    const item = await Message.findByIdAndUpdate(
      req.params.id,
      { $set: { read: req.body?.read === true } },
      { returnDocument: "after" }
    ).lean();
    if (!item) throw new HttpError(404, "Message not found.");
    res.json({ item: toAdminItem(item) });
  })
);

router.delete(
  "/messages/:id",
  asyncHandler(async (req, res) => {
    assertObjectId(req.params.id);
    const result = await Message.deleteOne({ _id: req.params.id });
    if (!result.deletedCount) throw new HttpError(404, "Message not found.");
    res.json({ ok: true });
  })
);

// ---- Backup ------------------------------------------------------------------

const countsOf = (content) => Object.fromEntries(ESSENTIAL_LISTS.map((name) => [name, content?.[name]?.length ?? 0]));

/** The bundled backup copy (shared/fallback-content.json) compared with what the site publishes now. */
router.get(
  "/backup",
  asyncHandler(async (req, res) => {
    const { content, filled } = await loadPublicContent();
    const bundled = bundledBackup();
    res.json({
      essentialSections: Object.keys(ESSENTIAL_SECTIONS),
      bundled: bundled && {
        generatedAt: bundled.generatedAt,
        source: bundled.source,
        sections: bundled.content.sections.map((section) => section.key),
        counts: countsOf(bundled.content),
      },
      live: {
        sections: content.sections.map((section) => section.key),
        counts: countsOf(content),
        usesUploadedImages: usesUploadedImages(content),
      },
      upToDate: Boolean(bundled) && bundled.fingerprint === fingerprintOf(content),
      filled,
    });
  })
);

/** A new backup file of the published content — replaces shared/fallback-content.json in the code. */
router.get(
  "/backup/file",
  asyncHandler(async (req, res) => {
    const file = await currentBackupFile("admin download");
    res.set({ "Content-Disposition": 'attachment; filename="fallback-content.json"', "Cache-Control": "no-store" });
    res.type("application/json").send(`${JSON.stringify(file, null, 2)}\n`);
  })
);

/** Full private backup: all content, hidden items included (not messages or accounts). Restore: npm run restore. */
router.get(
  "/export",
  asyncHandler(async (req, res) => {
    const backup = await exportAllContent();
    const date = backup.exportedAt.slice(0, 10);
    res.set({ "Content-Disposition": `attachment; filename="portfolio-backup-${date}.json"`, "Cache-Control": "no-store" });
    res.json(backup);
  })
);

export default router;
