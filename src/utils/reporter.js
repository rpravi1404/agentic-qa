import fs from "fs-extra";
import Handlebars from "handlebars";

export async function generateReport(goal, results) {
  const template = await fs.readFile("./reportTemplate.md", "utf-8");
  const compiled = Handlebars.compile(template);

  const data = {
    timestamp: new Date().toISOString(),
    goal,
    total: results.length,
    passed: results.filter(r => r.status === "PASSED").length,
    failed: results.filter(r => r.status === "FAILED").length,
    tests: results,
    duration: "N/A",
    healCount: results.filter(r => r.healAttempt).length,
    aiSuggestions: "Consider adding more negative scenarios for robustness."
  };

  const output = compiled(data);
  await fs.writeFile("./results/report.html", output);
}
