#!/usr/bin/env tsx

import { readdir, readFile } from "fs/promises";
import path from "path";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { sql } from "drizzle-orm";
import { OpenAI } from "openai";
import { embeddings } from "../db/schema"; // adjust path to your schema

const OPENAI_KEY = process.env.OPENAI_API_KEY;
const DATABASE_URL = process.env.NETLIFY_DATABASE_URL;

if (!OPENAI_KEY) {
  console.error("Missing OPENAI_API_KEY in environment");
  process.exit(1);
}
if (!DATABASE_URL) {
  console.error("Missing DATABASE_URL in environment");
  process.exit(1);
}

// Initialize clients once
const neonSql = neon(DATABASE_URL);
const db = drizzle(neonSql);
const openai = new OpenAI({ apiKey: OPENAI_KEY });

// Types
interface FileData {
  filePath: string;
  relPath: string;
  content: string;
}

interface EmbeddingData {
  content: string;
  embedding: number[];
  filePath: string;
}

// Composable functions using the initialized clients

/**
 * Recursively walk a directory, yielding every Markdown file path.
 */
async function* walkDirectory(dir: string): AsyncGenerator<string> {
  for (const dirent of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, dirent.name);
    if (dirent.isDirectory()) {
      yield* walkDirectory(full);
    } else if (dirent.isFile() && full.endsWith(".md")) {
      yield full;
    }
  }
}

/**
 * Read and prepare file data
 */
const readFileData = async (filePath: string, targetDir: string): Promise<FileData> => {
  const relPath = path.relative(targetDir, filePath);
  const content = await readFile(filePath, "utf8");
  
  return {
    filePath,
    relPath,
    content
  };
};

/**
 * Generate embedding for text content
 */
const generateEmbedding = async (content: string): Promise<number[]> => {
  const response = await openai.embeddings.create({
    model: "text-embedding-ada-002",
    input: content,
  });
  return response.data[0].embedding;
};

/**
 * Save embedding to database
 */
const saveEmbedding = async (embeddingData: EmbeddingData): Promise<number> => {
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
const processFile = async (filePath: string, targetDir: string): Promise<void> => {
  // Read file data
  const fileData = await readFileData(filePath, targetDir);
  
  // Generate embedding
  const embedding = await generateEmbedding(fileData.content);
  
  // Save to database
  const embeddingData: EmbeddingData = {
    content: fileData.content,
    embedding,
    filePath: fileData.filePath
  };
  
  const id = await saveEmbedding(embeddingData);
  
  console.log(`Inserted ${fileData.relPath} with ID ${id}`);
};

/**
 * Add rate limiting between API calls
 */
const rateLimitDelay = async (ms: number = 200): Promise<void> => {
  await new Promise((r) => setTimeout(r, ms));
};

/**
 * Process all files in a directory
 */
const processDirectory = async (targetDir: string): Promise<void> => {
  for await (const filePath of walkDirectory(targetDir)) {
    // Throttle to avoid hitting rate limits
    await rateLimitDelay(200);
    
    try {
      await processFile(filePath, targetDir);
    } catch (error) {
      console.error(`Error processing ${filePath}:`, error);
      // Continue processing other files
    }
  }
};

/**
 * Main orchestration function
 */
const ingestFiles = async (targetDir: string = "./data"): Promise<void> => {
  console.log(`Starting ingestion from directory: ${targetDir}`);
  
  try {
    await processDirectory(targetDir);
    console.log("All embeddings saved to the database.");
  } catch (error) {
    console.error("Error during ingestion:", error);
    throw error;
  }
};

// Main execution
async function main() {
  const targetDir = process.argv[2] || "./data";
  await ingestFiles(targetDir);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
