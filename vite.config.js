import { existsSync, readdirSync } from "node:fs";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// Six Caps only stands in for Humane until its licensed files are added (src/lib/fonts.js).
const HUMANE_DIR = "src/assets/fonts/humane";
const humaneInstalled = existsSync(HUMANE_DIR) && readdirSync(HUMANE_DIR).some((file) => /\.woff2?$/i.test(file));
// The latin files of the faces the first screen is set in (other subsets load only for the characters they cover).
const FIRST_SCREEN_FONTS = humaneInstalled
  ? /^assets\/geist-latin-wght-normal-[\w-]+\.woff2$/
  : /^assets\/(geist-latin-wght-normal|six-caps-latin-400-normal)-[\w-]+\.woff2$/;

/**
 * Starts what the first screen waits for — the content and its fonts — as soon as the HTML arrives, rather
 * than once the scripts have downloaded and run. Otherwise the fonts would only be requested when the content
 * renders, and the hero would show in a fallback face first, then jump.
 */
function preloadFirstScreen(apiBase) {
  return {
    name: "preload-first-screen",
    transformIndexHtml(html, { bundle }) {
      const preload = (attrs) => ({ tag: "link", attrs: { rel: "preload", crossorigin: true, ...attrs }, injectTo: "head" });
      // Fetched by src/context/ContentContext.jsx with exactly this request (apiFetch's `preloaded` option).
      // The admin panel doesn't read it, so on /admin Chrome notes an unused preload in the console — harmless.
      const tags = [preload({ href: `${apiBase}/api/content`, as: "fetch" })];
      for (const fileName of Object.keys(bundle ?? {})) {
        if (FIRST_SCREEN_FONTS.test(fileName)) tags.push(preload({ href: `/${fileName}`, as: "font", type: "font/woff2" }));
      }
      return tags;
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  // In development the API (npm run dev:api) runs separately; proxy /api so it's same-origin.
  const proxy = { "/api": { target: `http://localhost:${env.PORT || 3001}` } };

  return {
    plugins: [react(), preloadFirstScreen((env.VITE_API_URL || "").replace(/\/$/, ""))],
    server: { proxy },
    preview: { proxy },
    build: {
      target: "es2020",
      rollupOptions: {
        output: {
          // Long-lived vendor chunks: content/UI changes don't invalidate the cached libraries.
          manualChunks(id) {
            if (!id.includes("node_modules")) return undefined;
            if (/[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(id)) return "react";
            if (/react-router|[\\/]cookie[\\/]|set-cookie-parser/.test(id)) return "router";
            if (/framer-motion|motion-dom|motion-utils/.test(id)) return "motion";
            if (id.includes("react-icons")) return "icons";
            return undefined;
          },
        },
      },
    },
  };
});
