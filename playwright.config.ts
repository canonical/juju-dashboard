import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  testIgnore:
    process.env.JUJU_ENV === "juju" ? "*jimm/*.spec.ts" : "*juju/*.spec.ts",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  outputDir: "./test-results",
  preserveOutput: "always",
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "list",
  use: {
    video: "on",
    baseURL: process.env.DASHBOARD_ADDRESS,
    trace: "on-first-retry",
    screenshot: "on",
    ignoreHTTPSErrors: true,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
