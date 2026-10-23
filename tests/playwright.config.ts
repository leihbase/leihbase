import type { ConfigOptions } from "@nuxt/test-utils/playwright";
import { defineConfig, devices, selectors } from "@playwright/test";

// Selector to query, and unwrap a shadowroot element
const createShadowRootEngine = () => ({
  query(root: Element | Document, selector: string) {
    return root.querySelector(selector)?.shadowRoot ?? null;
  },
  queryAll(root: Element | Document, selector: string) {
    return Array.from(root.querySelectorAll(selector)).map((s) => s.shadowRoot);
  },
});
await selectors.register("shadow", createShadowRootEngine);

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig<ConfigOptions>({
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: 0,
  /* Opt out of parallel tests on CI. */
  workers: Number(process.env.PLAYWRIGHT_WORKERS) || undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [["list"], ["html"]],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || "http://127.0.0.1:3001",

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "retain-on-failure",
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: "setup",
      testDir: "./setup",
      testMatch: /global\.setup\.ts/,
    },
    {
      name: "API Tests",
      testDir: "./api",
      dependencies: ["setup"],
    },
    {
      name: "Desktop Chrome",
      testDir: "./browser",
      use: devices["Desktop Chrome"],
      dependencies: ["setup"],
    },
    {
      name: "Mobile Chrome",
      testDir: "./browser",
      use: devices["Pixel 5"],
      dependencies: ["setup"],
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: "mise run //...:start:test",
    url: "http://127.0.0.1:3000/favicon.ico",
    reuseExistingServer: false,
    stdout: "pipe",
    stderr: "pipe",
  },
});
