import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for Electron E2E testing
 * See https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests/e2e',

  /* Maximum time one test can run for */
  timeout: 60000,

  /* Run tests in files in parallel */
  fullyParallel: false,

  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,

  /* Retry on CI only - 2 retries for flaky tests */
  retries: process.env.CI ? 2 : 2,

  /* Opt out of parallel tests - Electron apps need sequential execution */
  workers: 1,

  /* Reporter configuration */
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'test-results/test-results.json' }],
    ['list'],
  ],

  /* Shared settings for all the projects below */
  use: {
    /* Screenshots on failure for debugging */
    screenshot: 'only-on-failure',

    /* Video recording on failure */
    video: 'retain-on-failure',

    /* Collect trace when retrying the failed test */
    trace: 'retain-on-failure',

    /* Default viewport */
    viewport: { width: 1280, height: 720 },
  },

  /* Configure projects for Electron */
  projects: [
    {
      name: 'electron',
      use: {
        ...devices['Desktop Chrome'],
        // Electron-specific configuration
        contextOptions: {
          // Electron context options
        },
      },
    },
  ],
});
