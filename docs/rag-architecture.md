# RAG Architecture Documentation

[Build RAG Application with Neon, Netlify, and OpenAI Guide](https://developers.netlify.com/guides/build-rag-application-with-neon-netlify-openai/)

## Overview

This document outlines the Retrieval-Augmented Generation (RAG) architecture implemented in the AdventureCue project. The system uses a composable, modular approach to handle vector embeddings, similarity search, and AI-generated responses.

## Agentic RAG Pipeline Components

```mermaid
flowchart LR
    A["1. Planning & Reasoning"] --> B["2. Retrieval"]
    A --> C["3. Tool Execution"]
    B --> D["4. Augmentation & Memory"]
    C --> D
    D --> E["5. Generation & Response"]
    E --> F["6. Learning & Adaptation"]
    F --> A

    style A fill:#e8f4fd
    style B fill:#fff2cc
    style C fill:#f0f8e8
    style D fill:#fce4ec
    style E fill:#f3e5f5
    style F fill:#e0f2f1
```

### 1. Planning & Reasoning Phase

Agent analyzes user requests to determine optimal approach and required tools. Breaks down complex queries, selects appropriate tools, and plans multi-step workflows.

### 2. Retrieval Phase

Enhanced semantic search using PostgreSQL + pgvector with contextual retrieval considering conversation history and relevance filtering.

### 3. Tool Execution Phase

Dynamic invocation of external APIs, computational tools, database queries, and custom business logic based on query requirements.

### 4. Augmentation & Memory Phase

Intelligent context building combining retrieved documents, conversation history, tool results, and system instructions with real-time status tracking.

### 5. Generation & Response Phase

AI-powered response generation using OpenAI's chat completion with context-aware prompting, tool-augmented responses, and conversational memory persistence.

### 6. Learning & Adaptation Phase

Continuous improvement through session management, feedback incorporation, pattern recognition, and memory optimization for personalized experiences.

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

## Key Terminology

### Agentic RAG Pipeline Terms

- **Chat Agent**: Core conversation orchestrator that manages the complete chat pipeline including memory, tools, and response generation (implemented in `chat/chat.ts`).

- **Tool Execution**: Dynamic invocation of external functions and services based on query analysis, with standardized tool calling interface (implemented in `chat/tools.ts`).

- **Chat Session**: Persistent conversation container that maintains continuity across multiple message exchanges with unique session identifiers (schema in `memory/types.ts`).

- **Status Tracking**: Real-time progress monitoring system that provides step-by-step feedback during chat processing (implemented in `chat/chat-status-tracking.ts`).

- **Chat Message**: Individual conversation units with role-based typing (user, assistant, system) stored with session context (schema in `memory/types.ts`).

- **Session Management**: Utilities for creating, retrieving, and managing chat sessions including session ID generation and title management (implemented in `memory/utils.ts`).

- **Context Augmentation**: Process of combining retrieved documents, conversation history, and tool results into comprehensive prompts for generation.

- **Vector Similarity Search**: Semantic content matching using PostgreSQL pgvector extension to find relevant documents based on embedding distance calculations.

- **Embedding Generation**: Converting text queries into high-dimensional vectors using OpenAI's embedding models for similarity search operations.

- **Chat Status Messages**: Predefined status templates and messages for consistent user feedback during processing steps (implemented in `chat/chat-status-examples.ts`).

- **Multi-Modal Ingestion**: Support for processing different content types through both CLI bulk processing and UI-based real-time ingestion.

- **Session Memory Persistence**: Database storage of conversation history enabling context retrieval across multiple interactions within the same session.

## Chat Request Flow Diagram

The following diagram shows the complete flow from frontend request to backend response through the chat endpoint with memory and real-time status updates:

```mermaid
graph TD
    A[Frontend chat interface] --> B[POST netlify functions chat]
    B --> C[chat handler function]

    C --> D{req.method === POST?}
    D -->|No| E[Return 405 Method Not Allowed]
    D -->|Yes| F[Parse req json]

    F --> G{JSON valid?}
    G -->|No| H[Return 400 Invalid JSON]
    G -->|Yes| I[validateChatRequest body]

    I --> J{validation.isValid?}
    J -->|No| K[Return 400 plus validation error]
    J -->|Yes| L[processChat validation data]

    L --> M[Initialize chat status tracking]
    M --> N[Load/create session memory]
    N --> O[generateEmbedding query]
    O --> P[OpenAI API - text-embedding-ada-002]
    P --> Q[Return vector embeddings]

    Q --> R[findSimilarEmbeddings vector, top_k]
    R --> S[Neon Database - pgvector search]
    S --> T[Return similar document chunks]

    T --> U[buildContextPrompt with memory]
    U --> V[Format context + conversation history]

    V --> W[generateAnswer with tools support]
    W --> X[OpenAI API gpt-4 chat completion]
    X --> Y[Store message in session memory]

    Y --> Z[Return Response with status]
    Z --> AA[Frontend receives chat response]

    style A fill:#e1f5fe
    style B fill:#f3e5f5
    style C fill:#fff3e0
    style L fill:#e8f5e8
    style M fill:#ffeb3b
    style N fill:#ffeb3b
    style O fill:#fff9c4
    style R fill:#fff9c4
    style U fill:#fff9c4
    style W fill:#fff9c4
    style Y fill:#ffeb3b
    style Z fill:#e8f5e8
    style AA fill:#e1f5fe
```

## Agentic RAG Architecture Flow

### Chat Processing

Frontend → API Layer → Chat Services → Memory & Tools → External APIs → Response

### Service Orchestration

- **Chat Agent** orchestrates the conversation and RAG pipeline
- **Retrieval Agent** handles vector search operations
- **Generation Agent** manages responses with tool execution
- **Memory Agent** maintains session context and conversation history
- **Status Tracking** provides real-time operation updates

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
