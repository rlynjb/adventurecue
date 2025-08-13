# RAG Architecture Documentation

[Build RAG Application with Neon, Netlify, and OpenAI Guide](https://developers.netlify.com/guides/build-rag-application-with-neon-netlify-openai/)

[Building the Entire RAG Ecosystem and Optimizing Every Component](https://levelup.gitconnected.com/building-the-entire-rag-ecosystem-and-optimizing-every-component-8f23349b96a4#7fbd)

## Table of Contents

- [Overview](#overview)
- [Directory Structure](#directory-structure)
- [Key Terminology](#key-terminology)
- [Technology Stack](#technology-stack)

## Overview

This document outlines the Retrieval-Augmented Generation (RAG) architecture implemented in the AdventureCue project. The system uses a composable, modular approach to handle vector embeddings, similarity search, and AI-generated responses.

## Directory Structure

The application follows a layered architecture pattern, with clear separation between presentation, API, business logic, and data layers:

```
adventurecue/
├── 📱 PRESENTATION LAYER (Frontend)
│   ├── src/
│   │   ├── app/                 # Next.js app router
│   │   │   ├── layout.tsx       # Root layout
│   │   │   ├── page.tsx         # Main page component
│   │   │   ├── globals.css      # Global styles
│   │   │   └── favicon.ico      # App favicon
│   │   └── components/          # React components
│   │       └── ingest.tsx       # Ingestion UI component
│   └── public/                  # Static assets
│
├── 🌐 API LAYER (Backend Endpoints)
│   └── netlify/functions/
│       ├── chat/                # Chat endpoint with validation
│       │   ├── index.ts         # Chat with memory endpoint
│       │   └── validation.ts    # Chat request validation
│       └── ingest/              # Ingestion endpoint with validation
│           ├── index.ts         # Text ingestion endpoint
│           └── validation.ts    # Ingestion request validation
│
├── ⚙️ CORE LAYER (Business Logic) - Agentic RAG Pipeline
│   └── netlify/services/
│       ├── chat/                # 🤖 GENERATION & ORCHESTRATION
│       │   ├── chat.ts          # → Core conversation engine (Generation Agent)
│       │   ├── helpers.ts       # → Conversation utilities
│       │   ├── types.ts
│       │   └── index.ts
│       ├── embedding/           # 🔍 RETRIEVAL PHASE
│       │   ├── embedding.ts     # → Vector encoding & similarity search (Retrieval Agent)
│       │   ├── types.ts
│       │   └── index.ts
│       ├── generation/          # ⚡ AI GENERATION UTILITIES
│       │   └── index.ts         # → Reusable AI generation functions
│       ├── ingestion/           # 📥 KNOWLEDGE INGESTION
│       │   ├── ingestion.ts     # → Document processing & knowledge base building
│       │   ├── types.ts
│       │   └── index.ts
│       ├── memory/              # 🧠 CONVERSATIONAL MEMORY
│       │   ├── types.ts
│       │   ├── utils.ts         # → Memory management utilities
│       │   └── index.ts
│       ├── prompts/             # 📝 PROMPT MANAGEMENT
│       │   ├── prompts.ts       # → System & user prompt templates
│       │   ├── types.ts
│       │   ├── utils.ts         # → Prompt utilities
│       │   └── index.ts
│       ├── status/              # 📊 STATUS TRACKING
│       │   ├── status-tracking.ts    # → Real-time operation monitoring
│       │   ├── status-examples.ts    # → Usage examples & templates
│       │   └── index.ts
│       ├── streaming/           # 🌊 REAL-TIME STREAMING
│       │   ├── sse-handler.ts   # → Server-Sent Events implementation
│       │   ├── roadmap.md       # → Future enhancement roadmap
│       │   └── index.ts         # → Streaming service exports
│       ├── tools/               # 🛠️ TOOL EXECUTION
│       │   ├── tools.ts         # → Tool execution framework (Agentic Tools)
│       │   └── index.ts
│       └── index.ts
│
├── 🔌 INTEGRATION LAYER (External Services)
│   ├── netlify/clients/         # External service clients
│   │   ├── database.ts          # → Database connection utilities
│   │   ├── openai.ts            # → OpenAI API client
│   │   └── index.ts
│   ├── netlify/types/           # Shared type definitions
│   └── netlify/utils/           # Shared utility functions
│       ├── file-system.ts       # → File system operations
│       ├── rate-limiting.ts     # → Rate limiting utilities
│       ├── validation.ts        # → Request validation
│       └── index.ts
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

│ ├── db/
│ │ ├── index.ts # Database connection & setup
│ │ └── schema.ts # Schema definitions (embeddings + chat)
│ ├── migrations/ # Database migrations
│ │ ├── 0000_enable-pgvector.sql
│ │ ├── 0001_create-tables.sql
│ │ ├── 0002_create-ivfflat-index.sql
│ │ ├── 0003_ancient_blue_blade.sql # Chat memory tables
│ │ └── meta/ # Migration metadata
│ └── data/ # Source data files
│
├── 🛠️ TOOLING LAYER (Development & Operations)
│ ├── bin/
│ │ ├── ingest.ts # CLI ingestion script
│ │ └── verify-chat-tables.ts # Database verification utility
│ ├── docs/ # Documentation
│ └── examples/ # Example code & usage

```

## Key Terminology

### Agentic RAG Pipeline Terms

- **Chat Agent**: Core conversation orchestrator that manages the complete chat pipeline including memory, tools, and response generation (implemented in `chat/chat.ts`).

- **Generation Service**: Reusable AI generation utilities providing common functions for message building and model interaction (implemented in `generation/index.ts`).

- **Tool Execution**: Dynamic invocation of external functions and services based on query analysis, with standardized tool calling interface (implemented in `tools/tools.ts`).

- **Chat Session**: Persistent conversation container that maintains continuity across multiple message exchanges with unique session identifiers (schema in `memory/types.ts`).

- **Status Tracking**: Real-time progress monitoring system that provides step-by-step feedback during chat processing (implemented in `status/status-tracking.ts`).

- **Streaming Service**: Real-time response delivery system using Server-Sent Events (SSE) for live status updates and progressive result streaming (implemented in `streaming/sse-handler.ts`).

- **SSE Protocol**: Server-Sent Events implementation following web standards for unidirectional real-time communication from server to client with proper event formatting and connection management.

- **Chat Message**: Individual conversation units with role-based typing (user, assistant, system) stored with session context (schema in `memory/types.ts`).

- **Session Management**: Utilities for creating, retrieving, and managing chat sessions including session ID generation and title management (implemented in `memory/utils.ts`).

- **Context Augmentation**: Process of combining retrieved documents, conversation history, and tool results into comprehensive prompts for generation.

- **Vector Similarity Search**: Semantic content matching using PostgreSQL pgvector extension to find relevant documents based on embedding distance calculations.

- **Embedding Generation**: Converting text queries into high-dimensional vectors using OpenAI's embedding models for similarity search operations.

- **Chat Status Messages**: Predefined status templates and messages for consistent user feedback during processing steps (implemented in `status/status-examples.ts`).

- **Multi-Modal Ingestion**: Support for processing different content types through both CLI bulk processing and UI-based real-time ingestion.

- **Session Memory Persistence**: Database storage of conversation history enabling context retrieval across multiple interactions within the same session.

## Technology Stack

### **Frontend Architecture**

- **Next.js**: React-based framework with app router
- **TypeScript**: Type-safe development environment
- **Real-time UI**: Server-Sent Events for live status updates
- **Component Library**: Modular React components for chat and ingestion

### **Backend Architecture**

- **Netlify Functions**: Serverless API endpoints
- **TypeScript**: End-to-end type safety
- **Server-Sent Events**: Real-time status streaming
- **Modular Services**: Layered business logic architecture

### **AI & ML Stack**

- **OpenAI GPT-4**: Agentic chat completion with tool calling
- **OpenAI Embeddings**: text-embedding-ada-002 for vector generation
- **Tool Integration**: Dynamic external API orchestration
- **Context Management**: Intelligent prompt engineering

### **Database & Vector Search**

- **PostgreSQL**: Primary data storage with ACID compliance
- **pgvector Extension**: High-performance vector similarity search
- **Drizzle ORM**: Type-safe database operations and migrations
- **IVFFlat Indexing**: Optimized vector search performance

### **Memory & Session Management**

- **Chat Sessions**: Persistent conversation containers
- **Message History**: Role-based conversation storage
- **Session Persistence**: Cross-request memory continuity
- **Context Retrieval**: Intelligent conversation history integration

### **Real-time Features**

- **Status Tracking**: Live processing feedback with step-by-step visibility
- **Streaming Service**: Dedicated SSE service for real-time response delivery
- **Server-Sent Events**: Standards-compliant streaming protocol implementation
- **Progressive Responses**: Incremental result delivery during processing
- **Connection Management**: Robust stream lifecycle with error recovery
- **Client Integration**: TypeScript SSE client library for frontend consumption
- **Error Handling**: Graceful failure recovery with automatic reconnection

### **Data Processing Pipeline**

- **CLI Ingestion**: Bulk document processing utilities
- **UI Ingestion**: Real-time content addition interface
- **Text Chunking**: Intelligent document segmentation
- **Vector Generation**: Automated embedding creation
- **Rate Limiting**: Production-ready processing controls

### **Development & Operations**

- **TypeScript**: Full-stack type safety
- **Migration System**: Database schema evolution
- **Validation**: Request/response data integrity
- **Error Boundaries**: Comprehensive error handling
- **Monitoring**: Built-in status and health checks
```
