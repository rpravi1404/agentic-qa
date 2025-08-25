import fs from "fs-extra";
import path from "path";
import { chatWithLLM } from "../services/llmClient.js";

export async function generateTest(prompt, type = "ui") {
  const template = await fs.readFile(
    `./src/prompts/${type}TestPrompt.txt`,
    "utf-8"
  );

  const response = await chatWithLLM([
    { role: "system", content: template },
    { role: "user", content: prompt }
  ]);

  // Create proper folder structure based on test type
  const baseFolder = type === "ui" ? "./tests/ui" : "./tests/api";
  await createFrameworkStructure(baseFolder, type);

  // Generate test in the appropriate specs folder
  const specsFolder = path.join(baseFolder, "specs");
  const fileName = `${Date.now()}-${type}-test.spec.js`;
  const filePath = path.join(specsFolder, fileName);

  await fs.writeFile(filePath, response);
  console.log(`✅ Generated ${type.toUpperCase()} test: ${filePath}`);

  return filePath;
}

async function createFrameworkStructure(baseFolder, type) {
  await fs.ensureDir(baseFolder);
  
  if (type === "ui") {
    // Create UI test framework structure (Playwright with POM)
    const uiFolders = [
      "pages",      // Page Object classes
      "utils",      // Reusable utility functions
      "data",       // Test data files
      "fixtures",   // Test fixtures
      "specs"       // Actual test files (AAA pattern)
    ];
    
    for (const folder of uiFolders) {
      await fs.ensureDir(path.join(baseFolder, folder));
    }
    
    // Create basic utility files if they don't exist
    await createBasicUIFiles(baseFolder);
    
  } else if (type === "api") {
    // Create API test framework structure (Playwright with SOM)
    const apiFolders = [
      "services",   // Service Object classes
      "utils",      // Reusable utility functions
      "data",       // Test data files
      "schemas",    // JSON schemas for validation
      "fixtures",   // Test fixtures and setup
      "specs"       // Actual test files (AAA pattern)
    ];
    
    for (const folder of apiFolders) {
      await fs.ensureDir(path.join(baseFolder, folder));
    }
    
    // Create basic utility files if they don't exist
    await createBasicAPIFiles(baseFolder);
  }
}

async function createBasicUIFiles(baseFolder) {
  // Create basic page object base class
  const basePagePath = path.join(baseFolder, "pages", "BasePage.js");
  if (!await fs.pathExists(basePagePath)) {
    const basePageContent = `import { expect } from '@playwright/test';

export class BasePage {
  constructor(page) {
    this.page = page;
  }

  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
  }

  async takeScreenshot(name) {
    await this.page.screenshot({ path: \`./screenshots/\${name}-\${Date.now()}.png\` });
  }

  async waitForElement(selector, timeout = 5000) {
    await this.page.waitForSelector(selector, { timeout });
  }
}`;
    await fs.writeFile(basePagePath, basePageContent);
  }

  // Create basic utility file
  const utilsPath = path.join(baseFolder, "utils", "testUtils.js");
  if (!await fs.pathExists(utilsPath)) {
    const utilsContent = `import { expect } from '@playwright/test';

export function generateRandomEmail() {
  return \`test\${Date.now()}@example.com\`;
}

export function generateRandomName() {
  return \`TestUser\${Date.now()}\`;
}

export async function waitForNetworkIdle(page) {
  await page.waitForLoadState('networkidle');
}

export async function assertElementVisible(page, selector) {
  await expect(page.locator(selector)).toBeVisible();
}`;
    await fs.writeFile(utilsPath, utilsContent);
  }
}

async function createBasicAPIFiles(baseFolder) {
  // Create basic service base class
  const baseServicePath = path.join(baseFolder, "services", "BaseService.js");
  if (!await fs.pathExists(baseServicePath)) {
    const baseServiceContent = `import { expect } from '@playwright/test';

export class BaseService {
  constructor(request, baseURL) {
    this.request = request;
    this.baseURL = baseURL;
  }

  async makeRequest(method, endpoint, options = {}) {
    const url = \`\${this.baseURL}\${endpoint}\`;
    const response = await this.request[method.toLowerCase()](url, options);
    return response;
  }

  async validateResponse(response, expectedStatus = 200) {
    expect(response.status()).toBe(expectedStatus);
    return response;
  }

  async validateResponseTime(response, maxTime = 3000) {
    const responseTime = response.request().timing().responseEnd - response.request().timing().requestStart;
    expect(responseTime).toBeLessThan(maxTime);
  }
}`;
    await fs.writeFile(baseServicePath, baseServiceContent);
  }

  // Create basic API utility file
  const utilsPath = path.join(baseFolder, "utils", "apiUtils.js");
  if (!await fs.pathExists(utilsPath)) {
    const utilsContent = `import { expect } from '@playwright/test';

export function generateRandomId() {
  return Math.floor(Math.random() * 1000000);
}

export function generateRandomEmail() {
  return \`test\${Date.now()}@example.com\`;
}

export function buildHeaders(contentType = 'application/json', authToken = null) {
  const headers = {
    'Content-Type': contentType
  };
  
  if (authToken) {
    headers['Authorization'] = \`Bearer \${authToken}\`;
  }
  
  return headers;
}

export async function validateJsonSchema(response, schema) {
  // Basic schema validation - can be enhanced with ajv or similar
  const data = await response.json();
  expect(data).toBeDefined();
  return data;
}`;
    await fs.writeFile(utilsPath, utilsContent);
  }
}
