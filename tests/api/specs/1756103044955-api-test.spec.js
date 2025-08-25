import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

test.describe('Login API - Functional & Validation', () => {
  test('POST /login with valid credentials returns 200', async ({ request }) => {
    // Arrange
    const loginData = {
      username: 'user',
      password: 'pass'
    };

    // Act
    const response = await request.post(`${BASE_URL}/login`, {
      data: loginData
    });

    // Assert
    expect(response.status()).toBe(200);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('token');
  });

  test('POST /login with invalid credentials returns 401', async ({ request }) => {
    // Arrange
    const loginData = {
      username: 'invalid',
      password: 'wrong'
    };

    // Act
    const response = await request.post(`${BASE_URL}/login`, {
      data: loginData
    });

    // Assert
    expect(response.status()).toBe(401);
  });
});