/* eslint-disable @typescript-eslint/no-explicit-any */

import { getOpenAIClient } from "../../clients";
import { type EmbeddingRow } from "../embedding/types";

const openai = getOpenAIClient();

/**
 * Makes an OpenAI API call with the given parameters
 */
export const callOpenAI = async (
  input: any[],
  tools: any[],
  store = false
): Promise<any> => {
  return await openai.responses.create({
    model: "gpt-4.1",
    input,
    tools,
    ...(store && { store: true }),
  });
};


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