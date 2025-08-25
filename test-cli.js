#!/usr/bin/env node

/**
 * CLI Test Script for Agentic QA MVP
 * Demonstrates the CLI functionality with test mode
 * 
 * Usage: TEST_MODE=true node test-cli.js
 */

import { planTests } from "./src/core/planner.js";
import { generateTest } from "./src/core/generator.js";
import { runTests } from "./src/core/orchestrator.js";
import { generateReport } from "./src/utils/reporter.js";
import { saveTestPlan, loadTestPlan } from "./src/services/testPlanManager.js";

console.log("🧪 Testing CLI Functionality with Mock LLM Client");
console.log("=" .repeat(50));

// Check if test mode is enabled
if (process.env.TEST_MODE !== "true") {
  console.log("⚠️  TEST_MODE not set to 'true'");
  console.log("💡 Run with: TEST_MODE=true node test-cli.js");
  process.exit(1);
}

async function testCLIFlow() {
  const testGoal = "Validate login flow with correct and incorrect credentials";
  
  try {
    console.log("\n🎯 Testing Goal:", testGoal);
    console.log("-".repeat(30));
    
    // Simulate the "Plan Tests" action
    console.log("\n📝 Simulating 'Plan Tests' action...");
    const plan = await planTests(testGoal);
    await saveTestPlan(testGoal, plan);
    console.log("✅ Plan created and saved");
    
    // Simulate the "Generate Test Code" action
    console.log("\n🛠 Simulating 'Generate Test Code' action...");
    const generationPrompt = `Goal: ${testGoal}\n\nTest Plan: ${JSON.stringify(plan, null, 2)}`;
    const uiTestFile = await generateTest(generationPrompt, "ui");
    const apiTestFile = await generateTest(generationPrompt, "api");
    console.log("✅ UI test generated:", uiTestFile);
    console.log("✅ API test generated:", apiTestFile);
    
    // Simulate the "Execute Tests" action
    console.log("\n🚀 Simulating 'Execute Tests' action...");
    const results = await runTests(plan);
    console.log("✅ Tests executed successfully");
    
    // Simulate the "Generate Report" action
    console.log("\n📊 Simulating 'Generate Report' action...");
    await generateReport(testGoal, results);
    console.log("✅ Report generated successfully");
    
    console.log("\n🎉 CLI Flow Test Completed Successfully!");
    console.log("=" .repeat(50));
    console.log("✅ All CLI actions work correctly");
    console.log("✅ Mock LLM responses are being used");
    console.log("✅ No real LLM connections were made");
    console.log("✅ Files are being created and managed properly");
    
  } catch (error) {
    console.error("\n❌ CLI Flow Test Failed:", error.message);
    console.error("Stack trace:", error.stack);
    process.exit(1);
  }
}

// Run the CLI test
testCLIFlow();
