import { expect } from '@playwright/test';

export function generateRandomEmail() {
  return `test${Date.now()}@example.com`;
}

export function generateRandomName() {
  return `TestUser${Date.now()}`;
}

export async function waitForNetworkIdle(page) {
  await page.waitForLoadState('networkidle');
}

export async function assertElementVisible(page, selector) {
  await expect(page.locator(selector)).toBeVisible();
}