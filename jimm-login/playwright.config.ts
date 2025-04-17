import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  outputDir: "./test-results",
  preserveOutput: "always",
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "list",
  use: {
    video: "on",
    baseURL: `https://${process.env.IAM_ADDRESS}/`,
    trace: "retain-on-failure",
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
