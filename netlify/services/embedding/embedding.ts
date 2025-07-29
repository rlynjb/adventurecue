import { getOpenAIClient, getSQLClient } from "@netlify/clients";
import { type EmbeddingRow } from "@netlify/services/embedding/types";

const openai = getOpenAIClient();
const sql = getSQLClient();
/**
 * Handles OpenAI embedding generation
 *
 * @desc Generates an embedding for the given text using OpenAI's API.
 * @param text The text to embed.
 * @returns A promise that resolves to an array of numbers representing the embedding.
 */
export const generateEmbedding = async (text: string): Promise<number[]> => {
  const embedRes = await openai.embeddings.create({
    model: "text-embedding-ada-002",
    input: text,
  });
  return embedRes.data[0].embedding;
};

/**
 * Handles database queries for similar vectors
 *
 * @desc Handles the retrieval of similar embeddings from the database
 * @param vector The embedding vector to compare against
 * @param limit The maximum number of similar embeddings to return
 * @returns A promise that resolves to an array of similar embedding rows
 */
export const findSimilarEmbeddings = async (
  vector: number[],
  limit: number = 5
): Promise<EmbeddingRow[]> => {
  const vecString = `[${vector.join(",")}]`;

  const rows = await sql`
    SELECT id, content,
           embedding <=> ${vecString}::vector AS distance
    FROM embeddings
    ORDER BY distance
    LIMIT ${limit}
  `;

  return rows as EmbeddingRow[];
};
