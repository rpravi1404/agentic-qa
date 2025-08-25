// src/llmClient.js
import ollama from "ollama";
import OpenAI from "openai";
import 'dotenv/config';
import { mockChatWithLLM } from "./mockLLMClient.js";

const preferOpenAI = process.env.PREFER_OPENAI === "true";
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

// Test mode flag - set to true to use mock responses
const TEST_MODE = process.env.TEST_MODE === "true";

/**
 * Generic LLM call.
 * In test mode, returns mock responses without connecting to real LLM services.
 * Otherwise tries OpenAI first if PREFER_OPENAI=true.
 * Otherwise tries Ollama first, then falls back to OpenAI.
 */
export async function chatWithLLM(messages, { modelOllama = "llama3", modelOpenAI = "gpt-4o-mini" } = {}) {
  // Test mode - return mock responses
  if (TEST_MODE) {
    return mockChatWithLLM(messages);
  }

  // Production mode - use real LLM services
  if (preferOpenAI && openai) {
    return callOpenAI(messages, modelOpenAI);
  }

  // Default: Ollama → OpenAI fallback
  try {
    const response = await ollama.chat({
      model: modelOllama,
      messages
    });

    if (response?.message?.content) {
      return response.message.content;
    }
  } catch (err) {
    console.warn("⚠️ Ollama not available or failed:", err.message);
  }

  if (openai) {
    return callOpenAI(messages, modelOpenAI);
  }

  throw new Error("❌ No LLM backend available (Ollama not running, and no OPENAI_API_KEY set).");
}

async function callOpenAI(messages, model) {
  const response = await openai.chat.completions.create({
    model,
    messages
  });
  return response.choices[0].message.content;
}
