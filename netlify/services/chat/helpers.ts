/* eslint-disable @typescript-eslint/no-explicit-any */

import { getOpenAIClient } from "../../clients";

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
