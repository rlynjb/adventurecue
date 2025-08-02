import { generateSimpleAnswer } from "../chat";
import { findSimilarEmbeddings, generateEmbedding } from "../embedding";
import { buildContextPrompt } from "../prompts";
import { QueryRequest } from "./types";

/**
 * Orchestrates the entire query pipeline
 *
 * @param queryData The query request containing the user's question and optional top_k parameter
 * @desc Processes the user's query by generating an embedding, finding similar embeddings in the database,
 * building a context prompt, and generating an answer using OpenAI's chat completion.
 * @returns A promise that resolves to the generated answer
 */
export const processQuery = async (
  queryData: QueryRequest
): Promise<string> => {
  const { query, top_k = 5 } = queryData;

  // Generate embedding for the user query
  const vector = await generateEmbedding(query);

  // Find similar embeddings
  const rows = await findSimilarEmbeddings(vector, top_k);

  // Build context and generate answer
  const contextText = buildContextPrompt(rows);
  const answer = await generateSimpleAnswer(query, contextText);

  return answer;
};
