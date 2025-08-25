import fs from "fs-extra";
import { chatWithLLM } from "../services/llmClient.js";

export async function planTests(goal) {
  const prompt = await fs.readFile("./src/prompts/plannerPrompt.txt", "utf-8");

  const response = await chatWithLLM([
    { role: "system", content: prompt },
    { role: "user", content: goal }
  ]);

  try {
    return JSON.parse(response);
  } catch (err) {
    console.error("❌ Failed to parse LLM output:", response);
    return { goal, tests: [] };
  }
}
