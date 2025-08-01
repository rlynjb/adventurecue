import { type EmbeddingRow } from "../embedding/types";

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
