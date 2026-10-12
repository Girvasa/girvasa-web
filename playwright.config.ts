import { defineConfig, devices } from "@playwright/test";
import * as path from "path";

const AUTH_FILE = path.resolve(__dirname, "playwright/.auth/admin.json");

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  timeout: 45000,
  reporter: [
    ["list"],
    ["html", { outputFolder: "playwright-report", open: "never" }],
    ["json", { outputFile: "playwright-report/test-results.json" }],
  ],
  use: {
    baseURL: "http://localhost:3000",
    channel: "chrome", // Directly launches Google Chrome installed on the user's laptop
    headless: false,   // Launches with a visible, interactive browser window
    launchOptions: {
      slowMo: 300,     // Smooth 300ms pacing so interactions can be watched live
    },
    trace: "retain-on-failure",
    screenshot: "on",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "setup",
      testMatch: /auth\.setup\.ts/,
    },
    {
      name: "chrome",
      testIgnore: [/auth\.setup\.ts/],
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 800 },
        storageState: AUTH_FILE,
      },
      dependencies: ["setup"],
    },
  ],
});
