import { chromium } from "playwright";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function runUITest(test) {
  console.log(`🌐 Running UI test: ${test.name}`);
  
  // Find UI test files in the tests/ui/specs directory
  const uiTestDir = path.join(__dirname, "../../tests/ui/specs");
  
  if (!await fs.pathExists(uiTestDir)) {
    throw new Error(`UI test directory not found: ${uiTestDir}`);
  }
  
  const testFiles = await fs.readdir(uiTestDir);
  const specFiles = testFiles.filter(file => file.endsWith('.spec.js'));
  
  if (specFiles.length === 0) {
    throw new Error("No UI test spec files found in tests/ui/specs/");
  }
  
  console.log(`📁 Found ${specFiles.length} UI test file(s): ${specFiles.join(', ')}`);
  
  const results = [];
  
  for (const specFile of specFiles) {
    const specPath = path.join(uiTestDir, specFile);
    console.log(`▶ Running spec file: ${specFile}`);
    
    try {
      // Run the test file using Playwright test runner
      const { stdout, stderr } = await execAsync(`npx playwright test "${specPath}" --reporter=line`, {
        cwd: process.cwd(),
        timeout: 60000 // 60 second timeout per test file
      });
      
      if (stderr && stderr.includes('Error:')) {
        throw new Error(stderr);
      }
      
      console.log(`✅ ${specFile} completed successfully`);
      results.push({ file: specFile, status: 'PASSED', output: stdout });
    } catch (error) {
      console.error(`❌ Error running ${specFile}:`, error.message);
      results.push({ file: specFile, status: 'FAILED', error: error.message });
    }
  }
  
  return {
    ...test,
    results,
    totalFiles: specFiles.length,
    passedFiles: results.filter(r => r.status === 'PASSED').length,
    failedFiles: results.filter(r => r.status === 'FAILED').length,
    skippedFiles: results.filter(r => r.status === 'SKIPPED').length
  };
}
