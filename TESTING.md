# Testing Guide

This document explains how to test the Agentic QA MVP locally without connecting to real LLM services.

## 🧪 Test Modes

The application supports two modes:

### 1. **Production Mode** (Default)
- Connects to real LLM services (OpenAI/Ollama)
- Requires API keys and network connectivity
- Generates real test plans and code

### 2. **Test Mode** (For Development/Testing)
- Uses mock responses instead of real LLM calls
- No network connectivity required
- Perfect for testing the application flow locally

## 🚀 Quick Start Testing

### Run E2E Test (Complete Flow)
```bash
npm run test:e2e
# or
TEST_MODE=true node test-e2e.js
```

### Run CLI Flow Test
```bash
npm run test:cli
# or
TEST_MODE=true node test-cli.js
```

### Test Individual Components
```bash
# Test with mock LLM
TEST_MODE=true npm start

# Test with real LLM (requires API keys)
npm start
```

## 📋 What Gets Tested

### E2E Test (`test-e2e.js`)
1. **Plan Generation** - Creates test plans using mock LLM
2. **Plan Storage** - Saves plans to JSON files
3. **Plan Loading** - Retrieves and validates saved plans
4. **UI Test Generation** - Creates UI test files
5. **API Test Generation** - Creates API test files
6. **File Existence Check** - Verifies test files are created
7. **Test Execution** - Runs tests using mock executors
8. **Report Generation** - Creates HTML reports
9. **Plan Management** - Lists and manages test plans
10. **Cleanup** - Removes test data

### CLI Flow Test (`test-cli.js`)
1. **Plan Tests Action** - Simulates planning workflow
2. **Generate Test Code Action** - Simulates test generation
3. **Execute Tests Action** - Simulates test execution
4. **Generate Report Action** - Simulates report creation

## 🔧 Mock Components

### Mock LLM Client (`src/services/llmClient.js`)
- **Test Mode Flag**: `TEST_MODE=true`
- **Mock Responses**: Predefined responses for different scenarios
- **No Network Calls**: Completely offline operation

### Mock Executors (`src/executors/mockExecutor.js`)
- **Simulated Execution**: No real Playwright tests run
- **Mock Results**: Returns success/failure scenarios
- **Timing Simulation**: Simulates test execution time

### Mock Responses
- **Planner**: Returns structured test plans
- **UI Tests**: Returns Playwright UI test code
- **API Tests**: Returns Playwright API test code
- **Self-Heal**: Returns alternative selectors

## 📁 Generated Files

During testing, the following files are created:

```
project/
├── test-plans/           # Test plan JSON files
│   └── *.json
├── tests/
│   ├── ui/specs/         # Generated UI test files
│   └── api/specs/        # Generated API test files
├── results/
│   ├── report.html       # Generated test report
│   └── run.jsonl         # Test execution logs
└── .cache/               # Temporary cache files
```

## 🎯 Test Scenarios

### Default Test Goal
```
"Validate login flow with correct and incorrect credentials"
```

### Generated Test Plan
- **UI Tests**: Login with valid/invalid credentials
- **API Tests**: Login API with valid/invalid data
- **Steps**: Detailed test steps for each scenario

### Expected Results
- ✅ All modules work correctly
- ✅ File operations function properly
- ✅ Mock LLM responses are used
- ✅ No real LLM connections made
- ✅ Test files are generated and executed
- ✅ Reports are created successfully

## 🔍 Troubleshooting

### Common Issues

1. **TEST_MODE not set**
   ```
   ⚠️  TEST_MODE not set to 'true'
   💡 Run with: TEST_MODE=true node test-e2e.js
   ```

2. **Missing dependencies**
   ```bash
   npm install
   ```

3. **File permission issues**
   ```bash
   chmod +x test-e2e.js test-cli.js
   ```

4. **Port conflicts**
   - Ensure no other services are using required ports
   - Check for running Playwright processes

### Debug Mode
```bash
# Enable debug logging
DEBUG=* TEST_MODE=true node test-e2e.js
```

## 📊 Test Results

### Successful Test Output
```
🎉 E2E Test Completed Successfully!
==================================================
✅ All modules are working correctly
✅ File operations are functioning
✅ Mock LLM responses are being used
✅ No real LLM connections were made
```

### Failed Test Output
```
❌ E2E Test Failed: [Error Message]
Stack trace: [Error Stack]
```

## 🔄 Continuous Testing

### Pre-commit Testing
```bash
# Run all tests before committing
npm run test:e2e && npm run test:cli
```

### CI/CD Integration
```bash
# Add to your CI pipeline
- name: Test E2E Flow
  run: npm run test:e2e
- name: Test CLI Flow  
  run: npm run test:cli
```

## 📝 Customizing Tests

### Adding New Mock Responses
Edit `src/services/llmClient.js` and add new responses to `MOCK_RESPONSES`.

### Modifying Test Scenarios
Update the test goal in `test-e2e.js` and `test-cli.js`.

### Extending Test Coverage
Add new test steps to the E2E test script.

## 🎯 Best Practices

1. **Always test in TEST_MODE first** before using real LLM
2. **Clean up test files** after testing
3. **Verify file generation** in test directories
4. **Check report output** for completeness
5. **Test error scenarios** by modifying mock responses
6. **Use descriptive test goals** for better debugging

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section
2. Verify all dependencies are installed
3. Ensure TEST_MODE is set correctly
4. Review the generated files and logs
5. Check the console output for error messages
