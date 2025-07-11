import { OpenAI } from "openai";

const OPENAI_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_KEY) {
  throw new Error("Missing OPENAI_API_KEY in environment");
}

// Singleton pattern - initialize once
let openaiClient: OpenAI | null = null;

export const getOpenAIClient = (): OpenAI => {
  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey: OPENAI_KEY });
  }
  return openaiClient;
};
