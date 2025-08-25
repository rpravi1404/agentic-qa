# Source Code Organization

This directory contains the source code for the Agentic QA MVP, organized into logical modules for better maintainability and clarity.

## 📁 Directory Structure

### `cli/` - Command Line Interface
- **`index.js`** - Main CLI entry point with interactive menu and workflow orchestration

### `core/` - Core Application Logic
- **`orchestrator.js`** - Coordinates test execution and manages test flow
- **`planner.js`** - Generates test plans using LLM
- **`generator.js`** - Creates test code files based on plans and prompts

### `services/` - Service Layer
- **`llmClient.js`** - LLM integration (OpenAI/Ollama) for AI-powered features
- **`testPlanManager.js`** - Manages test plan file storage and retrieval
- **`memory.js`** - Stores test execution results and history

### `executors/` - Test Execution
- **`uiExecutor.js`** - Executes UI tests using Playwright
- **`apiExecutor.js`** - Executes API tests using Playwright

### `utils/` - Utility Functions
- **`reporter.js`** - Generates test execution reports
- **`selfHeal.js`** - AI-powered test failure recovery

### `prompts/` - LLM Prompts
- **`plannerPrompt.txt`** - Prompt for test planning
- **`uiTestPrompt.txt`** - Prompt for UI test generation
- **`apiTestPrompt.txt`** - Prompt for API test generation
- **`selfHealPrompt.txt`** - Prompt for test failure recovery

### `mocks/` - Mock Files
- **`mockServer.js`** - Mock server for testing
- **`mockLogin.html`** - Mock login page for UI testing

## 🔄 Module Dependencies

```
cli/index.js
├── core/planner.js
├── core/generator.js
├── core/orchestrator.js
├── utils/reporter.js
└── services/testPlanManager.js

core/orchestrator.js
├── executors/uiExecutor.js
├── executors/apiExecutor.js
└── services/memory.js

core/planner.js
└── services/llmClient.js

core/generator.js
└── services/llmClient.js

utils/selfHeal.js
└── services/llmClient.js
```

## 🚀 Usage

The application is started from the CLI module:

```bash
npm start
# or
node src/cli/index.js
```

## 📝 Development Guidelines

- **Separation of Concerns**: Each module has a specific responsibility
- **Dependency Injection**: Services are injected where needed
- **File-based Storage**: Test plans and results are stored as files
- **LLM Integration**: AI features are centralized in the services layer
- **Test Execution**: Executors handle different test types independently
