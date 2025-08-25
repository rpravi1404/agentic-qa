// Mock LLM client for testing without real LLM connections
import fs from "fs-extra";

// Mock responses for different scenarios
const MOCK_RESPONSES = {
  planner: {
    goal: "Validate login flow with correct and incorrect credentials",
    tests: [
      {
        name: "Login with valid credentials",
        type: "UI",
        steps: [
          "Open login page",
          "Enter correct username/password",
          "Click login",
          "Assert dashboard visible"
        ]
      },
      {
        name: "Login with invalid credentials",
        type: "UI",
        steps: [
          "Open login page",
          "Enter incorrect username/password",
          "Click login",
          "Assert error message visible"
        ]
      },
      {
        name: "API login with valid credentials",
        type: "API",
        steps: [
          "Send POST request to /login with valid data",
          "Assert 200 status code",
          "Assert response contains token"
        ]
      },
      {
        name: "API login with invalid credentials",
        type: "API",
        steps: [
          "Send POST request to /login with invalid data",
          "Assert 401 status code",
          "Assert error message in response"
        ]
      }
    ]
  },
  uiTest: `import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

test.describe('Login UI - Functional & Validation', () => {
  test('Happy path: login with valid credentials redirects to dashboard', async ({ page }) => {
    // Arrange
    await page.goto(\`\${BASE_URL}/login\`);

    // Act
    await page.fill('#username', 'user');
    await page.fill('#password', 'pass');
    await page.click('#loginBtn');

    // Assert
    await expect(page).toHaveURL(/dashboard|home|\\/$/);
    await expect(page.locator('text=Welcome')).toBeVisible({ timeout: 3000 });
  });

  test('Error path: login with invalid credentials shows error message', async ({ page }) => {
    // Arrange
    await page.goto(\`\${BASE_URL}/login\`);

    // Act
    await page.fill('#username', 'invalid');
    await page.fill('#password', 'wrong');
    await page.click('#loginBtn');

    // Assert
    await expect(page.locator('text=Invalid credentials')).toBeVisible();
  });
});`,
  apiTest: `import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

test.describe('Login API - Functional & Validation', () => {
  test('POST /login with valid credentials returns 200', async ({ request }) => {
    // Arrange
    const loginData = {
      username: 'user',
      password: 'pass'
    };

    // Act
    const response = await request.post(\`\${BASE_URL}/login\`, {
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
    const response = await request.post(\`\${BASE_URL}/login\`, {
      data: loginData
    });

    // Assert
    expect(response.status()).toBe(401);
  });
});`,
  selfHeal: {
    alternatives: ["#submitBtn", "button[type='submit']", ".login-button"]
  }
};

/**
 * Mock LLM client that returns predefined responses
 * Use this for testing without connecting to real LLM services
 */
export async function mockChatWithLLM(messages, options = {}) {
  console.log("🤖 Using Mock LLM Client (TEST_MODE=true)");
    
    // Determine which type of response to return based on the system prompt
    const systemMessage = messages.find(msg => msg.role === "system")?.content || "";
    
    if (systemMessage.includes("planner") || systemMessage.includes("test plan")) {
      console.log("📝 Returning mock test plan");
      return JSON.stringify(MOCK_RESPONSES.planner);
    } else if (systemMessage.includes("UI") && systemMessage.includes("test")) {
      console.log("🌐 Returning mock UI test code");
      return MOCK_RESPONSES.uiTest;
    } else if (systemMessage.includes("API") && systemMessage.includes("test")) {
      console.log("🔗 Returning mock API test code");
      return MOCK_RESPONSES.apiTest;
    } else if (systemMessage.includes("self-heal")) {
      console.log("🔧 Returning mock self-heal alternatives");
      return JSON.stringify(MOCK_RESPONSES.selfHeal);
    } else {
      console.log("❓ Unknown prompt type, returning default response");
      return JSON.stringify({ message: "Mock response for unknown prompt" });
    }
}

// Export the same interface as the real LLM client
export const chatWithLLM = mockChatWithLLM;
