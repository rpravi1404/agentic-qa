import fs from "fs-extra";
import path from "path";
import crypto from "crypto";

const TEST_PLANS_DIR = "./test-plans";
const TESTS_DIR = "./tests";

// Initialize directories
async function initDirectories() {
  await fs.ensureDir(TEST_PLANS_DIR);
  await fs.ensureDir(path.join(TESTS_DIR, "ui"));
  await fs.ensureDir(path.join(TESTS_DIR, "api"));
}

// Generate a filename-safe hash for the goal
function generateFileName(goal) {
  const hash = crypto.createHash('md5').update(goal).digest('hex').substring(0, 8);
  const sanitizedGoal = goal.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
  return `${sanitizedGoal}_${hash}`;
}

// Save test plan to file
export async function saveTestPlan(goal, plan) {
  await initDirectories();
  const fileName = generateFileName(goal);
  const planFile = path.join(TEST_PLANS_DIR, `${fileName}.json`);
  
  const planData = {
    goal,
    plan,
    timestamp: new Date().toISOString(),
    fileName
  };
  
  await fs.writeJson(planFile, planData, { spaces: 2 });
  console.log(`📝 Test plan saved to: ${planFile}`);
  return planFile;
}

// Load test plan from file
export async function loadTestPlan(goal) {
  await initDirectories();
  const fileName = generateFileName(goal);
  const planFile = path.join(TEST_PLANS_DIR, `${fileName}.json`);
  
  if (await fs.pathExists(planFile)) {
    const planData = await fs.readJson(planFile);
    return planData.plan;
  }
  
  return null;
}

// Check if test plan exists
export async function hasTestPlan(goal) {
  const plan = await loadTestPlan(goal);
  return plan !== null;
}

// Get test plan file path
export async function getTestPlanFilePath(goal) {
  await initDirectories();
  const fileName = generateFileName(goal);
  return path.join(TEST_PLANS_DIR, `${fileName}.json`);
}

// Check if test files exist in test folders
export async function checkTestFilesExist(goal, type) {
  await initDirectories();
  
  const testDir = path.join(TESTS_DIR, type, "specs");
  if (!await fs.pathExists(testDir)) {
    return false;
  }
  
  const files = await fs.readdir(testDir);
  const goalFileName = generateFileName(goal);
  
  // Look for test files that match the goal
  const matchingFiles = files.filter(file => 
    file.includes(goalFileName) || 
    file.includes(type) ||
    file.endsWith('.spec.js')
  );
  
  return matchingFiles.length > 0;
}

// Get existing test files for a goal and type
export async function getExistingTestFiles(goal, type) {
  await initDirectories();
  
  const testDir = path.join(TESTS_DIR, type, "specs");
  if (!await fs.pathExists(testDir)) {
    return [];
  }
  
  const files = await fs.readdir(testDir);
  const goalFileName = generateFileName(goal);
  
  // Look for test files that match the goal
  const matchingFiles = files.filter(file => 
    file.includes(goalFileName) || 
    file.includes(type) ||
    file.endsWith('.spec.js')
  );
  
  return matchingFiles.map(file => path.join(testDir, file));
}

// Get all test plan files
export async function getAllTestPlans() {
  await initDirectories();
  const files = await fs.readdir(TEST_PLANS_DIR);
  const plans = [];
  
  for (const file of files) {
    if (file.endsWith('.json')) {
      const planData = await fs.readJson(path.join(TEST_PLANS_DIR, file));
      plans.push(planData);
    }
  }
  
  return plans;
}

// Delete test plan file
export async function deleteTestPlan(goal) {
  await initDirectories();
  const fileName = generateFileName(goal);
  const planFile = path.join(TEST_PLANS_DIR, `${fileName}.json`);
  
  if (await fs.pathExists(planFile)) {
    await fs.remove(planFile);
    console.log(`🗑️ Test plan deleted: ${planFile}`);
    return true;
  }
  
  return false;
}

// Clear all test plans
export async function clearAllTestPlans() {
  if (await fs.pathExists(TEST_PLANS_DIR)) {
    await fs.remove(TEST_PLANS_DIR);
    await fs.ensureDir(TEST_PLANS_DIR);
    console.log("🗑️ All test plans cleared!");
  }
}
