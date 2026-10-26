// Creates an admin account, or resets its password (which also signs out its sessions).
//   npm run admin -- --email you@example.com                  → generates a strong password
//   npm run admin -- --email you@example.com --password '…'   → uses the given password
// Falls back to ADMIN_EMAIL / ADMIN_PASSWORD from .env.
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { parseArgs } from "node:util";
import { config } from "../config.js";
import { connectDatabase, disconnectDatabase } from "../db.js";
import { Admin } from "../models/index.js";

const { values } = parseArgs({ options: { email: { type: "string" }, password: { type: "string" } } });

const email = (values.email || config.admin.email).trim().toLowerCase();
let password = values.password || config.admin.password;
const generated = !password;
if (generated) password = crypto.randomBytes(15).toString("base64url");

try {
  if (!email) throw new Error("Usage: npm run admin -- --email you@example.com [--password '…']");
  if (password.length < config.minPasswordLength) {
    throw new Error(`The password must be at least ${config.minPasswordLength} characters.`);
  }
  await connectDatabase();
  const passwordHash = await bcrypt.hash(password, 12);
  const existing = await Admin.findOne({ email });
  if (existing) {
    Object.assign(existing, { passwordHash, failedLogins: 0, lockUntil: null });
    existing.tokenVersion += 1;
    await existing.save();
    console.log(`Password reset for ${email}.`);
  } else {
    await Admin.create({ email, passwordHash });
    console.log(`Admin account created for ${email}.`);
  }
  if (generated) console.log(`Generated password: ${password}\nSign in at /admin and change it under Account.`);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await disconnectDatabase();
}
