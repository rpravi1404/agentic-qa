import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

test.describe('Login UI - Functional & Validation', () => {
  test('Happy path: login with valid credentials redirects to dashboard', async ({ page }) => {
    // Arrange
    await page.goto(`${BASE_URL}/login`);

    // Act
    await page.fill('#username', 'user');
    await page.fill('#password', 'pass');
    await page.click('#loginBtn');

    // Assert
    await expect(page).toHaveURL(/dashboard|home|\/$/);
    await expect(page.locator('text=Welcome')).toBeVisible({ timeout: 3000 });
  });

  test('Error path: login with invalid credentials shows error message', async ({ page }) => {
    // Arrange
    await page.goto(`${BASE_URL}/login`);

    // Act
    await page.fill('#username', 'invalid');
    await page.fill('#password', 'wrong');
    await page.click('#loginBtn');

    // Assert
    await expect(page.locator('text=Invalid credentials')).toBeVisible();
  });
});