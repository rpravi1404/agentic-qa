import { runUITest } from "../executors/uiExecutor.js";
import { runAPITest } from "../executors/apiExecutor.js";
import { runMockUITest } from "../executors/mockExecutor.js";
import { runMockAPITest } from "../executors/mockExecutor.js";
import { storeResult } from "../services/memory.js";

// Check if we're in test mode
const TEST_MODE = process.env.TEST_MODE === "true";

export async function runTests(plan) {
  const results = [];

  for (const test of plan.testSuites) {
    console.log(`▶ Running: ${test.name} (${test.type})`);
    let outcome;
    try {
      if (test.type === "UI") {
        outcome = TEST_MODE ? await runMockUITest(test) : await runUITest(test);
      } else if (test.type === "API") {
        outcome = TEST_MODE ? await runMockAPITest(test) : await runAPITest(test);
      }
      
      // Set overall status based on test results
      if (outcome.failedFiles > 0) {
        outcome.status = "FAILED";
      } else if (outcome.skippedFiles === outcome.totalFiles) {
        outcome.status = "SKIPPED";
      } else {
        outcome.status = "PASSED";
      }
      
    } catch (err) {
      outcome = { 
        ...test, 
        status: "FAILED", 
        error: err.message,
        results: [],
        totalFiles: 0,
        passedFiles: 0,
        failedFiles: 1,
        skippedFiles: 0
      };
    }
    
    console.log(`📊 ${test.type} Test Summary: ${outcome.passedFiles}/${outcome.totalFiles} passed, ${outcome.failedFiles} failed, ${outcome.skippedFiles} skipped`);
    results.push(outcome);
    await storeResult(outcome);
  }

  return results;
}
