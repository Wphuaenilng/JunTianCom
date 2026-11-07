// @ts-check
import { defineConfig } from "astro/config";
import vue from "@astrojs/vue";
import sitemap from "@astrojs/sitemap";
import icon from "astro-icon";
import tailwindcss from "@tailwindcss/vite";
import { adminIntegration } from "./src/admin/integration.mjs";

// https://astro.build/config
export default defineConfig({
  site: "https://starisle.dev",
  integrations: [adminIntegration(), vue(), sitemap(), icon()],
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    shikiConfig: {
      themes: {
        light: "github-light",
        dark: "one-dark-pro",
      },
      wrap: true,
    },
  },
});
