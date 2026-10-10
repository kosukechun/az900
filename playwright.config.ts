import { defineConfig } from "@playwright/test";
const repo = process.env.GITHUB_REPOSITORY?.split("/")[1];
const base =
  process.env.VITE_BASE_PATH ||
  (repo ? (repo.endsWith(".github.io") ? "/" : `/${repo}/`) : "/az900/");
export default defineConfig({
  testDir: "e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 30000,
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  use: {
    baseURL: `http://127.0.0.1:4173${base}`,
    trace: "retain-on-failure",
    browserName: "chromium",
  },
  webServer: {
    command: "npm run preview -- --port 4173",
    url: `http://127.0.0.1:4173${base}`,
    reuseExistingServer: !process.env.CI,
    timeout: 30000,
  },
});
