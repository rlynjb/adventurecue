# RAG Architecture Documentation

[Build RAG Application with Neon, Netlify, and OpenAI Guide](https://developers.netlify.com/guides/build-rag-application-with-neon-netlify-openai/)

## Overview

This document outlines the Retrieval-Augmented Generation (RAG) architecture implemented in the AdventureCue project. The system uses a composable, modular approach to handle vector embeddings, similarity search, and AI-generated responses.

## RAG Pipeline Components

### 1. Retrieval Phase
The retrieval phase converts user queries into vector embeddings and searches for similar content in the database.

**Components:**
- `generateEmbedding()` - Converts user query to vector using OpenAI's embedding model
- `findSimilarEmbeddings()` - Performs vector similarity search using PostgreSQL + pgvector

### 2. Augmentation Phase
The augmentation phase prepares and formats retrieved documents to provide context for the generation model.

**Components:**
- `buildContextPrompt()` - Formats retrieved documents into structured context
- Context preparation with relevance ranking

### 3. Generation Phase
The generation phase uses the augmented context to produce AI-generated responses.

**Components:**
- `generateAnswer()` - Uses OpenAI's chat completion with context-aware prompting

## Directory Structure

```
netlify/
├── functions/
│   ├── query.ts                    # Main endpoint handler
│   ├── ingest.ts                   # Data ingestion endpoint
│   └── search.ts                   # Additional search endpoints
├── lib/
│   ├── clients/
│   │   ├── openai.ts              # OpenAI client initialization
│   │   ├── database.ts            # Neon database client + Drizzle
│   │   └── index.ts               # Export all clients
│   ├── services/
│   │   ├── embedding.ts           # generateEmbedding, findSimilarEmbeddings
│   │   ├── chat.ts                # generateAnswer, buildContextPrompt
│   │   ├── query.ts               # processQuery orchestration
│   │   ├── ingestion.ts           # saveEmbedding, processFile, ingestFiles
│   │   └── index.ts               # Export all services
│   ├── types/
│   │   ├── query.ts               # QueryRequest, EmbeddingRow interfaces
│   │   ├── embedding.ts           # Embedding-related types
│   │   ├── ingestion.ts           # FileData, EmbeddingData, ProcessingResult
│   │   └── index.ts               # Export all types
│   ├── utils/
│   │   ├── validation.ts          # validateRequest, other validators
│   │   ├── response.ts            # Response helpers
│   │   ├── file-system.ts         # walkDirectory, readFileData
│   │   ├── rate-limiting.ts       # rateLimitDelay, createRateLimiter
│   │   └── index.ts               # Export all utils
│   └── config/
│       └── environment.ts         # Environment variable handling
├── shared/
│   ├── middleware/
│   │   ├── cors.ts                # CORS middleware
│   │   └── auth.ts                # Authentication middleware
│   └── constants/
│       └── models.ts              # AI model constants
├── bin/
│   ├── ingest.ts                  # CLI ingestion script
│   └── migrate.ts                 # Database migration script
└── db/
    ├── index.ts                   # Database connection and setup
    ├── schema.ts                  # Database schema definitions
    └── migrations/                # Database migration files
```

## Client Initialization Pattern

### Singleton Pattern for Shared Clients

**OpenAI Client (`netlify/lib/clients/openai.ts`):**
```typescript
import { OpenAI } from "openai";

const OPENAI_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_KEY) {
  throw new Error("Missing OPENAI_API_KEY in environment");
}

// Singleton pattern - initialize once
let openaiClient: OpenAI | null = null;

export const getOpenAIClient = (): OpenAI => {
  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey: OPENAI_KEY });
  }
  return openaiClient;
};
```

**Database Client (`netlify/lib/clients/database.ts`):**
```typescript
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

const DATABASE_URL = process.env.NETLIFY_DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error("Missing DATABASE_URL in environment");
}

// Singleton pattern - initialize once
let sqlClient: any = null;
let db: any = null;

export const getSQLClient = () => {
  if (!sqlClient) {
    sqlClient = neon(DATABASE_URL);
  }
  return sqlClient;
};

export const getDrizzleClient = () => {
  if (!db) {
    const neonSql = getSQLClient();
    db = drizzle(neonSql);
  }
  return db;
};
```

## Utility Functions

### File System Utilities (`netlify/lib/utils/file-system.ts`)
```typescript
import { readdir, readFile } from "fs/promises";
import path from "path";
import { FileData } from "../types";

/**
 * Recursively walk a directory, yielding file paths with specified extensions
 */
export async function* walkDirectory(
  dir: string, 
  extensions: string[] = [".md"]
): AsyncGenerator<string> {
  for (const dirent of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, dirent.name);
    if (dirent.isDirectory()) {
      yield* walkDirectory(full, extensions);
    } else if (dirent.isFile() && extensions.some(ext => full.endsWith(ext))) {
      yield full;
    }
  }
}

/**
 * Read and prepare file data
 */
export const readFileData = async (filePath: string, targetDir: string): Promise<FileData> => {
  const relPath = path.relative(targetDir, filePath);
  const content = await readFile(filePath, "utf8");
  
  return {
    filePath,
    relPath,
    content
  };
};
```

### Rate Limiting Utilities (`netlify/lib/utils/rate-limiting.ts`)
```typescript
/**
 * Add rate limiting between API calls
 */
export const rateLimitDelay = async (ms: number = 200): Promise<void> => {
  await new Promise((r) => setTimeout(r, ms));
};

/**
 * Create a rate limiter function
 */
export const createRateLimiter = (ms: number) => {
  return () => rateLimitDelay(ms);
};
```

## Type Definitions

### Ingestion Types (`netlify/lib/types/ingestion.ts`)
```typescript
export interface FileData {
  filePath: string;
  relPath: string;
  content: string;
}

export interface EmbeddingData {
  content: string;
  embedding: number[];
  filePath: string;
}

export interface ProcessingResult {
  id: number;
  filePath: string;
  relPath: string;
  success: boolean;
  error?: string;
}

export interface IngestionConfig {
  targetDir: string;
  fileExtensions: string[];
  rateLimitMs: number;
  batchSize?: number;
}
```

## Service Layer Implementation

### Embedding Service (`netlify/lib/services/embedding.ts`)
```typescript
import { getOpenAIClient, getSQLClient } from '../clients';
import { EmbeddingRow } from '../types';

export const generateEmbedding = async (text: string): Promise<number[]> => {
  const openai = getOpenAIClient();
  const embedRes = await openai.embeddings.create({
    model: "text-embedding-ada-002",
    input: text,
  });
  return embedRes.data[0].embedding;
};

export const findSimilarEmbeddings = async (
  vector: number[],
  limit: number = 5
): Promise<EmbeddingRow[]> => {
  const sql = getSQLClient();
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
```

### Chat Service (`netlify/lib/services/chat.ts`)
```typescript
import { getOpenAIClient } from '../clients';
import { EmbeddingRow } from '../types';

export const buildContextPrompt = (rows: EmbeddingRow[]): string => {
  return rows.map((row, i) => `Context ${i + 1}:\n${row.content}`).join("\n\n");
};

export const generateAnswer = async (query: string, contextText: string): Promise<string> => {
  const openai = getOpenAIClient();
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
```

### Ingestion Service (`netlify/lib/services/ingestion.ts`)
```typescript
import { sql } from "drizzle-orm";
import { getDrizzleClient } from "../clients";
import { generateEmbedding } from "./embedding";
import { walkDirectory, readFileData } from "../utils/file-system";
import { rateLimitDelay } from "../utils/rate-limiting";
import { embeddings } from "../../../db/schema";
import { FileData, EmbeddingData, ProcessingResult, IngestionConfig } from "../types";

/**
 * Save embedding to database
 */
export const saveEmbedding = async (embeddingData: EmbeddingData): Promise<number> => {
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
export const processFile = async (filePath: string, targetDir: string): Promise<ProcessingResult> => {
  try {
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
    
    return {
      id,
      filePath: fileData.filePath,
      relPath: fileData.relPath,
      success: true
    };
  } catch (error) {
    return {
      id: -1,
      filePath,
      relPath: path.relative(targetDir, filePath),
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
};

/**
 * Process all files in a directory
 */
export const processDirectory = async (config: IngestionConfig): Promise<ProcessingResult[]> => {
  const results: ProcessingResult[] = [];
  
  for await (const filePath of walkDirectory(config.targetDir, config.fileExtensions)) {
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
 */
export const ingestFiles = async (config: IngestionConfig): Promise<ProcessingResult[]> => {
  console.log(`Starting ingestion from directory: ${config.targetDir}`);
  console.log(`File extensions: ${config.fileExtensions.join(", ")}`);
  console.log(`Rate limit: ${config.rateLimitMs}ms`);
  
  try {
    const results = await processDirectory(config);
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
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
```

## CLI Scripts

### Ingestion CLI (`bin/ingest.ts`)
```typescript
#!/usr/bin/env tsx

import { ingestFiles } from "../netlify/lib/services";
import { IngestionConfig } from "../netlify/lib/types";

// Environment validation
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

// Main execution
async function main() {
  const targetDir = process.argv[2] || "./data";
  
  const config: IngestionConfig = {
    targetDir,
    fileExtensions: [".md", ".txt"],
    rateLimitMs: 200,
    batchSize: 10
  };
  
  await ingestFiles(config);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

## Complete RAG Flow

```typescript
// Current implementation in processQuery()
const processQuery = async (queryData: QueryRequest): Promise<string> => {
  const { query, top_k = 5 } = queryData;
  
  // 1. RETRIEVAL: Convert query to embedding
  const vector = await generateEmbedding(query);
  
  // 2. RETRIEVAL: Find similar documents
  const rows = await findSimilarEmbeddings(vector, top_k);
  
  // 3. AUGMENTATION: Build context from retrieved docs
  const contextText = buildContextPrompt(rows);
  
  // 4. GENERATION: Generate answer with context
  const answer = await generateAnswer(query, contextText);
  
  return answer;
};
```

## Key Improvements

### 1. **Single Initialization** 
- The `sql` and `openai` clients are initialized once at the module level and reused by all functions

### 2. **Composable Functions**
- **`generateEmbedding()`** - Handles OpenAI embedding generation
- **`findSimilarEmbeddings()`** - Handles database queries for similar vectors  
- **`buildContextPrompt()`** - Formats context text from database results
- **`generateAnswer()`** - Handles OpenAI chat completion
- **`processQuery()`** - Orchestrates the entire query pipeline
- **`validateRequest()`** - Handles input validation

### 3. **Type Safety**
- Added proper TypeScript interfaces (`QueryRequest`, `EmbeddingRow`)
- Replaced `any` types with proper type annotations
- Added type assertions where needed

### 4. **Separation of Concerns**
- Each function has a single responsibility
- Business logic is separated from HTTP handling
- Easy to test individual components
- Easy to reuse functions in other contexts

### 5. **Benefits of This Structure**
- **Testable**: Each function can be unit tested independently
- **Reusable**: Functions can be imported and used in other files
- **Maintainable**: Changes to one aspect don't affect others
- **Extensible**: Easy to add new features like different embedding models or database operations

## Benefits of This Architecture

### 1. **Composability**
- Each function has a single responsibility
- Easy to swap components (different embedding models, LLMs, etc.)
- Services can be reused across different endpoints

### 2. **Testability**
- Each service can be unit tested independently
- Mock clients for testing without external dependencies
- Clear separation of concerns

### 3. **Scalability**
- Singleton pattern ensures efficient resource usage
- Easy to add new RAG components (reranking, preprocessing, etc.)
- Can scale individual services independently

### 4. **Maintainability**
- Clear directory structure maps to RAG concepts
- Type safety with TypeScript interfaces
- Centralized client management

## Future Enhancements

### Additional RAG Components to Consider:
```
services/
├── preprocessing.ts    # Text chunking, cleaning
├── reranking.ts       # Re-rank retrieved results
├── postprocessing.ts  # Filter/validate generated responses
├── evaluation.ts      # RAG quality metrics
└── hybrid-search.ts   # Combine keyword + semantic search
```

### Advanced Features:
- **Hybrid Search**: Combine keyword and semantic search
- **Re-ranking**: Improve relevance of retrieved documents
- **Caching**: Cache embeddings and responses
- **Streaming**: Stream responses for better UX
- **Evaluation**: Metrics for RAG quality assessment

## Environment Variables

```bash
OPENAI_API_KEY=your_openai_api_key
NETLIFY_DATABASE_URL=your_neon_database_url
```

## Database Schema

```sql
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Embeddings table
CREATE TABLE embeddings (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  embedding vector(1536) NOT NULL -- OpenAI ada-002 dimensions
);

-- Create index for similarity search
CREATE INDEX ON embeddings USING ivfflat (embedding vector_l2_ops);
```

This architecture provides a solid foundation for a production-ready RAG system with clean separation of concerns and excellent maintainability.