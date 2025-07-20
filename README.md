# AdventureCue - RAG (Retrieval-Augmented Generation) Application

A Next.js application with composable RAG architecture built on Netlify, Neon Database, and OpenAI. This project demonstrates a production-ready implementation of vector embeddings, semantic search, and AI-generated responses.

## Architecture Overview

- **Frontend**: Next.js with React and TypeScript
- **Backend**: Netlify Functions (serverless)
- **Database**: Neon PostgreSQL with pgvector extension
- **AI Services**: OpenAI (embeddings + chat completion)
- **Ingestion**: CLI and UI-based text processing

## Prerequisites

Before starting, ensure you have:

- **Node.js** 18+ installed
- **npm** or **yarn** package manager
- **OpenAI API key** (from [OpenAI Platform](https://platform.openai.com/api-keys))
- **Neon Database** (from [Neon Console](https://console.neon.tech/))
- **Netlify CLI** for local development

## Quick Start

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

**Get your API keys:**

- **OpenAI API Key**: Go to [OpenAI Platform](https://platform.openai.com/api-keys)
- **Neon Database URL**: Create a database at [Neon Console](https://console.neon.tech/) and copy the connection string

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
# Start full development environment (Next.js + Netlify Functions)
netlify dev

# Start only Next.js development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Lint code
npm run lint
```

### Database Commands

```bash
# Generate new migrations from schema changes
npm run db:generate

# Apply migrations to database
npm run db:migrate

# Open Drizzle Studio (database GUI)
npm run db:studio
```

### Ingestion Commands

```bash
# Ingest files from ./data directory (CLI approach)
npm run ingest

# Ingest files from custom directory
tsx bin/ingest.ts ./custom-data-folder

# Ingest files with different extensions
tsx bin/ingest.ts ./docs --extensions .md,.txt,.pdf
```

## API Endpoints

### Query Endpoint

```bash
# Semantic search and AI response generation
curl -X POST http://localhost:8888/.netlify/functions/query \
  -H "Content-Type: application/json" \
  -d '{"query": "What is the meaning of life?"}'
```

### Ingestion Endpoint

```bash
# Add text content via API
curl -X POST http://localhost:8888/.netlify/functions/ingest \
  -H "Content-Type: application/json" \
  -d '{"content": "Your text content here", "source": "manual_input"}'
```

## Project Structure

```
adventurecue/
├── src/app/                    # Next.js app router
├── netlify/
│   ├── functions/              # Serverless function handlers
│   │   ├── query.ts           # Query endpoint
│   │   └── ingest.ts          # Ingestion endpoint
│   └── services/              # Composable business logic
│       ├── query.ts           # Query orchestration
│       ├── ingestion.ts       # Ingestion pipeline
│       └── embedding.ts       # OpenAI integration
├── bin/
│   └── ingest.ts              # CLI ingestion script
├── db/
│   ├── schema.ts              # Database schema
│   └── index.ts               # Database connection
├── docs/
│   └── rag-architecture.md    # Detailed architecture docs
└── migrations/                # Database migrations
```

## Data Ingestion

### Method 1: CLI Ingestion (Bulk Files)

```bash
# Create a data directory with your files
mkdir data
echo "Your content here" > data/sample.txt

# Run ingestion
npm run ingest
```

### Method 2: UI Ingestion (Individual Text)

1. Start the development server: `netlify dev`
2. Open `http://localhost:3000`
3. Use the web interface to add text content
4. Content is automatically processed and embedded

### Method 3: API Ingestion (Programmatic)

```typescript
// Using the API client
import { ingestText } from "./src/lib/api/rag";

const result = await ingestText({
  content: "Your text content",
  source: "api_integration",
  metadata: { category: "docs" },
});
```

## Troubleshooting

### Common Issues

1. **"Missing OPENAI_API_KEY"**

   - Ensure your `.env.local` file contains a valid OpenAI API key
   - Restart the development server after adding environment variables

2. **"Database connection failed"**

   - Verify your Neon database URL in `.env.local`
   - Ensure the database is running and accessible

3. **"Function not found" errors**

   - Use `netlify dev` instead of `npm run dev` to access Netlify functions
   - Check that functions are in the `netlify/functions/` directory

4. **"Migration failed"**
   - Ensure pgvector extension is enabled in your Neon database
   - Check database permissions and connection string

### Development Tips

- **Use `netlify dev`** for full local development (Next.js + functions)
- **Check logs** in the Netlify CLI output for function errors
- **Use database studio** (`npm run db:studio`) to inspect data
- **Rate limiting**: The CLI ingestion includes rate limiting for OpenAI API

## Documentation

- **[Architecture Guide](./docs/rag-architecture.md)** - Detailed technical documentation
- **[Netlify Functions](https://docs.netlify.com/functions/)** - Serverless function documentation
- **[Drizzle ORM](https://orm.drizzle.team/)** - Database ORM documentation
- **[OpenAI API](https://platform.openai.com/docs)** - AI service documentation

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with `netlify dev`
5. Submit a pull request

## License

This project is licensed under the MIT License.
