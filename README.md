# AdventureCue - RAG (Retrieval-Augmented Generation) Application

A Next.js application with composable RAG architecture built on Netlify, Neon Database, and OpenAI. This project demonstrates a production-ready implementation of vector embeddings, semantic search, and AI-generated responses with real-time streaming capabilities.

## Architecture Overview

AdventureCue implements a modern RAG system with the following architectural layers:

- **Client Layer**: Next.js with React and TypeScript for the frontend interface
- **API Layer**: Netlify Functions providing serverless API endpoints
- **Service Layer**: Modular services for chat, embedding, query processing, and ingestion
- **Data Layer**: PostgreSQL with pgvector extension for vector storage and retrieval

The system supports both traditional RAG and agentic RAG with tool-calling capabilities, real-time status tracking, and Server-Sent Events (SSE) streaming for enhanced user experience.

## Technology Stack

### Core Technologies

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Netlify Functions (Node.js serverless)
- **Database**: Neon PostgreSQL with pgvector extension
- **ORM**: Drizzle ORM with TypeScript support
- **AI Services**: OpenAI (text-embedding-ada-002, GPT-4)

### Development Tools

- **Package Manager**: npm/yarn
- **Build System**: Next.js with Netlify deployment
- **Database Management**: Drizzle Studio for GUI
- **CLI Tools**: tsx for TypeScript execution
- **Development Server**: Netlify CLI for local development

### Additional Features

- **Real-time Communication**: Server-Sent Events (SSE) for streaming
- **Status Tracking**: Comprehensive progress monitoring
- **Tool Integration**: OpenAI function calling with web search
- **Type Safety**: Full TypeScript implementation

## Prerequisites

Before starting, ensure you have:

- **Node.js** 18+ installed
- **npm** or **yarn** package manager
- **OpenAI API key** from [OpenAI Platform](https://platform.openai.com/api-keys)
- **Neon Database** from [Neon Console](https://console.neon.tech/)
- **Netlify CLI** for local development

## Installation & Setup

### 1. Install Global Dependencies

```bash
# Install Netlify CLI globally
npm install -g netlify-cli

# Install tsx for TypeScript execution (used for ingestion)
npm install -g tsx
```

### 2. Clone and Install Project Dependencies

```bash
# Clone the repository
git clone <your-repo-url>
cd adventurecue

# Install project dependencies
npm install
```

### 3. Environment Setup

Create a `.env.local` file in the project root:

```bash
# .env.local
OPENAI_API_KEY=your_openai_api_key_here
NETLIFY_DATABASE_URL=your_neon_database_connection_string_here
```

### 4. Database Setup

```bash
# Generate database migrations
npm run db:generate

# Run database migrations (requires Netlify CLI)
npm run db:migrate

# Optional: Open database studio
npm run db:studio
```

### 5. Start Development Server

```bash
# Start Netlify development server (includes Next.js + functions)
netlify dev

# Alternative: Start only Next.js (without Netlify functions)
npm run dev
```

The application will be available at:

- **Next.js app**: `http://localhost:3000`
- **Netlify functions**: `http://localhost:8888/.netlify/functions/`

## Available Commands

### Development Commands

```bash
netlify dev          # Start full development environment (Next.js + Netlify Functions)
npm run dev          # Start only Next.js development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Lint code
```

### Database Commands

```bash
npm run db:generate  # Generate new migrations from schema changes
npm run db:migrate   # Apply migrations to database
npm run db:studio    # Open Drizzle Studio (database GUI)
```

### Ingestion Commands

```bash
npm run ingest       # Ingest files from ./data directory (CLI approach)
tsx bin/ingest.ts ./custom-data-folder    # Ingest from custom directory
```

## API Endpoints

### Core Endpoints

- **`/.netlify/functions/query`** - Basic semantic search and AI response generation
- **`/.netlify/functions/query-with-status`** - Query with real-time status updates and streaming
- **`/.netlify/functions/ingest`** - Text ingestion through web UI

### Usage Examples

```bash
# Basic query
curl -X POST http://localhost:8888/.netlify/functions/query \
  -H "Content-Type: application/json" \
  -d '{"query": "What is the meaning of life?"}'

# Streaming query with status updates
curl -X POST http://localhost:8888/.netlify/functions/query-with-status \
  -H "Content-Type: application/json" \
  -d '{"query": "Tell me about Tokyo", "streaming": true}' \
  --no-buffer

# Text ingestion
curl -X POST http://localhost:8888/.netlify/functions/ingest \
  -H "Content-Type: application/json" \
  -d '{"content": "Your text content here", "source": "manual_input"}'
```

## Project Structure

```
adventurecue/
├── bin/
│   └── ingest.ts                    # CLI ingestion script
├── data/                            # Data storage directory
├── db/
│   ├── index.ts                     # Database connection and setup
│   └── schema.ts                    # Database schema definitions
├── docs/                            # Documentation files
│   ├── README.md                    # Development journey guide
│   ├── development-roadmap.md       # Complete development roadmap
│   ├── rag-architecture.md          # Technical architecture documentation
│   └── [other-docs].md             # Additional documentation
├── examples/
│   └── sse-streaming-client/        # SSE testing suite and examples
├── migrations/                      # Database migration files
├── netlify/
│   ├── clients/                     # External service clients
│   ├── functions/
│   │   ├── ingest.ts               # Ingestion endpoint
│   │   ├── query.ts                # Basic query endpoint
│   │   └── query-with-status.ts    # Streaming query with status updates
│   ├── services/
│   │   ├── chat/                   # Chat service with status tracking
│   │   ├── embedding/              # Embedding service
│   │   ├── ingestion/              # Ingestion service
│   │   ├── query/                  # Query service
│   │   └── index.ts                # Service layer exports
│   └── utils/                      # Utility functions
├── public/                         # Static assets
├── src/
│   ├── app/                        # Next.js app router
│   │   ├── layout.tsx              # App layout
│   │   └── page.tsx                # Main page
│   ├── components/
│   │   ├── ingest.tsx              # Ingestion UI component
│   │   └── query.tsx               # Query UI component
│   └── lib/
│       └── packages/               # Reusable UI packages
│           ├── sse-streaming-client.ts  # SSE streaming components
│           └── usage-examples.tsx       # Integration examples
└── Configuration Files:
    ├── drizzle.config.ts           # Drizzle ORM configuration
    ├── next.config.ts              # Next.js configuration
    ├── package.json                # Dependencies and scripts
    └── tsconfig.json               # TypeScript configuration
```

## Data Ingestion Methods

### CLI Ingestion (Bulk Files)

Place files in the `./data` directory and run `npm run ingest` for bulk processing.

### UI Ingestion (Individual Text)

Use the web interface at `http://localhost:3000` to add individual text content.

### API Ingestion (Programmatic)

Use the `/ingest` endpoint for programmatic content addition.

## Development Roadmap

For detailed information about the project's development phases, future features, and implementation roadmap, see:

**📋 [Complete Development Roadmap](./docs/roadmap.md)**

The roadmap includes:

- ✅ **Completed Phases**: Foundation, Agentic Enhancement, System Refactoring
- 🎯 **Current Focus**: Chat History & Session Management
- 📋 **Future Phases**: MCP Tooling, Production MVP, Multi-Agent Systems, RAG SaaS Platform

## Documentation

- **[Development Roadmap](./docs/roadmap.md)** - Complete development plan and checklists
- **[RAG Architecture](./docs/rag-architecture.md)** - Detailed technical documentation
- **[Netlify Functions](https://docs.netlify.com/functions/)** - Serverless function documentation
- **[Drizzle ORM](https://orm.drizzle.team/)** - Database ORM documentation
- **[OpenAI API](https://platform.openai.com/docs)** - AI service documentation

## Troubleshooting

### Common Issues

1. **Missing API Keys**: Ensure `.env.local` contains valid OpenAI and database credentials
2. **Database Connection**: Verify Neon database URL and pgvector extension is enabled
3. **Function Errors**: Use `netlify dev` instead of `npm run dev` to access Netlify functions
4. **Migration Issues**: Check database permissions and pgvector extension availability

### Development Tips

- Use `netlify dev` for full local development (Next.js + functions)
- Check Netlify CLI output for function errors and logs
- Use `npm run db:studio` to inspect database data visually
- CLI ingestion includes rate limiting for OpenAI API compliance

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with `netlify dev`
5. Submit a pull request

## License

This project is licensed under the MIT License.
