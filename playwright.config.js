import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: './results/report' }],
    ['json', { outputFile: './results/results.json' }],
    ['list']
  ],
  
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    // UI Tests
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testMatch: /.*ui.*\.spec\.js/,
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      testMatch: /.*ui.*\.spec\.js/,
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      testMatch: /.*ui.*\.spec\.js/,
    },
    
    // API Tests
    {
      name: 'api',
      testMatch: /.*api.*\.spec\.js/,
      use: {
        baseURL: process.env.API_BASE_URL || 'http://localhost:3000/api',
      },
    },
  ],

  // Global setup and teardown
  globalSetup: './tests/global-setup.js',
  globalTeardown: './tests/global-teardown.js',
});
