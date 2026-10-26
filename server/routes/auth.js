import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import express from "express";
import { config } from "../config.js";
import { HttpError, asyncHandler } from "../lib/http.js";
import { clearSession, issueSession, readSession, requireAdmin, requireAjaxHeader } from "../middleware/auth.js";
import { loginLimiter } from "../middleware/common.js";
import { Admin } from "../models/index.js";

const router = express.Router();
router.use(express.json({ limit: "10kb" }), requireAjaxHeader);

const MAX_FAILED_LOGINS = 5;
const LOCK_MINUTES = 15;

// Compared against when the email is unknown, so response time doesn't reveal which emails exist.
let dummyHash;
const getDummyHash = async () => (dummyHash ??= await bcrypt.hash(crypto.randomUUID(), 12));

router.post(
  "/login",
  loginLimiter,
  asyncHandler(async (req, res) => {
    const email = String(req.body?.email || "").trim().toLowerCase();
    const password = String(req.body?.password || "");
    if (!email || !password) throw new HttpError(400, "Email and password are required.");

    const admin = await Admin.findOne({ email });
    if (admin?.lockUntil && admin.lockUntil > new Date()) {
      throw new HttpError(429, `Too many failed attempts. Try again in ${LOCK_MINUTES} minutes.`);
    }

    const valid = await bcrypt.compare(password, admin?.passwordHash || (await getDummyHash()));
    if (!admin || !valid) {
      if (admin) {
        admin.failedLogins += 1;
        if (admin.failedLogins >= MAX_FAILED_LOGINS) {
          admin.failedLogins = 0;
          admin.lockUntil = new Date(Date.now() + LOCK_MINUTES * 60 * 1000);
        }
        await admin.save();
      }
      throw new HttpError(401, "Invalid email or password.");
    }

    admin.failedLogins = 0;
    admin.lockUntil = null;
    admin.lastLoginAt = new Date();
    await admin.save();
    issueSession(res, admin);
    res.json({ admin: { email: admin.email } });
  })
);

router.post("/logout", (req, res) => {
  clearSession(res);
  res.json({ ok: true });
});

// Signed-out visitors get { admin: null } rather than an error, so the login check stays quiet.
router.get(
  "/me",
  asyncHandler(async (req, res) => {
    const admin = await readSession(req);
    res.json({ admin: admin ? { email: admin.email } : null });
  })
);

router.put(
  "/password",
  requireAdmin,
  asyncHandler(async (req, res) => {
    const currentPassword = String(req.body?.currentPassword || "");
    const newPassword = String(req.body?.newPassword || "");
    if (newPassword.length < config.minPasswordLength) {
      throw new HttpError(400, `Use at least ${config.minPasswordLength} characters.`, {
        newPassword: `Use at least ${config.minPasswordLength} characters.`,
      });
    }
    const admin = await Admin.findById(req.admin.id);
    if (!(await bcrypt.compare(currentPassword, admin.passwordHash))) {
      throw new HttpError(400, "Your current password is incorrect.", {
        currentPassword: "Incorrect password.",
      });
    }
    admin.passwordHash = await bcrypt.hash(newPassword, 12);
    admin.tokenVersion += 1; // signs out every other session
    await admin.save();
    issueSession(res, admin);
    res.json({ ok: true });
  })
);

export default router;
