import { chromium } from '@playwright/test';

async function globalSetup() {
  // Setup for UI tests
  const browser = await chromium.launch();
  const context = await browser.newContext();
  
  // Store authentication state if needed
  // await context.addCookies([...]);
  
  await context.storageState({ path: './tests/fixtures/auth-state.json' });
  await browser.close();
}

export default globalSetup;
