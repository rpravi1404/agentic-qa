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

  // Parse and organize the LLM response into different files
  const generatedFiles = await parseAndOrganizeResponse(response, baseFolder, type);
  
  console.log(`✅ Generated ${type.toUpperCase()} test files:`);
  generatedFiles.forEach(file => {
    console.log(`   📄 ${file.path}`);
  });

  return generatedFiles;
}

async function parseAndOrganizeResponse(response, baseFolder, type) {
  const generatedFiles = [];
  const timestamp = Date.now();
  
  // Parse the response to identify different content sections
  const sections = parseResponseSections(response);
  
  // Process each section and create appropriate files
  for (const section of sections) {
    const fileInfo = await createFileFromSection(section, baseFolder, type, timestamp);
    if (fileInfo) {
      generatedFiles.push(fileInfo);
    }
  }
  
  return generatedFiles;
}

function parseResponseSections(response) {
  const sections = [];
  
  // Split response by common section markers - simplified patterns
  const sectionPatterns = [
    /#\s*Page\s+Object\s+Class/gi,
    /#\s*Utility\s+Functions/gi,
    /#\s*Test\s+Data/gi,
    /#\s*Service\s+Object\s+Class/gi,
    /#\s*JSON\s+Schema/gi,
    /#\s*Main\s+Test/gi
  ];
  
  // Find all section markers
  const markers = [];
  sectionPatterns.forEach((pattern, index) => {
    const matches = [...response.matchAll(pattern)];
    matches.forEach(match => {
      markers.push({
        index: match.index,
        type: getSectionType(index),
        pattern: pattern,
        matchText: match[0]
      });
    });
  });
  
  // Sort markers by position
  markers.sort((a, b) => a.index - b.index);
  
  // Extract sections
  for (let i = 0; i < markers.length; i++) {
    const marker = markers[i];
    const nextMarker = markers[i + 1];
    
    // Extract content from current marker to next marker (or end of response)
    const endIndex = nextMarker ? nextMarker.index : response.length;
    let content = response.substring(marker.index, endIndex).trim();
    
    // Remove the section header from the content
    content = content.replace(new RegExp(marker.matchText, 'i'), '').trim();
    
    if (content) {
      sections.push({
        type: marker.type,
        content: content,
        startIndex: marker.index,
        markerText: marker.matchText
      });
    }
  }
  
  // If no sections found, treat entire response as main test
  if (sections.length === 0) {
    sections.push({
      type: 'main',
      content: response.trim(),
      startIndex: 0,
      markerText: ''
    });
  }
  
  return sections;
}

function getSectionType(patternIndex) {
  const types = ['page', 'utility', 'data', 'service', 'schema', 'main'];
  return types[patternIndex] || 'main';
}

async function createFileFromSection(section, baseFolder, type, timestamp) {
  const { type: sectionType, content } = section;
  
  let targetFolder, fileName, fileExtension;
  
  switch (sectionType) {
    case 'page':
      targetFolder = path.join(baseFolder, 'pages');
      fileName = generatePageObjectName(content);
      fileExtension = '.js';
      break;
      
    case 'utility':
      targetFolder = path.join(baseFolder, 'utils');
      fileName = generateUtilityName(content);
      fileExtension = '.js';
      break;
      
    case 'data':
      targetFolder = path.join(baseFolder, 'data');
      fileName = generateDataFileName(content);
      fileExtension = '.json';
      break;
      
    case 'service':
      targetFolder = path.join(baseFolder, 'services');
      fileName = generateServiceName(content);
      fileExtension = '.js';
      break;
      
    case 'schema':
      targetFolder = path.join(baseFolder, 'schemas');
      fileName = generateSchemaName(content);
      fileExtension = '.json';
      break;
      
    case 'main':
    default:
      targetFolder = path.join(baseFolder, 'specs');
      fileName = `${timestamp}-${type}-test`;
      fileExtension = '.spec.js';
      break;
  }
  
  // Ensure target folder exists
  await fs.ensureDir(targetFolder);
  
  // Create file path
  const filePath = path.join(targetFolder, `${fileName}${fileExtension}`);
  
  // Process content based on file type
  let processedContent = processContentForFileType(content, fileExtension);
  
  // Write file
  await fs.writeFile(filePath, processedContent);
  
  return {
    path: filePath,
    type: sectionType,
    folder: targetFolder,
    name: fileName
  };
}

function generatePageObjectName(content) {
  const patterns = [
    /class\s+(\w+)/i,
    /export\s+class\s+(\w+)/i,
    /(?:Page|PageObject)\s+(?:for\s+)?([A-Z][a-zA-Z]*)/i,
    /(?:Page|PageObject)\s+([A-Z][a-zA-Z]*)/i
  ];
  
  const extractedName = extractNameFromContent(content, patterns);
  if (extractedName) {
    return extractedName;
  }
  
  // Default naming
  return `PageObject_${Date.now()}`;
}

function generateUtilityName(content) {
  const patterns = [
    /function\s+(\w+)/i,
    /export\s+function\s+(\w+)/i,
    /const\s+(\w+)\s*=/i,
    /export\s+const\s+(\w+)/i,
    /(?:Utility|Helper)\s+(?:for\s+)?([A-Z][a-zA-Z]*)/i,
    /(?:Utility|Helper)\s+([A-Z][a-zA-Z]*)/i
  ];
  
  const extractedName = extractNameFromContent(content, patterns);
  if (extractedName) {
    return extractedName;
  }
  
  return `Utility_${Date.now()}`;
}

function generateDataFileName(content) {
  const patterns = [
    /(?:Test\s+)?Data\s+(?:for\s+)?([A-Z][a-zA-Z]*)/i,
    /(?:Test\s+)?Data\s+([A-Z][a-zA-Z]*)/i,
    /(?:Fixture|TestData)\s+(?:for\s+)?([A-Z][a-zA-Z]*)/i
  ];
  
  const extractedName = extractNameFromContent(content, patterns);
  if (extractedName) {
    return extractedName.toLowerCase();
  }
  
  return `testData_${Date.now()}`;
}

function generateServiceName(content) {
  const patterns = [
    /class\s+(\w+)/i,
    /export\s+class\s+(\w+)/i,
    /(?:Service|API)\s+(?:for\s+)?([A-Z][a-zA-Z]*)/i,
    /(?:Service|API)\s+([A-Z][a-zA-Z]*)/i
  ];
  
  const extractedName = extractNameFromContent(content, patterns);
  if (extractedName) {
    return extractedName;
  }
  
  return `Service_${Date.now()}`;
}

function generateSchemaName(content) {
  const patterns = [
    /(?:Schema|Validation)\s+(?:for\s+)?([A-Z][a-zA-Z]*)/i,
    /(?:Schema|Validation)\s+([A-Z][a-zA-Z]*)/i,
    /JSON\s+Schema\s+(?:for\s+)?([A-Z][a-zA-Z]*)/i
  ];
  
  const extractedName = extractNameFromContent(content, patterns);
  if (extractedName) {
    return extractedName.toLowerCase();
  }
  
  return `schema_${Date.now()}`;
}

function processContentForFileType(content, fileExtension) {
  let processedContent = content;
  
  // Remove section headers completely
  processedContent = processedContent
    .replace(/^#+\s*(?:Page\s+Object\s+Class|Utility\s+Functions|Test\s+Data|Service\s+Object\s+Class|JSON\s+Schema|Main\s+Test)(?:\s*#*)?\s*\n?/gim, '')
    .trim();
  
  // Remove markdown code block markers
  processedContent = processedContent
    .replace(/```\w*\n?/g, '')  // Remove opening ```javascript, ```js, etc.
    .replace(/```\s*$/gm, '')   // Remove closing ```
    .trim();
  
  // Remove any remaining markdown formatting
  processedContent = processedContent
    .replace(/^\s*#+\s*.*$/gm, '')  // Remove any remaining # headers
    .replace(/^\s*-\s*.*$/gm, '')   // Remove any remaining - list items
    .replace(/^\s*\*\s*.*$/gm, '')  // Remove any remaining * list items
    .trim();
  
  // Remove empty lines at the beginning and end
  processedContent = processedContent
    .replace(/^\n+/, '')  // Remove leading empty lines
    .replace(/\n+$/, ''); // Remove trailing empty lines
  
  if (fileExtension === '.json') {
    // Try to extract JSON content
    const jsonMatch = processedContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        // Validate and format JSON
        const jsonObj = JSON.parse(jsonMatch[0]);
        return JSON.stringify(jsonObj, null, 2);
      } catch (e) {
        // If JSON parsing fails, return the original content
        return processedContent;
      }
    }
    
    // Try to extract array content
    const arrayMatch = processedContent.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
      try {
        const arrayObj = JSON.parse(arrayMatch[0]);
        return JSON.stringify(arrayObj, null, 2);
      } catch (e) {
        return processedContent;
      }
    }
  }
  
  return processedContent;
}

// Helper function to extract meaningful names from content
function extractNameFromContent(content, patterns) {
  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match) {
      return match[1];
    }
  }
  return null;
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

// Export parsing functions for testing
export { parseResponseSections, createFileFromSection, processContentForFileType, generatePageObjectName, generateUtilityName, generateDataFileName, generateServiceName, generateSchemaName, extractNameFromContent };
