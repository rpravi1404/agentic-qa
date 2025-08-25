import inquirer from "inquirer";
import { planTests } from "../core/planner.js";
import { generateTest } from "../core/generator.js";
import { runTests } from "../core/orchestrator.js";
import { generateReport } from "../utils/reporter.js";
import { saveTestPlan, loadTestPlan, hasTestPlan, checkTestFilesExist, getExistingTestFiles, getAllTestPlans, clearAllTestPlans } from "../services/testPlanManager.js";

async function main() {
  // CLI menu
  const { action } = await inquirer.prompt([
    {
      type: "list",
      name: "action",
      message: "🤖 What do you want to do?",
      choices: [
        { name: "📝 Plan Tests", value: "plan" },
        { name: "🛠 Generate Test Code", value: "generate" },
        { name: "🚀 Execute Tests & Generate Report", value: "execute" },
        { name: "⚡ Do All (Plan → Generate → Execute → Report)", value: "all" },
        { name: "🗂️ Manage Test Plans", value: "manage" },
      ],
    },
  ]);

  const { goal } = await inquirer.prompt([
    {
      type: "input",
      name: "goal",
      message: "🎯 Enter your testing goal:",
      default: "Validate login flow with correct and incorrect credentials",
    },
  ]);

  if (action === "plan") {
    // Check if plan already exists
    const existingPlan = await loadTestPlan(goal);
    if (existingPlan) {
      console.log("📋 Found existing test plan!");
      const { useExisting } = await inquirer.prompt([
        {
          type: "confirm",
          name: "useExisting",
          message: "Do you want to use the existing plan?",
          default: true,
        },
      ]);
      
      if (useExisting) {
        console.log("\n📝 Existing Test Plan:\n", JSON.stringify(existingPlan, null, 2));
        return;
      }
    }
    
    console.log("🔄 Generating new test plan...");
    const plan = await planTests(goal);
    await saveTestPlan(goal, plan);
    console.log("\n📝 Test Plan:\n", JSON.stringify(plan, null, 2));
  }

  if (action === "generate") {
    const { type } = await inquirer.prompt([
      {
        type: "list",
        name: "type",
        message: "📂 What type of test?",
        choices: [
          { name: "🌐 UI Test", value: "ui" },
          { name: "🔗 API Test", value: "api" },
        ],
      },
    ]);
    
    // Check if test files already exist in test folders
    const testFilesExist = await checkTestFilesExist(goal, type);
    if (testFilesExist) {
      const existingFiles = await getExistingTestFiles(goal, type);
      console.log(`📋 Found existing ${type.toUpperCase()} test files in test folder!`);
      console.log("📁 Existing files:", existingFiles);
      
      const { useExisting } = await inquirer.prompt([
        {
          type: "confirm",
          name: "useExisting",
          message: `Do you want to use the existing ${type.toUpperCase()} test files?`,
          default: true,
        },
      ]);
      
      if (useExisting) {
        console.log(`✨ Using existing test files in: ./tests/${type}/specs/`);
        return;
      }
    }
    
    // Get or create plan
    let plan = await loadTestPlan(goal);
    if (!plan) {
      console.log("📝 No existing plan found. Generating new plan...");
      plan = await planTests(goal);
      await saveTestPlan(goal, plan);
    } else {
      console.log("📋 Using existing test plan");
    }
    
    const generationPrompt = `Goal: ${goal}\n\nTest Plan: ${JSON.stringify(plan, null, 2)}`;
    const filePath = await generateTest(generationPrompt, type);
    console.log(`✨ Test code generated at: ${filePath}`);
  }

  if (action === "execute") {
    // Check if we have test files to execute in test folders
    const uiTestExists = await checkTestFilesExist(goal, "ui");
    const apiTestExists = await checkTestFilesExist(goal, "api");
    
    if (!uiTestExists && !apiTestExists) {
      console.log("❌ No test files found in test folders for this goal!");
      console.log("💡 Please generate tests first using the 'Generate Test Code' option.");
      return;
    }
    
    // Get or create plan
    let plan = await loadTestPlan(goal);
    if (!plan) {
      console.log("📝 No existing plan found. Generating new plan...");
      plan = await planTests(goal);
      await saveTestPlan(goal, plan);
    } else {
      console.log("📋 Using existing test plan");
    }
    
    console.log("📝 Test Plan:", JSON.stringify(plan, null, 2));

    const results = await runTests(plan);
    console.log("✅ Execution Done");

    await generateReport(goal, results);
    console.log("📊 Report generated at ./results/report.html");
  }

  if (action === "all") {
    console.log("⚡ Running Full Workflow...\n");

    // Step 1: Plan (check if plan file exists)
    let plan = await loadTestPlan(goal);
    if (!plan) {
      console.log("📝 Generating new test plan...");
      plan = await planTests(goal);
      await saveTestPlan(goal, plan);
    } else {
      console.log("📋 Using existing test plan");
    }
    console.log("📝 Test Plan:", JSON.stringify(plan, null, 2));

    // Step 2: Choose type for generation
    const { type } = await inquirer.prompt([
      {
        type: "list",
        name: "type",
        message: "📂 What type of test?",
        choices: [
          { name: "🌐 UI Test", value: "ui" },
          { name: "🔗 API Test", value: "api" },
        ],
      },
    ]);
    
    // Step 2.5: Check if test files already exist in test folders
    const testFilesExist = await checkTestFilesExist(goal, type);
    let filePath;
    
    if (testFilesExist) {
      const existingFiles = await getExistingTestFiles(goal, type);
      console.log(`📋 Found existing ${type.toUpperCase()} test files in test folder!`);
      console.log("📁 Existing files:", existingFiles);
      
      const { useExisting } = await inquirer.prompt([
        {
          type: "confirm",
          name: "useExisting",
          message: `Do you want to use the existing ${type.toUpperCase()} test files?`,
          default: true,
        },
      ]);
      
      if (useExisting) {
        console.log(`✨ Using existing test files in: ./tests/${type}/specs/`);
      } else {
        const generationPrompt = `Goal: ${goal}\n\nTest Plan: ${JSON.stringify(plan, null, 2)}`;
        filePath = await generateTest(generationPrompt, type);
        console.log(`✨ Test code generated at: ${filePath}`);
      }
    } else {
      const generationPrompt = `Goal: ${goal}\n\nTest Plan: ${JSON.stringify(plan, null, 2)}`;
      filePath = await generateTest(generationPrompt, type);
      console.log(`✨ Test code generated at: ${filePath}`);
    }

    // Step 3: Execute
    const results = await runTests(plan);
    console.log("✅ Execution Done");

    // Step 4: Report
    await generateReport(goal, results);
    console.log("📊 Report generated at ./results/report.html");
  }

  if (action === "manage") {
    const { manageAction } = await inquirer.prompt([
      {
        type: "list",
        name: "manageAction",
        message: "🗂️ What would you like to do with test plans?",
        choices: [
          { name: "📋 View All Test Plans", value: "viewPlans" },
          { name: "🗑️ Clear All Test Plans", value: "clear" },
        ],
      },
    ]);

    if (manageAction === "viewPlans") {
      const plans = await getAllTestPlans();
      if (plans.length === 0) {
        console.log("📋 No test plans found.");
      } else {
        console.log("📋 Test Plans:");
        plans.forEach((planData, index) => {
          console.log(`${index + 1}. Goal: ${planData.goal}`);
          console.log(`   File: ${planData.fileName}.json`);
          console.log(`   Timestamp: ${planData.timestamp}\n`);
        });
      }
    }

    if (manageAction === "clear") {
      const { confirm } = await inquirer.prompt([
        {
          type: "confirm",
          name: "confirm",
          message: "Are you sure you want to clear all test plans? This cannot be undone.",
          default: false,
        },
      ]);

      if (confirm) {
        await clearAllTestPlans();
        console.log("🗑️ All test plans cleared successfully!");
      } else {
        console.log("❌ Test plans clear cancelled.");
      }
    }
  }
}

main();
