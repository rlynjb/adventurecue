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
        E[query-with-status.ts]
        F[Validation Utils]
    end

    subgraph "Service Layer"
        G[Chat Service]
        H[Query Service]
        I[Embedding Service]
    end

    subgraph "Core Components"
        J[generateAnswer]
        K[executeToolCall]
        L[callOpenAI]
        M[buildContextPrompt]
    end

    subgraph "External APIs"
        N[OpenAI API]
        O[Tool APIs]
        P[Database]
    end

    subgraph "Type System"
        Q[ChatStatus Interface]
        R[ChatResponse Interface]
        S[EmbeddingRow Interface]
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
    J --> K
    J --> L
    J --> M
    K --> O
    L --> N
    M --> P

    G --> Q
    G --> R
    I --> S

    style A fill:#e1f5fe
    style G fill:#f3e5f5
    style J fill:#fff3e0
    style Q fill:#e8f5e8
```

## Component Responsibility Matrix

| Component           | Responsibility                          | Status Tracking             |
| ------------------- | --------------------------------------- | --------------------------- |
| **Client Layer**    | UI/UX, Event Handling                   | Receives & displays status  |
| **API Layer**       | Request validation, Response formatting | Passes status to client     |
| **Chat Service**    | Core chat logic, Status orchestration   | Creates & manages status    |
| **generateAnswer**  | Main processing flow                    | Tracks all major steps      |
| **executeToolCall** | Tool execution with switch logic        | Tracks tool-specific status |
| **callOpenAI**      | OpenAI API integration                  | No direct status (wrapped)  |
| **Type System**     | Structure & validation                  | Defines status contracts    |

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
        H --> I[Final Response]
    end

    subgraph "Output Processing"
        I --> J[Response Formatting]
        J --> K[Status Aggregation]
        K --> L[Client Response]
    end

    subgraph "Status Flow"
        M[Status Updates]
        E --> M
        H --> M
        M --> N[Real-time Updates]
        M --> O[Final Status Array]
    end

    N --> P[Client UI Updates]
    O --> L
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
      OpenAI Responses API
      Custom Tool System
      Vector Database
      Embedding Processing
    Infrastructure
      Neon PostgreSQL
      pgvector Extension
      Real-time Updates
      Performance Monitoring
```
