import fs from "fs-extra";
import { chatWithLLM } from "../services/llmClient.js";

export async function attemptSelfHeal(selector, html) {
  const prompt = await fs.readFile("./src/prompts/selfHealPrompt.txt", "utf-8");

  const response = await chatWithLLM([
    { role: "system", content: prompt },
    { role: "user", content: `Failed selector: ${selector}\nHTML:\n${html}` }
  ]);

  try {
    return JSON.parse(response);
  } catch (err) {
    console.error("⚠️ Self-heal JSON parse failed:", response);
    return null;
  }
}
