import fs from "fs-extra";

export async function storeResult(outcome) {
  await fs.ensureDir("./results");
  await fs.appendFile("./results/run.jsonl", JSON.stringify(outcome) + "\n");
}
