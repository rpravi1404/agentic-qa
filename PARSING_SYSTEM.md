# LLM Response Parsing System

This document explains how the enhanced `generator.js` file parses LLM responses and organizes them into different files and folders based on content context.

## Overview

The parsing system automatically detects different types of content in LLM responses and organizes them into appropriate folders with meaningful filenames. This creates a well-structured test automation framework with proper separation of concerns.

## How It Works

### 1. Section Detection

The system uses regex patterns to identify different sections in the LLM response:

- **Page Object Class** → `pages/` folder
- **Utility Functions** → `utils/` folder  
- **Test Data** → `data/` folder
- **Service Object Class** → `services/` folder (API tests)
- **JSON Schema** → `schemas/` folder (API tests)
- **Main Test** → `specs/` folder

### 2. Section Headers

The LLM should structure responses with clear section headers like:

```markdown
# Page Object Class
[Page object code here]

# Utility Functions
[Utility functions here]

# Test Data
[Test data in JSON format]

# Main Test
[Main test specification here]
```

**Important**: The system now automatically cleans up markdown formatting, so you can include code blocks in your LLM responses:

```markdown
# Page Object Class

```javascript
import { expect } from '@playwright/test';

export class LoginPage {
  constructor(page) {
    this.page = page;
    this.usernameInput = page.locator('#username');
    this.passwordInput = page.locator('#password');
    this.loginButton = page.locator('#login-btn');
  }
}
```

# Utility Functions

```javascript
export function generateRandomEmail() {
  return `test${Date.now()}@example.com`;
}
```

# Test Data

```json
{
  "validUser": {
    "username": "testuser@example.com",
    "password": "password123"
  }
}
```

# Main Test

```javascript
import { test, expect } from '@playwright/test';

test.describe('Login Functionality', () => {
  test('should login with valid credentials', async ({ page }) => {
    // Test code here
  });
});
```
```

### 3. File Organization

Based on the detected sections, files are automatically created in the appropriate folders:

#### UI Tests Structure:
```
tests/ui/
├── pages/           # Page Object classes
├── utils/           # Reusable utility functions
├── data/            # Test data files
├── fixtures/        # Test fixtures
└── specs/           # Actual test files (AAA pattern)
```

#### API Tests Structure:
```
tests/api/
├── services/        # Service Object classes
├── utils/           # Reusable utility functions
├── data/            # Test data files
├── schemas/         # JSON schemas for validation
├── fixtures/        # Test fixtures and setup
└── specs/           # Actual test files (AAA pattern)
```

## Smart File Naming

The system intelligently extracts meaningful names from content:

### Page Objects
- Extracts class names: `class LoginPage` → `LoginPage.js`
- Falls back to: `PageObject_[timestamp].js`

### Utility Functions
- Extracts function names: `function generateRandomEmail` → `generateRandomEmail.js`
- Extracts const names: `const testUtils` → `testUtils.js`
- Falls back to: `Utility_[timestamp].js`

### Test Data
- Extracts data type: `Test Data for Login` → `login.json`
- Falls back to: `testData_[timestamp].json`

### Services (API)
- Extracts class names: `class UserService` → `UserService.js`
- Falls back to: `Service_[timestamp].js`

### Schemas (API)
- Extracts schema name: `JSON Schema for User` → `user.json`
- Falls back to: `schema_[timestamp].json`

## Content Processing & Cleaning

### Automatic Markdown Cleaning
The system now automatically removes:
- Section headers (`# Page Object Class`, etc.)
- Markdown code block markers (````javascript`, ````json`, etc.)
- Opening and closing code block markers (````)
- Any remaining markdown formatting (`#`, `-`, `*`)
- Extra empty lines and whitespace

### Code Files (.js)
- Removes all markdown formatting
- Preserves actual code content
- Maintains proper code formatting and indentation
- Removes section headers and descriptions

### JSON Files (.json)
- Extracts and validates JSON content
- Formats with proper indentation
- Handles both objects and arrays
- Removes markdown code block markers

## Usage Examples

### Basic Usage

```javascript
import { generateTest } from './src/core/generator.js';

// Generate UI test
const result = await generateTest('Create a login test', 'ui');

// Generate API test  
const result = await generateTest('Create a user API test', 'api');
```

### Expected LLM Response Format

The LLM can now provide responses with markdown formatting, and the system will automatically clean them up:

```markdown
# Page Object Class

```javascript
import { expect } from '@playwright/test';

export class LoginPage {
  constructor(page) {
    this.page = page;
    this.usernameInput = page.locator('#username');
    this.passwordInput = page.locator('#password');
    this.loginButton = page.locator('#login-btn');
  }

  async login(username, password) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }
}
```

# Utility Functions

```javascript
import { expect } from '@playwright/test';

export function generateRandomEmail() {
  return `test${Date.now()}@example.com`;
}

export function generateRandomName() {
  return `TestUser${Date.now()}`;
}
```

# Test Data

```json
{
  "validUser": {
    "username": "testuser@example.com",
    "password": "password123"
  },
  "invalidUser": {
    "username": "invalid@example.com",
    "password": "wrongpassword"
  }
}
```

# Main Test

```javascript
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage.js';
import { generateRandomEmail } from '../utils/testUtils.js';

test.describe('Login Functionality', () => {
  test('should login with valid credentials', async ({ page }) => {
    // Arrange
    const loginPage = new LoginPage(page);
    await page.goto('http://localhost:3000/login');
    
    // Act
    await loginPage.login('testuser@example.com', 'password123');
    
    // Assert
    await expect(page.locator('.dashboard')).toBeVisible();
  });
});
```
```

### Generated Files

This response would generate clean files:

```
tests/ui/
├── pages/LoginPage.js          # Clean JavaScript code
├── utils/generateRandomEmail.js # Clean JavaScript code
├── data/testData.json          # Clean JSON data
└── specs/login-test.spec.js    # Clean test specification
```

**Note**: All generated files will contain only the actual code/data without any markdown formatting, section headers, or code block markers.

## API Test Example

For API tests, the LLM can include service objects and schemas with markdown:

```markdown
# Service Object Class

```javascript
import { expect } from '@playwright/test';

export class UserService {
  constructor(request, baseURL) {
    this.request = request;
    this.baseURL = baseURL;
  }

  async createUser(userData) {
    return await this.request.post(`${this.baseURL}/users`, {
      data: userData
    });
  }
}
```

# JSON Schema

```json
{
  "type": "object",
  "properties": {
    "id": { "type": "number" },
    "name": { "type": "string" },
    "email": { "type": "string", "format": "email" }
  },
  "required": ["name", "email"]
}
```

# Main Test

```javascript
import { test, expect } from '@playwright/test';
import { UserService } from '../services/UserService.js';

test.describe('User API', () => {
  test('should create user successfully', async ({ request }) => {
    // Arrange
    const userService = new UserService(request, 'http://localhost:3000');
    
    // Act
    const response = await userService.createUser({
      name: 'Test User',
      email: 'test@example.com'
    });
    
    // Assert
    expect(response.status()).toBe(201);
  });
});
```
```

## Benefits

1. **Automatic Organization**: No manual file organization needed
2. **Consistent Structure**: Enforces best practices for test frameworks
3. **Smart Naming**: Meaningful filenames based on content
4. **Separation of Concerns**: Clear separation between different types of code
5. **Maintainable**: Easy to find and update specific components
6. **Scalable**: Works for both simple and complex test suites
7. **Markdown Support**: LLM can use markdown formatting for better readability
8. **Automatic Cleaning**: All markdown is automatically removed from final files

## Error Handling

The system gracefully handles:
- Missing sections (treats entire response as main test)
- Invalid JSON (preserves original content)
- Duplicate sections (processes all instances)
- Unrecognized content (creates files with default names)
- Markdown formatting (automatically cleans up)
- Code block markers (removes them completely)

## Testing

The parsing system has been thoroughly tested to ensure:
- Proper section detection
- Clean content extraction
- Markdown removal
- Code preservation
- File organization
- Error handling

## Customization

The system can be easily extended by:
- Adding new section patterns in `parseResponseSections()`
- Creating new name generation functions
- Modifying folder structures in `createFrameworkStructure()`
- Adding new content processing rules
- Customizing markdown cleaning patterns 