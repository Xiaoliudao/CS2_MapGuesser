import { cloudflare } from "@cloudflare/vite-plugin";
import react from "@vitejs/plugin-react";
import { execFileSync } from "node:child_process";
import { defineConfig, type Plugin } from "vite";
import { questionDevServerPlugin } from "./scripts/content/question-dev-server.ts";
import { renderSiteHtml } from "./src/shared/siteConfig.ts";

function siteMetadataPlugin(): Plugin {
  return {
    name: "cs2-map-guesser-site-metadata",
    transformIndexHtml: {
      order: "pre",
      handler: renderSiteHtml,
    },
  };
}

function resolveAppBuildId(): string {
  const deploymentSha = process.env.GITHUB_SHA?.trim() || process.env.CF_PAGES_COMMIT_SHA?.trim();
  if (deploymentSha) return deploymentSha.slice(0, 12);
  try {
    return execFileSync("git", ["rev-parse", "--short=12", "HEAD"], {
      encoding: "utf8",
      windowsHide: true,
    }).trim();
  } catch {
    return "local-build";
  }
}

const appBuildId = resolveAppBuildId();

export default defineConfig(({ command }) => ({
  envPrefix: ["VITE_", "PUBLIC_"],
  define: {
    "import.meta.env.VITE_APP_BUILD_ID": JSON.stringify(appBuildId),
  },
  plugins: [siteMetadataPlugin(), react(), questionDevServerPlugin(), cloudflare()],
  // public/__dev_assets__ is intentionally served only by the local dev server.
  // Production gameplay continues to use Worker/R2 media routes.
  publicDir: command === "serve" ? "public" : false,
  server: {
    host: "127.0.0.1",
    port: 5173,
  },
}));
