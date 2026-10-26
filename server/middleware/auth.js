import jwt from "jsonwebtoken";
import { config } from "../config.js";
import { HttpError, asyncHandler } from "../lib/http.js";
import { Admin } from "../models/index.js";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export const sessionCookieOptions = () => ({
  httpOnly: true,
  secure: config.isProduction || config.cookieSameSite === "none",
  sameSite: config.cookieSameSite,
  path: "/api",
  maxAge: config.sessionDays * 24 * 60 * 60 * 1000,
});

const assertAuthConfigured = () => {
  if (!config.jwtSecret) {
    throw new HttpError(503, "Admin login is disabled until JWT_SECRET (32+ characters) is configured.");
  }
};

export function issueSession(res, admin) {
  assertAuthConfigured();
  const token = jwt.sign({ sub: String(admin._id), v: admin.tokenVersion }, config.jwtSecret, {
    algorithm: "HS256",
    expiresIn: `${config.sessionDays}d`,
  });
  res.cookie(config.cookieName, token, sessionCookieOptions());
}

export function clearSession(res) {
  const { maxAge, ...options } = sessionCookieOptions();
  res.clearCookie(config.cookieName, options);
}

/**
 * Resolves the signed-in admin from the session cookie, or null.
 * A password change bumps tokenVersion, which revokes every older session.
 */
export async function readSession(req) {
  assertAuthConfigured();
  const token = req.cookies?.[config.cookieName];
  if (!token) return null;
  let payload;
  try {
    payload = jwt.verify(token, config.jwtSecret, { algorithms: ["HS256"] });
  } catch {
    return null;
  }
  const admin = await Admin.findById(payload.sub).select("email tokenVersion").lean();
  if (!admin || admin.tokenVersion !== payload.v) return null;
  return { id: String(admin._id), email: admin.email };
}

export const requireAdmin = asyncHandler(async (req, res, next) => {
  const admin = await readSession(req);
  if (!admin) {
    throw new HttpError(401, req.cookies?.[config.cookieName] ? "Your session has expired. Please sign in again." : "Please sign in.");
  }
  req.admin = admin;
  next();
});

/**
 * CSRF defence in depth (on top of SameSite cookies): state-changing requests must carry
 * a custom header, which cross-site forms cannot set and cross-origin scripts cannot send without CORS.
 */
export function requireAjaxHeader(req, res, next) {
  if (SAFE_METHODS.has(req.method) || req.get("x-requested-with") === "XMLHttpRequest") return next();
  next(new HttpError(403, "Request rejected."));
}
