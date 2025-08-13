import { getOpenAIClient, getSQLClient } from "../../clients";
import { type EmbeddingRow, QueryRequest } from "../../types";

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
 * Generates context for the given query data.
 * @param queryData
 * @returns
 */
export const generateContext = async (
  queryData: QueryRequest
): Promise<string> => {
  const { query, top_k = 5 } = queryData;

  /**
   * read: https://levelup.gitconnected.com/building-the-entire-rag-ecosystem-and-optimizing-every-component-8f23349b96a4#7fbd
   *
   * ======
   *
   * 1. INDEXING PHASE
   * Functionality is in services/ingestion.ts
   * Organize and store data in a structured format to enable efficient searching.
   * services/ingestion file consists of:
   * - Reading files from data directory
   * - Optional chunking of text
   * - Generating embeddings for text chunks
   * --- generateEmbedding() - inside services/embedding
   * --- uses OpenAI's text-embedding-ada-002 model
   * - Saving embeddings to Neon pgvector database (saveEmbedding())
   *
   * ======
   *
   * 2. RETRIEVAL PHASE
   * functionality is in services/embedding.ts
   * Search and fetch relevant data based on a query or input.
   * It takes a user’s query, embeds it, and then fetches the most
   * semantically similar chunks from the vector store.
   *
   * =======
   *
   * 3. GENERATION PHASE
   * functionality is in services/generation and services/streaming
   * Create a final response or output using the retrieved data.
   * We have our context, but we need an LLM to read it and formulate
   * a human-friendly answer.
   *
   * - First, we need a good prompt template. This instructs the LLM on how to behave.
   * - 2nd, we initialize our LLM. We’ll use gpt-3.5-turbo.
   */

  // 2. RETRIEVAL PHASE
  // Generate embedding for the user query
  const vector = await generateEmbedding(query);
  // Find similar embeddings
  const rows = await findSimilarEmbeddings(vector, top_k);
  // Build context and generate answer
  const contextText = buildContextPrompt(rows);

  return contextText;
};
