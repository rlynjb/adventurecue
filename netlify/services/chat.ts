/* eslint-disable @typescript-eslint/no-explicit-any */

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
export const generateAnswer = async (
  query: string,
  contextText: string
): Promise<any> => {
  /**
   * Step 1: Call model with user query, context from vector DB, and tools.
   */
  const input: any[] = [
    {
      role: "system",
      content: `
        You're a helpful travel assistant. When recommending places, include the following in a JSON format:

        In intro property, respond with the conversational tone first.
        And then include all recommendations in places property.
        End with a friendly offer to help further in outro property.

        {
          "intro": "string",
          "places": [
            {
              "name": "string",
              "description": "string",
              "type": "e.g. Cultural, Nature, Food",
              "location": "approximate area in the city"
            }
          ],
          "outro": "string"
        }
      `,
    },
    { role: "user", content: query },
    { role: "assistant", content: contextText },
  ];

  const tools: any[] = [
    { type: "web_search_preview" },
    { type: "web_search_preview_2025_03_11" },
  ];

  const response = await openai.responses.create({
    model: "gpt-4.1",
    input,
    tools,
  });

  /**
   * Step 2: Model decides to call function(s) – model returns the name and input arguments.
   */
  console.log("tools LLM wants to call -----", response.output);

  /**
   * Step 3: Execute function code – parse the model's response and handle function calls.
   */
  const toolCall = response.output?.[0];
  if (toolCall?.type === "web_search_call") {
    console.log("Searching web.....");

    /**
     * Step 4: Supply model with results – so it can incorporate them into its final response.
     */
    input.push(toolCall);

    const followUpResponse = await openai.responses.create({
      model: "gpt-4.1",
      input,
      tools,
      store: true,
    });

    /**
     * Step 5: Model responds – incorporating the result in its output.
     */
    console.log("final response --- ", followUpResponse.output);
    return followUpResponse.output_text ?? "";
  }

  console.log("sufficient response ----", response.output);
  return response.output_text ?? "";
};
