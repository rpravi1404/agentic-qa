# Test Framework Structure

This directory contains automated tests organized according to automation framework best practices.

## Folder Structure

### UI Tests (`./ui/`)
Following **Page Object Model (POM)** design pattern for Playwright:

```
ui/
├── pages/           # Page Object classes
│   └── BasePage.js  # Base page object with common functionality
├── utils/           # Reusable utility functions
│   └── testUtils.js # Common UI test utilities
├── data/            # Test data files
├── fixtures/        # Test fixtures and setup
└── specs/           # Actual test files (AAA pattern)
```

### API Tests (`./api/`)
Following **Service Object Model (SOM)** design pattern for Playwright:

```
api/
├── services/        # Service Object classes
│   └── BaseService.js # Base service with common API functionality
├── utils/           # Reusable utility functions
│   └── apiUtils.js  # Common API test utilities
├── data/            # Test data files
├── schemas/         # JSON schemas for validation
├── fixtures/        # Test fixtures and setup
└── specs/           # Actual test files (AAA pattern)
```

## Running Tests

```bash
# Run all tests
npm run test

# Run only UI tests
npm run test:ui

# Run only API tests
npm run test:api

# Run tests in headed mode (visible browser)
npm run test:headed

# Run tests in debug mode
npm run test:debug

# View test report
npm run report
```

## Framework Guidelines

### UI Tests (Playwright + POM)
- Use Page Object Model for maintainable test code
- Follow AAA (Arrange, Act, Assert) pattern
- Create reusable page objects for each page/component
- Use descriptive method names that reflect user actions
- Implement proper wait strategies and error handling

### API Tests (Playwright + SOM)
- Use Service Object Model for API testing
- Validate status codes, response schemas, and response times
- Test all HTTP methods (GET, POST, PUT, DELETE, PATCH)
- Implement proper authentication and authorization testing
- Use JSON schemas for response validation

## Best Practices

1. **Test Data Management**: Store test data in separate files
2. **Utility Functions**: Create reusable utilities for common operations
3. **Error Handling**: Implement proper error handling and retry mechanisms
4. **Logging**: Add appropriate logging for debugging
5. **Configuration**: Use environment-specific configuration files
6. **Maintainability**: Avoid hardcoded values and create modular components
