# System Architecture Overview

## High-Level Architecture Diagram

```mermaid
graph TB
    subgraph "Client Layer"
        A[React/HTML Client]
        B[Status UI Components]
        C[Event Listeners]
    end

    subgraph "API Layer"
        D[Netlify Functions]
        E[chat.ts]
        F[Validation Utils]
    end

    subgraph "Service Layer"
        G[Chat Service]
        H[Query Service]
        I[Embedding Service]
        J[Ingestion Service]
        K[Memory Service]
    end

    subgraph "Core Components"
        L[generateAnswer]
        M[executeToolCall]
        N[callOpenAI]
        O[buildContextPrompt]
        P[Chat Status Tracking]
        Q[Session Management]
        R[Message Storage]
    end

    subgraph "External APIs"
        S[OpenAI API]
        T[Tool APIs]
        U[Database]
    end

    subgraph "Type System"
        V[ChatStatus Interface]
        W[ChatResponse Interface]
        X[EmbeddingRow Interface]
        Y[ChatSession Interface]
        Z[ChatMessage Interface]
    end

    A --> D
    B --> C
    C --> A
    D --> E
    E --> F
    E --> G
    G --> H
    G --> I
    G --> J
    G --> K
    G --> L
    L --> M
    L --> N
    L --> O
    L --> P
    M --> T
    N --> S
    O --> U
    K --> Q
    K --> R

    G --> V
    G --> W
    I --> X
    K --> Y
    K --> Z

    style A fill:#e1f5fe
    style G fill:#f3e5f5
    style L fill:#fff3e0
    style V fill:#e8f5e8
    style K fill:#f8bbd9
```

## Component Responsibility Matrix

| Component             | Responsibility                          | Status Tracking             | Files                            |
| --------------------- | --------------------------------------- | --------------------------- | -------------------------------- |
| **Client Layer**      | UI/UX, Event Handling                   | Receives & displays status  | React/HTML components            |
| **API Layer**         | Request validation, Response formatting | Passes status to client     | `netlify/functions/`             |
| **Chat Service**      | Core chat logic, Status orchestration   | Creates & manages status    | `netlify/services/chat/`         |
| **Query Service**     | Query processing and RAG pipeline       | Tracks query processing     | `netlify/services/query/`        |
| **Embedding Service** | Vector generation and similarity search | Tracks embedding operations | `netlify/services/embedding/`    |
| **Ingestion Service** | Document processing and indexing        | Tracks ingestion progress   | `netlify/services/ingestion/`    |
| **Memory Service**    | Chat history and session management     | Tracks memory operations    | `netlify/services/memory/`       |
| **generateAnswer**    | Main processing flow                    | Tracks all major steps      | Core chat processing             |
| **executeToolCall**   | Tool execution with switch logic        | Tracks tool-specific status | Tool orchestration               |
| **callOpenAI**        | OpenAI API integration                  | No direct status (wrapped)  | OpenAI API wrapper               |
| **Type System**       | Structure & validation                  | Defines status contracts    | `types.ts` files across services |

## Service Layer Architecture

### **Netlify Services Structure** (`netlify/services/`)

```mermaid
graph TB
    subgraph "Service Organization"
        A[services/index.ts] --> B[Chat Service]
        A --> C[Query Service]
        A --> D[Embedding Service]
        A --> E[Ingestion Service]
        A --> F[Memory Service]
    end

    subgraph "Chat Service (chat/)"
        B --> G[chat.ts - Core logic]
        B --> H[tools.ts - Tool execution]
        B --> I[chat-status-tracking.ts]
        B --> J[helpers.ts - Utilities]
        B --> K[types.ts - Chat types]
    end

    subgraph "Query Service (query/)"
        C --> L[query.ts - RAG pipeline]
        C --> M[types.ts - Query types]
    end

    subgraph "Embedding Service (embedding/)"
        D --> N[embedding.ts - Vector ops]
        D --> O[types.ts - Embedding types]
    end

    subgraph "Ingestion Service (ingestion/)"
        E --> P[ingestion.ts - Document processing]
        E --> Q[types.ts - Ingestion types]
    end

    subgraph "Memory Service (memory/)"
        F --> R[types.ts - Chat memory types]
        F --> S[utils.ts - Session management]
        F --> T[index.ts - Service exports]
    end

    style A fill:#e1f5fe
    style B fill:#f3e5f5
    style F fill:#f8bbd9
```

### **Service Responsibilities**

| Service       | Core Function              | Key Files                                        | Dependencies          |
| ------------- | -------------------------- | ------------------------------------------------ | --------------------- |
| **Chat**      | Agentic conversation flow  | `chat.ts`, `tools.ts`, `chat-status-tracking.ts` | Query, OpenAI API     |
| **Query**     | RAG pipeline orchestration | `query.ts`                                       | Embedding, Database   |
| **Embedding** | Vector operations          | `embedding.ts`                                   | OpenAI Embeddings API |
| **Ingestion** | Document processing        | `ingestion.ts`                                   | Embedding, Database   |
| **Memory**    | Chat history persistence   | `types.ts`, `utils.ts`                           | Database              |

## Data Flow Architecture

```mermaid
flowchart LR
    subgraph "Input Processing"
        A[User Query] --> B[Validation]
        B --> C[Context Retrieval]
    end

    subgraph "Core Processing"
        C --> D[generateAnswer]
        D --> E[Status Creation]
        E --> F[OpenAI Call]
        F --> G[Tool Decision]
        G --> H[Tool Execution]
        H --> I[Memory Storage]
        I --> J[Final Response]
    end

    subgraph "Output Processing"
        J --> K[Response Formatting]
        K --> L[Status Aggregation]
        L --> M[Client Response]
    end

    subgraph "Status Flow"
        N[Status Updates]
        E --> N
        H --> N
        I --> N
        N --> O[Real-time Updates]
        N --> P[Final Status Array]
    end

    subgraph "Memory Flow"
        Q[Session Management]
        R[Message Storage]
        I --> Q
        Q --> R
        R --> S[Chat History]
    end

    O --> T[Client UI Updates]
    P --> M
    S --> U[Context Retrieval]
    U --> C
```

## Technology Stack Integration

```mermaid
mindmap
  root((Enhanced Chat System))
    Frontend
      HTML/CSS/JS
      React Components
      Server-Sent Events
      Status UI Components
    Backend
      Netlify Functions
      TypeScript
      Status Tracking
      Error Handling
    Services
      Chat Service
        Agentic Flow
        Tool Execution
        Status Tracking
      Query Service
        RAG Pipeline
        Context Building
      Embedding Service
        Vector Generation
        Similarity Search
      Ingestion Service
        Document Processing
        Index Building
      Memory Service
        Session Management
        Chat History
        Message Storage
    External APIs
      OpenAI Responses API
      OpenAI Embeddings API
      Custom Tool System
      Vector Database
    Infrastructure
      Neon PostgreSQL
      pgvector Extension
      Real-time Updates
      Performance Monitoring
```
