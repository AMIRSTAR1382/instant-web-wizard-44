import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "fs";
import { componentTagger } from "lovable-tagger";
import { siteConfig, isPlaceholderSiteUrl } from "./src/config/site";
import { seedCommunities } from "./src/data/seedCommunities";

const siteUrl = siteConfig.url.replace(/\/+$/, "");

/**
 * Hosting extras, from src/config/site.ts:
 * - fills %SITE_URL% in index.html (canonical link and social preview tags)
 * - writes sitemap.xml and robots.txt for search engines
 * - copies index.html to 404.html so deep links also work on GitHub Pages
 */
function siteFiles(): Plugin {
  let outDir = "dist";
  return {
    name: "site-files",
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir);
    },
    buildStart() {
      if (isPlaceholderSiteUrl && process.env.NODE_ENV === "production") {
        this.warn('siteConfig.url is still "https://example.com". Set your domain in src/config/site.ts before deploying.');
      }
    },
    // "pre": fill the placeholder before Vite reads the links in index.html.
    transformIndexHtml: {
      order: "pre",
      handler: (html) => html.replaceAll("%SITE_URL%", siteUrl),
    },
    generateBundle() {
      const categories = [...new Set(seedCommunities.map((community) => community.category))];
      const paths = [
        "/",
        "/explore",
        ...categories.map((category) => `/${category}`),
        ...seedCommunities.map((community) => `/community/${community.id}`),
        "/about",
        "/contact",
        "/privacy",
        "/terms",
      ];
      const today = new Date().toISOString().slice(0, 10);
      const urls = paths
        .map((page) => `  <url>\n    <loc>${siteUrl}${page}</loc>\n    <lastmod>${today}</lastmod>\n  </url>`)
        .join("\n");
      this.emitFile({
        type: "asset",
        fileName: "sitemap.xml",
        source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
      });
      this.emitFile({
        type: "asset",
        fileName: "robots.txt",
        source: `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`,
      });
    },
    writeBundle() {
      const index = path.join(outDir, "index.html");
      if (fs.existsSync(index)) fs.copyFileSync(index, path.join(outDir, "404.html"));
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // The site is served from the root of its domain; the host sends unknown paths to
  // index.html (see public/.htaccess, public/_redirects, vercel.json and DEPLOY.md).
  base: "/",
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), siteFiles(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Libraries change less often than the site's own code, so browsers can keep them cached.
        manualChunks: {
          react: ["react", "react-dom", "react-router-dom"],
          ui: ["@radix-ui/react-dialog", "@radix-ui/react-alert-dialog", "@radix-ui/react-tooltip", "cmdk", "sonner"],
        },
      },
    },
  },
}));
