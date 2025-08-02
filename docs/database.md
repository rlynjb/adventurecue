# Database Architecture

## Table of Contents

- [Overview](#overview)
- [Architecture Flow](#architecture-flow)
- [Core Components](#core-components)
  - [Database Schema (db/)](#database-schema-db)
  - [Migrations](#migrations)
  - [Database Clients (netlify/clients/)](#database-clients-netlifyeclients)
- [Data Models](#data-models)
- [Vector Storage](#vector-storage)
- [Connection Management](#connection-management)
- [Usage & Commands](#usage--commands)
  - [Database Management Commands](#database-management-commands)
  - [Common Operations](#common-operations)
  - [Environment Setup](#environment-setup)
  - [Monitoring & Debugging](#monitoring--debugging)

## Overview

The AdventureCue database architecture uses PostgreSQL with pgvector extension for vector similarity search, managed through Drizzle ORM. The system supports both content embeddings and chat functionality with efficient connection pooling and migration management.

## Architecture Flow

```mermaid
graph TD
    A[Application Layer] -->|Uses| B[Database Clients]
    B -->|Drizzle ORM| C[Neon Database]
    C -->|pgvector| D[Vector Storage]
    C -->|Tables| E[Relational Data]

    F[Migrations] -->|Schema Updates| C
    G[Schema Definition] -->|Type Safety| B
    H[Connection Pool] -->|Singleton| B

    style A fill:#2d3748,stroke:#4a5568,color:#ffffff
    style B fill:#2d3748,stroke:#4a5568,color:#ffffff
    style C fill:#1a202c,stroke:#2d3748,color:#ffffff
    style D fill:#2c5282,stroke:#3182ce,color:#ffffff
    style E fill:#2c5282,stroke:#3182ce,color:#ffffff
    style F fill:#744210,stroke:#d69e2e,color:#ffffff
    style G fill:#744210,stroke:#d69e2e,color:#ffffff
    style H fill:#2c5282,stroke:#3182ce,color:#ffffff
```

## Core Components

### Database Schema (db/)

**Location**: `/db/`

The schema defines the application's data structure using Drizzle ORM with TypeScript type safety:

- **`schema.ts`**: Defines all table schemas including custom vector types
- **`index.ts`**: Exports the main database client with schema integration

**Key Features**:

- Custom vector type for embeddings (1536 dimensions)
- Foreign key relationships between chat sessions and messages
- Automatic timestamps with timezone support
- Indexed fields for query optimization

### Migrations

**Location**: `/migrations/`

Schema evolution is managed through SQL migration files with a versioned approach:

```
0000_enable-pgvector.sql     # Enable vector extension
0001_create-tables.sql       # Create initial tables
0002_create-ivfflat-index.sql # Vector similarity indexes
0003_ancient_blue_blade.sql   # Schema updates
```

**Migration Strategy**:

- Linear versioning system
- Extension setup before table creation
- Performance optimization through strategic indexing
- Never edit migrations directly - use Drizzle Kit

### Database Clients (netlify/clients/)

**Location**: `/netlify/clients/`

Provides optimized database connections for serverless environments:

- **`database.ts`**: Singleton connection manager for Neon database
- **Connection pooling**: Reuses connections across function invocations
- **Environment validation**: Ensures required credentials are present

## Data Models

### Embeddings Table

Stores vector embeddings for content similarity search:

- **Primary Key**: Auto-incrementing serial ID
- **Vector Field**: 1536-dimension embeddings (OpenAI compatible)
- **Content**: Original text chunks for retrieval
- **Indexing**: Chunk-based organization

### Chat System

Supports conversational interfaces with session management:

**Chat Sessions**:

- Unique session identifiers
- Optional titles for conversation threads
- Automatic timestamp tracking

**Chat Messages**:

- Role-based message types (user/assistant/system)
- Session foreign key relationships
- Chronological ordering

## Vector Storage

The system leverages PostgreSQL's pgvector extension for high-performance similarity search:

- **Dimension**: 1536 (OpenAI text-embedding-ada-002 compatible)
- **Index Type**: IVFFlat for approximate nearest neighbor search
- **Distance Metric**: Cosine similarity for semantic matching

## Connection Management

**Singleton Pattern**: Ensures efficient resource utilization in serverless environments by reusing database connections across function invocations.

**Environment Configuration**:

- `NETLIFY_DATABASE_URL`: Neon database connection string
- Automatic client initialization with error handling
- Separation of SQL client and ORM layers for flexibility

## Usage & Commands

### Database Management Commands

**Generate Migration Files**:

```bash
npm run db:generate
```

Creates new migration files based on schema changes in `db/schema.ts`.

**Apply Migrations**:

```bash
npm run db:migrate
```

Executes pending migrations against the database.

**Database Studio (Development)**:

```bash
npm run db:studio
```

Opens Drizzle Studio for visual database management and querying.

### Common Operations

**Vector Similarity Search**:

```typescript
// Find content similar to a query embedding
const results = await db
  .select({
    content: embeddings.content,
    similarity: sql`1 - (embedding <=> ${queryVector}::vector)`,
  })
  .from(embeddings)
  .orderBy(sql`embedding <=> ${queryVector}::vector`)
  .limit(5);
```

**Create Chat Session**:

```typescript
// Start a new conversation
const sessionId = crypto.randomUUID();
await db.insert(chatSessions).values({
  session_id: sessionId,
  title: "New Conversation",
});
```

**Store Embeddings**:

```typescript
// Batch insert content embeddings
await db.insert(embeddings).values([
  {
    chunk_index: 0,
    content: "Text content...",
    embedding: [0.1, 0.2, ...] // 1536-dim vector
  }
]);
```

### Environment Setup

**Required Environment Variables**:

```bash
# Neon database connection
NETLIFY_DATABASE_URL=postgresql://username:password@host/database

# For local development
DATABASE_URL=postgresql://localhost:5432/adventurecue_dev
```

**Development Database Setup**:

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env

# Run migrations
npm run db:migrate

# Start development server
npm run dev
```

### Monitoring & Debugging

**Check Database Connection**:

```typescript
import { getDrizzleClient } from "./netlify/clients/database";

try {
  const db = getDrizzleClient();
  await db.select().from(embeddings).limit(1);
  console.log("Database connection successful");
} catch (error) {
  console.error("Database connection failed:", error);
}
```

**Query Performance Analysis**:

```sql
-- Check vector index usage
EXPLAIN ANALYZE
SELECT content
FROM embeddings
ORDER BY embedding <=> '[0.1,0.2,...]'::vector
LIMIT 10;
```
