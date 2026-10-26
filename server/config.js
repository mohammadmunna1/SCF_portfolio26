import "dotenv/config";
import crypto from "node:crypto";

const env = process.env;

export const isProduction = env.NODE_ENV === "production" || Boolean(env.VERCEL);

const sessionDays = Math.max(1, Number(env.SESSION_DAYS) || 7);

// A stable secret is required in production; in development we fall back to a
// random one so the admin panel works out of the box (sessions reset on restart).
let jwtSecret = env.JWT_SECRET && env.JWT_SECRET.length >= 32 ? env.JWT_SECRET : null;
const jwtSecretIsEphemeral = !jwtSecret && !isProduction;
if (jwtSecretIsEphemeral) jwtSecret = crypto.randomBytes(48).toString("hex");

const sameSite = (env.COOKIE_SAMESITE || "strict").toLowerCase();

export const config = {
  isProduction,
  port: Number(env.PORT) || 3001,
  mongoUri: env.MONGODB_URI || "",
  jwtSecret,
  jwtSecretIsEphemeral,
  sessionDays,
  cookieName: "portfolio_admin",
  cookieSameSite: ["strict", "lax", "none"].includes(sameSite) ? sameSite : "strict",
  corsOrigins: (env.CORS_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  admin: {
    email: (env.ADMIN_EMAIL || "").trim().toLowerCase(),
    password: env.ADMIN_PASSWORD || "",
  },
  mail: {
    service: env.EMAIL_SERVICE || "gmail",
    user: env.EMAIL_USER || "",
    pass: env.EMAIL_PASS || "",
    to: env.CONTACT_RECEIVER || "",
    notifyOnMessage: env.NOTIFY_EMAIL_ON_MESSAGE === "true",
  },
  uploadLimitBytes: 4 * 1024 * 1024,
  minPasswordLength: 10,
};
