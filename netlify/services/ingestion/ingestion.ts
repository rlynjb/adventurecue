import { sql } from "drizzle-orm";
import path from "path";
import { embeddings } from "../../../db/schema";
import { getDrizzleClient } from "../../clients";
import { EmbeddingData, IngestionConfig, ProcessingResult } from "../../types";
import { readFileData, walkDirectory } from "../../utils/file-system";
import { rateLimitDelay } from "../../utils/rate-limiting";
import { generateEmbedding } from "../embedding";

export const processText = async (text: string): Promise<unknown> => {
  try {
    /**
     * @TODO
     * Add Chunking logic here before generating embeddings
     * https://chonkie.ai/
     * https://www.npmjs.com/package/openai-gpt-token-counter
     * https://www.google.com/search?q=typescript+chunk+text&oq=typescript+chunk+text&gs_lcrp=EgZjaHJvbWUyBggAEEUYOTIICAEQABgWGB4yBwgCEAAY7wUyBwgDEAAY7wUyBwgEEAAY7wUyCggFEAAYgAQYogTSAQkxMTEzM2owajeoAgCwAgA&sourceid=chrome&ie=UTF-8
     */

    // 2. Generate embeddings for each file
    // Generate embedding
    const embedding = await generateEmbedding(text);

    // 3. Save the output to database
    // Save to database
    const embeddingData: EmbeddingData = {
      content: text,
      embedding,
      filePath: "none",
    };

    const id = await saveEmbedding(embeddingData);

    return {
      id,
      success: true,
    };
  } catch (error) {
    return {
      id: -1,
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
};

/**
 * Save embedding to database
 */
export const saveEmbedding = async (
  embeddingData: EmbeddingData
): Promise<number> => {
  const db = getDrizzleClient();
  const vecString = `[${embeddingData.embedding.join(",")}]`;

  const [inserted] = await db
    .insert(embeddings)
    .values({
      chunk_index: 0,
      content: embeddingData.content,
      embedding: sql`${vecString}::vector`,
    })
    .returning({ id: embeddings.id });

  return inserted.id;
};

/**
 * Process a single file: read, generate embedding, and save
 */
export const processFile = async (
  filePath: string,
  targetDir: string
): Promise<ProcessingResult> => {
  try {
    // Read file data
    const fileData = await readFileData(filePath, targetDir);

    /**
     * @TODO
     * Add Chunking logic here before generating embeddings
     * https://chonkie.ai/
     * https://www.npmjs.com/package/openai-gpt-token-counter
     * https://www.google.com/search?q=typescript+chunk+text&oq=typescript+chunk+text&gs_lcrp=EgZjaHJvbWUyBggAEEUYOTIICAEQABgWGB4yBwgCEAAY7wUyBwgDEAAY7wUyBwgEEAAY7wUyCggFEAAYgAQYogTSAQkxMTEzM2owajeoAgCwAgA&sourceid=chrome&ie=UTF-8
     */

    // 2. Generate embeddings for each file
    // Generate embedding
    const embedding = await generateEmbedding(fileData.content);

    // 3. Save the output to database
    // Save to database
    const embeddingData: EmbeddingData = {
      content: fileData.content,
      embedding,
      filePath: fileData.filePath,
    };

    const id = await saveEmbedding(embeddingData);

    return {
      id,
      filePath: fileData.filePath,
      relPath: fileData.relPath,
      success: true,
    };
  } catch (error) {
    return {
      id: -1,
      filePath,
      relPath: path.relative(targetDir, filePath),
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
};

/**
 * Process all files in a directory
 */
export const processDirectory = async (
  config: IngestionConfig
): Promise<ProcessingResult[]> => {
  const results: ProcessingResult[] = [];

  // 1. Iterate over all files in the target directory
  for await (const filePath of walkDirectory(
    config.targetDir,
    config.fileExtensions
  )) {
    // Throttle to avoid hitting rate limits
    await rateLimitDelay(config.rateLimitMs);

    const result = await processFile(filePath, config.targetDir);
    results.push(result);

    if (result.success) {
      console.log(`✓ Inserted ${result.relPath} with ID ${result.id}`);
    } else {
      console.error(`✗ Failed to process ${result.relPath}: ${result.error}`);
    }
  }

  return results;
};

/**
 * Main orchestration function
 * - Ingestion process starts here
 */
export const ingestFiles = async (
  config: IngestionConfig
): Promise<ProcessingResult[]> => {
  console.log(`Starting ingestion from directory: ${config.targetDir}`);
  console.log(`File extensions: ${config.fileExtensions.join(", ")}`);
  console.log(`Rate limit: ${config.rateLimitMs}ms`);

  try {
    const results = await processDirectory(config);
    const successful = results.filter((r) => r.success);
    const failed = results.filter((r) => !r.success);

    console.log(`\nIngestion complete:`);
    console.log(`- Successful: ${successful.length}`);
    console.log(`- Failed: ${failed.length}`);
    console.log(`- Total: ${results.length}`);

    return results;
  } catch (error) {
    console.error("Error during ingestion:", error);
    throw error;
  }
};
