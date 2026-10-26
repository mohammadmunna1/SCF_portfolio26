import path from "node:path";
import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { config } from "./config.js";
import { errorHandler, notFound, withDatabase } from "./middleware/common.js";
import adminRoutes from "./routes/admin.js";
import authRoutes from "./routes/auth.js";
import publicRoutes from "./routes/public.js";
import { CONTENT_SECURITY_POLICY } from "./security.js";

/**
 * Builds the Express app. Used by server.js (long-running Node server)
 * and api/index.js (Vercel serverless function).
 * Pass `clientDir` to also serve the built React app from the same origin.
 */
export function createApp({ clientDir } = {}) {
  const app = express();
  app.disable("x-powered-by");
  app.set("trust proxy", 1);

  app.use(
    helmet({
      contentSecurityPolicy: false, // set on HTML responses below; the API only returns JSON and images
      crossOriginEmbedderPolicy: false,
    })
  );
  app.use(compression());
  if (config.corsOrigins.length) app.use("/api", cors({ origin: config.corsOrigins, credentials: true }));
  app.use(cookieParser());

  app.get("/api/health", (req, res) => {
    res.json({ ok: true, database: Boolean(config.mongoUri), authConfigured: Boolean(config.jwtSecret) });
  });

  app.use("/api", withDatabase);
  app.use("/api", publicRoutes);
  app.use("/api/auth", authRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api", notFound);

  if (clientDir) {
    app.use("/assets", express.static(path.join(clientDir, "assets"), { immutable: true, maxAge: "1y", index: false }));
    app.use(express.static(clientDir, { index: false, maxAge: "1d" }));
    app.get("*", (req, res) => {
      res.set({ "Cache-Control": "no-cache", "Content-Security-Policy": CONTENT_SECURITY_POLICY });
      res.sendFile(path.join(clientDir, "index.html"));
    });
  }

  app.use(errorHandler);
  return app;
}
