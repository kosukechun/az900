import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
const base = process.env.VITE_BASE_PATH || "/az900/";
export default defineConfig({
  base,
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: "charts",
              test: /node_modules[\\/](recharts|d3-|victory|@reduxjs|react-redux|reselect|immer)/,
              priority: 30,
            },
            {
              name: "database",
              test: /node_modules[\\/](dexie|dexie-react-hooks)/,
              priority: 20,
            },
            {
              name: "react",
              test: /node_modules[\\/](react|react-dom|scheduler|react-router)/,
              priority: 10,
            },
          ],
        },
      },
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: "prompt",
      includeAssets: ["icons/*.png", "data/**/*.json"],
      manifest: {
        name: "AZ-900版 道場",
        short_name: "AZ-900 道場",
        description: "毎日の演習で、Azureの知識を自分のものに。",
        theme_color: "#0078d4",
        background_color: "#f5f7fb",
        display: "standalone",
        lang: "ja",
        start_url: base,
        scope: base,
        icons: [
          { src: "icons/icon-192.png", sizes: "192x192", type: "image/png" },
          {
            src: "icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,json,png,svg,webmanifest}"],
        cleanupOutdatedCaches: true,
        navigateFallback: "index.html",
        navigateFallbackDenylist: [/\/data\//],
      },
    }),
  ],
  test: {
    environment: "jsdom",
    setupFiles: ["src/tests/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
