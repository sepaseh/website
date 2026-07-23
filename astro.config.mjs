import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://sepaseh.vercel.app",
  output: "static",
  integrations: [sitemap()],
  build: {
    format: "directory"
  }
});
