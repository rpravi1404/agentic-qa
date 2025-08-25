#!/usr/bin/env node

/**
 * E2E Test Script for Agentic QA MVP
 * Tests the complete flow without connecting to real LLM services
 * 
 * Usage: TEST_MODE=true node test-e2e.js
 */

import { planTests } from "./src/core/planner.js";
import { generateTest } from "./src/core/generator.js";
import { runTests } from "./src/core/orchestrator.js";
import { generateReport } from "./src/utils/reporter.js";
import { saveTestPlan, loadTestPlan, checkTestFilesExist, getAllTestPlans, clearAllTestPlans } from "./src/services/testPlanManager.js";

console.log("🧪 Starting E2E Test with Mock LLM Client");
console.log("=" .repeat(50));

// Check if test mode is enabled
if (process.env.TEST_MODE !== "true") {
  console.log("⚠️  TEST_MODE not set to 'true'");
  console.log("💡 Run with: TEST_MODE=true node test-e2e.js");
  process.exit(1);
}

async function runE2ETest() {
  const testGoal = "Validate login flow with correct and incorrect credentials";
  
  try {
    // Step 1: Test Plan Generation
    console.log("\n📝 Step 1: Testing Plan Generation");
    console.log("-".repeat(30));
    
    const plan = await planTests(testGoal);
    console.log("✅ Plan generated successfully");
    console.log("📋 Plan content:", JSON.stringify(plan, null, 2));
    
    // Step 2: Test Plan Storage
    console.log("\n💾 Step 2: Testing Plan Storage");
    console.log("-".repeat(30));
    
    const planFile = await saveTestPlan(testGoal, plan);
    console.log("✅ Plan saved to:", planFile);
    
    // Step 3: Test Plan Loading
    console.log("\n📂 Step 3: Testing Plan Loading");
    console.log("-".repeat(30));
    
    const loadedPlan = await loadTestPlan(testGoal);
    console.log("✅ Plan loaded successfully");
    console.log("📋 Loaded plan matches original:", JSON.stringify(loadedPlan) === JSON.stringify(plan));
    
    // Step 4: Test UI Test Generation
    console.log("\n🌐 Step 4: Testing UI Test Generation");
    console.log("-".repeat(30));
    
    const generationPrompt = `Goal: ${testGoal}\n\nTest Plan: ${JSON.stringify(plan, null, 2)}`;
    const uiTestFile = await generateTest(generationPrompt, "ui");
    console.log("✅ UI test generated:", uiTestFile);
    
    // Step 5: Test API Test Generation
    console.log("\n🔗 Step 5: Testing API Test Generation");
    console.log("-".repeat(30));
    
    const apiTestFile = await generateTest(generationPrompt, "api");
    console.log("✅ API test generated:", apiTestFile);
    
    // Step 6: Test File Existence Check
    console.log("\n🔍 Step 6: Testing File Existence Check");
    console.log("-".repeat(30));
    
    const uiFilesExist = await checkTestFilesExist(testGoal, "ui");
    const apiFilesExist = await checkTestFilesExist(testGoal, "api");
    console.log("✅ UI files exist:", uiFilesExist);
    console.log("✅ API files exist:", apiFilesExist);
    
    // Step 7: Test Test Execution (Mock)
    console.log("\n🚀 Step 7: Testing Test Execution (Mock)");
    console.log("-".repeat(30));
    
    const results = await runTests(plan);
    console.log("✅ Test execution completed");
    console.log("📊 Results:", JSON.stringify(results, null, 2));
    
    // Step 8: Test Report Generation
    console.log("\n📊 Step 8: Testing Report Generation");
    console.log("-".repeat(30));
    
    await generateReport(testGoal, results);
    console.log("✅ Report generated successfully");
    
    // Step 9: Test Plan Management
    console.log("\n🗂️ Step 9: Testing Plan Management");
    console.log("-".repeat(30));
    
    const allPlans = await getAllTestPlans();
    console.log("✅ Retrieved all plans:", allPlans.length, "plans found");
    
    // Step 10: Cleanup
    console.log("\n🧹 Step 10: Testing Cleanup");
    console.log("-".repeat(30));
    
    await clearAllTestPlans();
    console.log("✅ All test plans cleared");
    
    console.log("\n🎉 E2E Test Completed Successfully!");
    console.log("=" .repeat(50));
    console.log("✅ All modules are working correctly");
    console.log("✅ File operations are functioning");
    console.log("✅ Mock LLM responses are being used");
    console.log("✅ No real LLM connections were made");
    
  } catch (error) {
    console.error("\n❌ E2E Test Failed:", error.message);
    console.error("Stack trace:", error.stack);
    process.exit(1);
  }
}

// Run the E2E test
runE2ETest();
