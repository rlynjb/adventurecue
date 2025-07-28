# Getting Started with AdventureCue

Welcome to AdventureCue! This guide will help you navigate through the documentation and get your RAG (Retrieval-Augmented Generation) application up and running quickly.

## 📋 Table of Contents

### 🚀 Quick Start

- [Installation & Setup](#installation--setup)
- [First Query](#first-query)
- [Development Environment](#development-environment)

### 📖 Core Documentation

- [Architecture Overview](#architecture-overview)
- [API Reference](#api-reference)
- [Configuration Guide](#configuration-guide)

### 🛠️ Development Guide

- [Project Structure](#project-structure)
- [Data Ingestion](#data-ingestion)
- [Streaming & Real-time Features](#streaming--real-time-features)
- [Testing](#testing)

### 🔧 Advanced Topics

- [Tool Integration](#tool-integration)
- [Performance Optimization](#performance-optimization)
- [Deployment](#deployment)

### 📚 Resources

- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [Roadmap](#roadmap)

---

## 🚀 Quick Start

### Installation & Setup

**Prerequisites:**

- Node.js 18+
- OpenAI API Key
- Neon PostgreSQL Database

**Quick Installation:**

```bash
# Clone the repository
git clone <your-repo-url>
cd adventurecue

# Install dependencies
npm install

# Setup environment
cp .env.example .env.local
# Edit .env.local with your API keys

# Setup database
npm run db:migrate

# Start development server
netlify dev
```

**📖 Detailed Guide:** [README.md - Quick Start Section](./README.md#quick-start)

### First Query

Once your server is running, test your first RAG query:

```bash
curl -X POST http://localhost:8888/.netlify/functions/query \
  -H "Content-Type: application/json" \
  -d '{"query": "What is AdventureCue?"}'
```

**📖 More Examples:** [README.md - API Endpoints](./README.md#api-endpoints)

### Development Environment

**Essential Commands:**

```bash
netlify dev          # Full development environment
npm run db:studio    # Database GUI
npm run ingest       # Add sample data
```

**📖 Complete Command Reference:** [README.md - Available Commands](./README.md#available-commands)

---

## 📖 Core Documentation

### Architecture Overview

AdventureCue uses a composable RAG architecture with:

- **Frontend**: Next.js with React and TypeScript
- **Backend**: Netlify Functions (serverless)
- **Database**: Neon PostgreSQL with pgvector
- **AI**: OpenAI embeddings and chat completion

**📖 Deep Dive:** [docs/rag-architecture.md](./docs/rag-architecture.md)

### API Reference

**Core Endpoints:**

- `POST /functions/query` - Standard RAG queries
- `POST /functions/query-with-status` - Streaming queries with status
- `POST /functions/ingest` - Add content to knowledge base

**📖 Complete API Guide:** [README.md - API Endpoints](./README.md#api-endpoints)

### Configuration Guide

**Environment Variables:**

```bash
OPENAI_API_KEY=your_key_here
NETLIFY_DATABASE_URL=your_neon_connection_string
```

**📖 Full Configuration:** [README.md - Environment Setup](./README.md#3-environment-setup)

---

## 🛠️ Development Guide

### Project Structure

```
adventurecue/
├── src/app/                    # Next.js frontend
├── netlify/functions/          # API endpoints
├── netlify/services/           # Business logic
├── examples/                   # Testing & demos
├── db/                        # Database schema
└── docs/                      # Documentation
```

**📖 Detailed Structure:** [README.md - Project Structure](./README.md#project-structure)

### Data Ingestion

**Three Methods Available:**

1. **CLI Ingestion** (Bulk files)

   ```bash
   npm run ingest
   ```

2. **UI Ingestion** (Individual text)

   - Visit `http://localhost:3000`
   - Use web interface

3. **API Ingestion** (Programmatic)
   ```typescript
   import { ingestText } from "./src/lib/api/rag";
   await ingestText({ content: "...", source: "api" });
   ```

**📖 Complete Ingestion Guide:** [README.md - Data Ingestion](./README.md#data-ingestion)

### Streaming & Real-time Features

**Server-Sent Events (SSE) Implementation:**

- Real-time status updates during query processing
- Custom streaming client for UI integration
- Comprehensive testing suite

**Testing Streaming:**

```bash
# Visual test interface
open examples/sse-streaming-client/streaming-test.html

# CLI testing
node examples/sse-streaming-client/streaming-test-cli.js
```

**📖 Streaming Documentation:** [README.md - Testing Streaming Functionality](./README.md#testing-streaming-functionality)

### Testing

**Available Test Suites:**

- SSE Streaming tests (visual & CLI)
- API endpoint testing
- Database migration testing

**📖 Testing Guide:** [examples/sse-streaming-client/README.md](./examples/sse-streaming-client/README.md)

---

## 🔧 Advanced Topics

### Tool Integration

**Currently Implemented:**

- ✅ OpenAI Web Search Tool
- ✅ Function Calling Interface
- 📋 MCP Integration (planned)

**Adding Custom Tools:**

```typescript
interface OpenAITool {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: JsonSchema;
  };
}
```

**📖 Tool Development:** [README.md - Phase 3: Advanced Tooling](./README.md#phase-3-advanced-tooling--integration)

### Performance Optimization

**Current Optimizations:**

- Vector similarity search with pgvector
- Streaming responses for real-time feedback
- Rate limiting for API cost management

**Planned Optimizations:**

- Redis caching
- Hybrid search (BM25 + vector)
- Load balancing

**📖 Performance Guide:** [README.md - Phase 4: Production-Ready Features](./README.md#phase-4-production-ready-features)

### Deployment

**Development:**

```bash
netlify dev  # Local development with functions
```

**Production:**

```bash
npm run build
netlify deploy --prod
```

**📖 Deployment Guide:** [Netlify Functions Documentation](https://docs.netlify.com/functions/)

---

## 📚 Resources

### Troubleshooting

**Common Issues:**

- Missing API keys → Check `.env.local`
- Database connection → Verify Neon URL
- Function errors → Use `netlify dev`
- Migration issues → Check pgvector extension

**📖 Complete Troubleshooting:** [README.md - Troubleshooting](./README.md#troubleshooting)

### Contributing

**How to Contribute:**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with `netlify dev`
5. Submit a pull request

**📖 Contributing Guide:** [README.md - Contributing](./README.md#contributing)

### Roadmap

**Current Status:**

- ✅ Phase 1: Core RAG Pipeline (Complete)
- 🔄 Phase 2: Enhanced UX (In Progress)
- 🔄 Phase 3: Advanced Tooling (In Progress)
- 📋 Phase 4-7: Production & SaaS (Planned)

**📖 Full Roadmap:** [README.md - Development Roadmap](./README.md#development-roadmap)

---

## 🎯 What's Next?

Based on your needs, here are recommended next steps:

### For New Users

1. **Start Here:** [Quick Start](#installation--setup)
2. **Try It:** [First Query](#first-query)
3. **Explore:** [API Reference](#api-reference)

### For Developers

1. **Understand:** [Architecture Overview](#architecture-overview)
2. **Build:** [Development Guide](#development-guide)
3. **Extend:** [Tool Integration](#tool-integration)

### For Contributors

1. **Setup:** [Development Environment](#development-environment)
2. **Learn:** [Project Structure](#project-structure)
3. **Contribute:** [Contributing](#contributing)

---

## 📞 Support & Community

- **Documentation Issues:** Open an issue in the repository
- **Feature Requests:** Check the [roadmap](./README.md#development-roadmap) or suggest new ones
- **Bug Reports:** Use the issue tracker with detailed reproduction steps

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

---

**Happy Building! 🚀**

For the most up-to-date information, always refer to the main [README.md](./README.md) file.
