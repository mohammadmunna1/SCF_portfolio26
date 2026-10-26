// Portfolio API server (content, admin panel, contact form and uploads).
//   npm run dev:api   → API only, alongside `npm run dev` (Vite proxies /api here)
//   npm start         → API + the built site from ./dist on one port
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createApp } from "./server/app.js";
import { ensureBootstrapped } from "./server/bootstrap.js";
import { config } from "./server/config.js";
import { connectDatabase } from "./server/db.js";

const clientDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "dist");
const serveClient = process.argv.includes("--serve-client") && existsSync(path.join(clientDir, "index.html"));

const app = createApp({ clientDir: serveClient ? clientDir : undefined });

app.listen(config.port, () => {
  console.log(`API running on http://localhost:${config.port}${serveClient ? " (serving ./dist)" : ""}`);
  if (config.jwtSecretIsEphemeral) {
    console.warn("[auth] JWT_SECRET is not set — using a temporary secret; admin sessions reset on restart.");
  }
});

// Connect and seed eagerly so problems show up at startup rather than on the first request.
connectDatabase()
  .then(ensureBootstrapped)
  .then(() => console.log("[db] Connected."))
  .catch((error) => console.error(`[db] ${error.message}`));
