import { getOpenAIClient } from "../clients";
import { EmbeddingRow } from "../types";

const openai = getOpenAIClient();

/**
 * Formats context text from database results
 * 
 * @desc Builds a context prompt from the provided embedding rows.
 * @param rows The rows of embedding data to build context from
 * @returns A string representing the context prompt
 */
export const buildContextPrompt = (rows: EmbeddingRow[]): string => {
  return rows.map((row, i) => `Context ${i + 1}:\n${row.content}`).join("\n\n");
};

/**
 * Handles OpenAI chat completion
 * 
 * Generates an answer to the user's query using OpenAI's chat completion
 * @desc Uses the provided context to generate a response to the user's query.
 * @param query The user's question
 * @param contextText The context text built from similar embeddings
 * @returns A promise that resolves to the generated answer
 */
export const generateAnswer = async (query: string, contextText: string): Promise<string> => {
  const chatRes = await openai.chat.completions.create({
    model: "gpt-4.1",
    messages: [
      {
        role: "system",
        content: [
          "You are a helpful assistant. Use the following context snippets to answer the user's question.",
          'If the answer cannot be found in the context, respond with "I\'m not sure."',
          "Please refrain from asking follow up questions and just answer the query to the best of your ability based on the provided context.",
          "",
          contextText,
        ].join("\n"),
      },
      { role: "user", content: query },
    ],
  });

  return chatRes.choices?.[0]?.message?.content ?? "";
};
