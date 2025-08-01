# RAG Architecture Documentation

[Build RAG Application with Neon, Netlify, and OpenAI Guide](https://developers.netlify.com/guides/build-rag-application-with-neon-netlify-openai/)

## Overview

This document outlines the Retrieval-Augmented Generation (RAG) architecture implemented in the AdventureCue project. The system uses a composable, modular approach to handle vector embeddings, similarity search, and AI-generated responses.

## Key Terminology

- **Embed**: Generate vector embeddings from text using OpenAI's embedding model
- **Ingest**: Complete pipeline that chunks text, generates embeddings, and stores them in the database
- **Query**: Search for similar content and generate AI responses using retrieved context

## Available Endpoints

- **`/.netlify/functions/query`** - Semantic search and response generation
- **`/.netlify/functions/chat`** - Query with real-time status updates
- **`/.netlify/functions/ingest`** - Text ingestion through web UI
- **CLI ingestion** - Bulk file processing via `tsx bin/ingest.ts`

## RAG Pipeline Components

### 1. Retrieval Phase

Converts user queries into vector embeddings and searches for similar content in the database using PostgreSQL + pgvector.

### 2. Augmentation Phase

Prepares and formats retrieved documents to provide context for the generation model with relevance ranking.

### 3. Generation Phase

Uses the augmented context to produce AI-generated responses via OpenAI's chat completion with context-aware prompting.

## Directory Structure

The application follows a layered architecture pattern, with clear separation between presentation, API, business logic, and data layers:

```
adventurecue/
├── 📱 PRESENTATION LAYER (Frontend)
│   ├── src/
│   │   ├── app/                 # Next.js app router
│   │   │   ├── layout.tsx       # Root layout
│   │   │   └── page.tsx         # Main page component
│   │   ├── components/          # React components
│   │   │   ├── ingest.tsx       # Ingestion UI component
│   │   │   └── query.tsx        # Query UI component
│   │   └── lib/                 # Frontend utilities
│   └── public/                  # Static assets
│
├── 🌐 API LAYER (Backend Endpoints)
│   └── netlify/functions/
│       ├── ingest.ts            # Text ingestion endpoint
│       ├── query.ts             # Semantic search endpoint
│       └── chat.ts              # Chat with memory endpoint
│
├── ⚙️ CORE LAYER (Business Logic) - Agentic RAG Pipeline
│   └── netlify/services/
│       ├── chat/                # 🤖 GENERATION & ORCHESTRATION
│       │   ├── chat.ts          # → Core conversation engine (Generation Agent)
│       │   ├── chat-status-tracking.ts  # → Real-time agent status (Monitoring)
│       │   ├── chat-status-examples.ts  # → Status message templates
│       │   ├── helpers.ts       # → Conversation utilities
│       │   ├── tools.ts         # → Tool execution framework (Agentic Tools)
│       │   ├── types.ts         # → Chat & agent type definitions
│       │   └── index.ts         # → Service exports
│       ├── embedding/           # 🔍 RETRIEVAL PHASE
│       │   ├── embedding.ts     # → Vector encoding & similarity search (Retrieval Agent)
│       │   ├── types.ts         # → Embedding type definitions
│       │   └── index.ts         # → Service exports
│       ├── ingestion/           # 📥 KNOWLEDGE INGESTION
│       │   ├── ingestion.ts     # → Document processing & knowledge base building
│       │   ├── types.ts         # → Ingestion pipeline types
│       │   └── index.ts         # → Service exports
│       ├── memory/              # 🧠 CONVERSATIONAL MEMORY
│       │   ├── types.ts         # → Session & message schemas (Memory Agent)
│       │   ├── utils.ts         # → Memory management utilities
│       │   └── index.ts         # → Service exports
│       ├── query/               # 🎯 QUERY ORCHESTRATION
│       │   ├── query.ts         # → RAG pipeline orchestrator (Query Agent)
│       │   ├── types.ts         # → Query processing types
│       │   └── index.ts         # → Service exports
│       └── index.ts             # Core layer exports
│
├── 🔌 INTEGRATION LAYER (External Services)
│   ├── netlify/clients/         # External service clients
│   └── netlify/utils/           # Shared utility functions
│
├── 💾 DATA LAYER (Database & Storage)
│   ├── db/
│   │   ├── index.ts             # Database connection & setup
│   │   └── schema.ts            # Schema definitions (embeddings + chat)
│   ├── migrations/              # Database migrations
│   │   ├── 0000_enable-pgvector.sql
│   │   ├── 0001_create-tables.sql
│   │   ├── 0002_create-ivfflat-index.sql
│   │   ├── 0003_ancient_blue_blade.sql  # Chat memory tables
│   │   └── meta/                # Migration metadata
│   └── data/                    # Source data files
│
├── 🛠️ TOOLING LAYER (Development & Operations)
│   ├── bin/
│   │   ├── ingest.ts            # CLI ingestion script
│   │   └── verify-chat-tables.ts # Database verification utility
│   ├── docs/                    # Documentation
│   └── examples/                # Example code & usage
```

## Query Request Flow Diagram

The following diagram shows the complete flow from frontend request to backend response through each composable function:

```mermaid
graph TD
    A[Frontend page tsx] --> B[POST netlify functions query]
    B --> C[handler function]

    C --> D{req.method === POST?}
    D -->|No| E[Return 405 Method Not Allowed]
    D -->|Yes| F[Parse req json]

    F --> G{JSON valid?}
    G -->|No| H[Return 400 Invalid JSON]
    G -->|Yes| I[validateRequest body]

    I --> J{validation.isValid?}
    J -->|No| K[Return 400 plus validation error]
    J -->|Yes| L[processQuery validation data]

    L --> M[generateEmbedding query]
    M --> N[OpenAI API - text-embedding-ada-002]
    N --> O[Return vector embeddings]

    O --> P[findSimilarEmbeddings vector, top_k]
    P --> Q[Neon Database - pgvector search]
    Q --> R[Return similar document chunks]

    R --> S[buildContextPrompt rows]
    S --> T[Format context from chunks]

    T --> U[generateAnswer query, contextText]
    U --> V[OpenAI API gpt-4 chat completion]
    V --> W[Return AI generated answer]

    W --> X[Return Response JSON]
    X --> Y[Frontend receives answer]

    style A fill:#e1f5fe
    style B fill:#f3e5f5
    style C fill:#fff3e0
    style L fill:#e8f5e8
    style M fill:#fff9c4
    style P fill:#fff9c4
    style S fill:#fff9c4
    style U fill:#fff9c4
    style X fill:#e8f5e8
    style Y fill:#e1f5fe
```

## Agentic RAG Architecture Flow

### Query Processing

Frontend → API Layer → Core Services → External APIs → Response

### Service Orchestration

- **Query Agent** orchestrates the RAG pipeline
- **Retrieval Agent** handles vector search operations
- **Generation Agent** manages conversation and responses
- **Memory Agent** maintains session context
- **Tools Framework** enables agentic capabilities

## Architecture Benefits

- **Composability**: Modular services with single responsibilities
- **Scalability**: Independent service scaling and resource management
- **Maintainability**: Clear separation of concerns with TypeScript safety
- **Extensibility**: Easy integration of new RAG components and agentic tools

## Data Ingestion Architecture

### CLI-Based Ingestion

Bulk file processing with rate limiting and error resilience for building the knowledge base.

### UI-Based Ingestion

Real-time text ingestion through web interface for dynamic content addition.

### Processing Pipeline

Environment validation → File processing → Text chunking → Vector embedding → Database storage

## Technology Stack

- **Frontend**: Next.js with React components
- **Backend**: Netlify Functions with TypeScript
- **Database**: PostgreSQL with pgvector extension
- **AI Services**: OpenAI (embeddings + chat completion)
- **ORM**: Drizzle with type-safe migrations
