import { defineConfig, devices } from "@playwright/test";

import dotenv from "dotenv";

dotenv.config({ path: [".env.e2e.local", ".env.e2e"] });

const BASE_TIMEOUT = process.env.PROVIDER === "microk8s" ? 30_000 : 5_000;
const TEST_TIMEOUT_MULT = 10;

export default defineConfig({
  testDir: "./e2e",
  testIgnore:
    process.env.JUJU_ENV === "juju" ? "*jimm/*.spec.ts" : "*juju/*.spec.ts",
  fullyParallel: process.env.CI ? false : true,
  forbidOnly: !!process.env.CI,
  outputDir: "./test-results",
  preserveOutput: "always",
  // TODO: undo this change
  retries: 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "list",
  use: {
    video: "on-first-retry",
    baseURL: process.env.DASHBOARD_ADDRESS,
    trace: "on",
    screenshot: "only-on-failure",
    ignoreHTTPSErrors: true,
  },
  timeout: BASE_TIMEOUT * TEST_TIMEOUT_MULT,
  expect: { timeout: BASE_TIMEOUT },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], channel: "chromium" },
    },
  ],
});
