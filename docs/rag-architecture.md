# RAG Architecture Documentation

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
│   │   ├── database.ts            # Neon database client
│   │   └── index.ts               # Export all clients
│   ├── services/
│   │   ├── embedding.ts           # generateEmbedding, findSimilarEmbeddings
│   │   ├── chat.ts                # generateAnswer, buildContextPrompt
│   │   ├── query.ts               # processQuery orchestration
│   │   └── index.ts               # Export all services
│   ├── types/
│   │   ├── query.ts               # QueryRequest, EmbeddingRow interfaces
│   │   ├── embedding.ts           # Embedding-related types
│   │   └── index.ts               # Export all types
│   ├── utils/
│   │   ├── validation.ts          # validateRequest, other validators
│   │   ├── response.ts            # Response helpers
│   │   └── index.ts               # Export all utils
│   └── config/
│       └── environment.ts         # Environment variable handling
└── shared/
    ├── middleware/
    │   ├── cors.ts                # CORS middleware
    │   └── auth.ts                # Authentication middleware
    └── constants/
        └── models.ts              # AI model constants
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

const DATABASE_URL = process.env.NETLIFY_DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error("Missing DATABASE_URL in environment");
}

// Singleton pattern - initialize once
let sqlClient: any = null;

export const getSQLClient = () => {
  if (!sqlClient) {
    sqlClient = neon(DATABASE_URL);
  }
  return sqlClient;
};
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