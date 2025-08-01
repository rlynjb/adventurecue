# AdventureCue Development Roadmap

This roadmap serves as your source of truth checklist for developing AdventureCue from its current state into a comprehensive RAG Software as a Service platform. Each phase builds upon the previous foundations while introducing new capabilities and complexities.

**Current Status**: Phase 3 Complete (System Refactoring & Enhancement)  
**Last Updated**: July 28, 2025

---

## 📋 Roadmap Overview

| Phase       | Focus Area                            | Status          | Date Completed | Timeline Estimate | Complexity |
| ----------- | ------------------------------------- | --------------- | -------------- | ----------------- | ---------- |
| **Phase 1** | Foundation & RAG Core                 | ✅ **COMPLETE** | July 10, 2025  | 2 weeks           | Medium     |
| **Phase 2** | Agentic Enhancement                   | ✅ **COMPLETE** | July 22, 2025  | 2 weeks           | High       |
| **Phase 3** | System Refactoring & Enhancement      | ✅ **COMPLETE** | July 27, 2025  | 1 week            | Medium     |
| **Phase 4** | Chat History & Session Management     | 🔄 **NEXT**     | TBD            | 2-3 weeks         | Medium     |
| **Phase 5** | MCP Tooling & Advanced AI Integration | 📋 **PLANNED**  | TBD            | 3-4 weeks         | High       |
| **Phase 6** | Production MVP & Admin Dashboard      | 📋 **PLANNED**  | TBD            | 4-6 weeks         | High       |
| **Phase 7** | Multi-Agent Systems                   | 📋 **PLANNED**  | TBD            | 4-5 weeks         | Very High  |
| **Phase 8** | RAG SaaS Platform                     | 📋 **PLANNED**  | TBD            | 6-8 weeks         | Very High  |

---

## ✅ COMPLETED PHASES (Retrospective)

### 🏗️ Phase 1: Foundation & RAG Core ✅ (July 10, 2025)

**📄 Primary Documentation**: [`rag-architecture.md`](./rag-architecture.md)

#### What Was Built - Checklist ✅

- [x] Core RAG (Retrieval-Augmented Generation) architecture
- [x] Vector embeddings with OpenAI text-embedding-ada-002
- [x] PostgreSQL + pgvector setup with Neon database
- [x] Basic ingestion pipeline for document processing
- [x] Semantic search functionality

#### Key Components Implemented ✅

- [x] **Database Schema**: Embeddings table with vector storage
- [x] **Ingestion System**: CLI and UI-based text processing (`bin/ingest.ts`)
- [x] **Query Pipeline**: Vector similarity search + OpenAI response generation
- [x] **Netlify Functions**: Serverless API endpoints (`query.ts`, `ingest.ts`)

#### Architecture Decisions Made ✅

- [x] Chose Neon PostgreSQL over traditional vector databases for simplicity
- [x] Implemented modular service architecture for better maintainability
- [x] Used OpenAI's text-embedding-ada-002 for vector generation
- [x] Established Embed → Ingest → Query pipeline pattern

---

### 🤖 Phase 2: Agentic Enhancement ✅ (July 22, 2025)

**📄 Primary Documentation**: [`agentic-vs-traditional-rag.md`](./agentic-vs-traditional-rag.md)

#### What Was Enhanced - Checklist ✅

- [x] Traditional RAG → Agentic RAG transformation
- [x] Tool-calling capabilities with OpenAI function calling
- [x] Autonomous decision-making system
- [x] Web search integration for real-time information

#### Key Features Added ✅

- [x] **Tool Execution**: Web search, API calls, database lookups
- [x] **Decision Making**: AI decides when and which tools to use
- [x] **Enhanced Context**: Tools provide additional information beyond vector search
- [x] **Dynamic Responses**: Responses adapt based on available tools and context

#### Architectural Evolution Completed ✅

- [x] Implemented: `Query → Analyze → Decide Tools → Execute → Synthesize → Response`
- [x] Enhanced beyond basic: `Query → Search → Response` pattern

---

### 🔧 Phase 3: System Refactoring & Enhancement ✅ (July 27, 2025)

**📄 Primary Documentation**: Multiple comprehensive files

#### What Was Refactored - Checklist ✅

- [x] Complete system architecture documentation
- [x] Status tracking implementation with real-time updates
- [x] Type system standardization across all components
- [x] Visual system diagrams and flow documentation

#### 3A. Architecture Documentation ✅

**📄 Documentation**: [`architecture-overview.md`](./architecture-overview.md)

- [x] **Client Layer**: React/HTML with status UI components
- [x] **API Layer**: Netlify Functions with validation
- [x] **Service Layer**: Modular chat, embedding, and query services
- [x] **Data Layer**: PostgreSQL with vector extensions
- [x] High-level architecture with Mermaid diagrams
- [x] Data flow visualization and component interaction maps

#### 3B. Chat System Visualization ✅

**📄 Documentation**: [`chat-system-diagrams.md`](./chat-system-diagrams.md)

- [x] Enhanced chat system flow diagrams
- [x] Tool execution decision trees
- [x] Status tracking flow charts
- [x] Error handling pathways
- [x] Process flow: `User Query → Status Tracking → OpenAI Analysis → Tool Decision → Tool Execution → Response Generation`

#### 3C. Status Tracking System ✅

**📄 Documentation**: [`status-tracking-guide.md`](./status-tracking-guide.md)

- [x] **Status Interfaces**: ChatStatus, ChatResponse types
- [x] **Progress Tracking**: Step-by-step execution monitoring
- [x] **Error Handling**: Comprehensive error state management
- [x] **Timing Metrics**: Performance monitoring and execution timing
- [x] **Implementation**: `netlify/services/chat/chat-status-tracking.ts`
- [x] Server-Sent Events (SSE) preparation for real-time updates

#### 3D. Type System Standardization ✅

- [x] **Interface Relationships**: Entity relationship diagrams for types
- [x] **Type Hierarchies**: Inheritance and composition patterns
- [x] **Data Flow Types**: Request/response type mappings
- [x] **Validation Schemas**: Runtime type checking preparation

---

## 🔄 UPCOMING PHASES (Development Plan)

## 🔄 Phase 4: Chat History & Session Management 🎯 **NEXT UP**

### Overview

Transform AdventureCue from stateless interactions to a persistent, context-aware conversational system using your existing PostgreSQL + Neon database infrastructure.

### ✅ Foundation Completed (Database Schema)

**📄 Primary Documentation**: [`chat-memory-system.md`](./chat-memory-system.md)

#### What Was Built - Database Foundation ✅

- [x] **Chat Memory Database Schema**: Two core tables for session and message management
- [x] **Type System**: TypeScript interfaces and utility functions for memory management
- [x] **Migration Strategy**: Safe additive approach preserving existing RAG functionality
- [x] **Service Architecture**: Backend services structure in `netlify/services/memory/`

#### Key Components Implemented ✅

- [x] **Database Tables**: `chat_sessions` and `chat_messages` with proper relationships
- [x] **Schema Management**: Drizzle ORM integration with foreign keys and indexes
- [x] **Type Definitions**: Complete TypeScript types in `netlify/services/memory/types.ts`
- [x] **Utility Functions**: Session ID generation and validation in `netlify/services/memory/utils.ts`
- [x] **Verification Tools**: Database validation script `bin/verify-chat-tables.ts`

#### Architecture Decisions Made ✅

- [x] Used existing PostgreSQL + Neon infrastructure for consistency
- [x] Implemented session-based architecture with unique identifiers
- [x] Chose role-based message storage (user/assistant/system)
- [x] Established proper foreign key relationships for data integrity
- [x] Created modular service structure for future extensibility

### Core Components Checklist

#### 4A. Session Management System

- **Session Creation & Lifecycle**

  - [ ] Unique session identifiers with expiration policies
  - [ ] Session metadata tracking (user, creation time, last activity)
  - [ ] Automatic session cleanup and archival strategies
  - [ ] Session state persistence across browser refreshes

- **User Context Preservation**
  - [ ] Cross-session user preference storage
  - [ ] Session-scoped temporary data management
  - [ ] User authentication integration preparation
  - [ ] Anonymous session handling for demo users

#### 4B. Chat History Implementation

- **Conversation Storage Architecture**

  - [ ] Message threading and conversation branching
  - [ ] Turn-based conversation tracking (user → assistant pairs)
  - [ ] Message metadata (timestamps, tokens used, processing time)
  - [ ] Conversation context window management

- **History Retrieval & Search**
  - [ ] Conversation search across user's history
  - [ ] Semantic search within chat history using existing embeddings
  - [ ] Conversation filtering by date, topic, or keywords
  - [ ] Conversation export and sharing capabilities

#### 4C. Memory Management System

- **Short-term Memory (Session Context)**

  - [ ] Working memory for current conversation
  - [ ] Context window optimization for LLM calls
  - [ ] Recent interaction caching
  - [ ] Temporary user preferences within session

- **Long-term Memory (Cross-Session)**
  - [ ] User preference learning and storage
  - [ ] Conversation summary generation for context
  - [ ] Important information extraction and tagging
  - [ ] User behavior pattern recognition

#### 4D. Database Schema Extensions

- **New Tables Design**

  - [x] **Users/Sessions table structure** ✅

    - **How**: Created `chat_sessions` table with columns: `id`, `session_id`, `title`, `created_at`, `updated_at`
    - **Why**: Provides foundation for tracking individual chat conversations with unique identifiers and metadata
    - **Implementation**: Used Drizzle ORM schema in `db/schema.ts` with proper constraints and indexes
    - **Result**: Enables session-based conversation management and persistence across browser refreshes

  - [x] **Messages table with foreign keys to sessions** ✅

    - **How**: Created `chat_messages` table with columns: `id`, `session_id`, `role`, `content`, `created_at`
    - **Why**: Stores individual messages within chat sessions with proper relationships and role-based categorization
    - **Implementation**: Added foreign key constraint referencing `chat_sessions.session_id` with CASCADE options
    - **Result**: Ensures data integrity and enables efficient querying of conversation history

  - [ ] Conversation summaries table
  - [ ] User preferences and memory table

- **Data Relationships**

  - [x] **Session → Messages (one-to-many)** ✅

    - **How**: Implemented foreign key constraint `chat_messages.session_id` → `chat_sessions.session_id`
    - **Why**: Establishes proper relational database structure for conversation threading
    - **Implementation**: Added constraint with `ON DELETE CASCADE ON UPDATE CASCADE` for referential integrity
    - **Result**: Each session can contain multiple messages while maintaining data consistency

  - [ ] User → Sessions (one-to-many)
  - [ ] Messages → Embeddings (for semantic search)
  - [ ] Conversation threading and reply chains

### Technical Considerations Checklist

- [x] **Database migration strategies for existing data** ✅

  - **How**: Implemented safe additive-only migration approach that preserves existing embeddings and data
  - **Why**: Critical to avoid data loss when adding new chat functionality to existing RAG system
  - **Implementation**:
    - Created migration `0003_ancient_blue_blade.sql` using Drizzle kit
    - Used manual execution when Drizzle migration tracking failed due to missing `__drizzle_migrations` table
    - Applied schema changes without affecting existing `embeddings` table or vector data
  - **Result**: Successfully added chat memory tables without disrupting existing RAG functionality
  - **Tools Created**: Built verification script `bin/verify-chat-tables.ts` for ongoing database validation

- [ ] Performance optimization for chat history queries
- [ ] Data retention policies and GDPR compliance preparation
- [ ] Real-time synchronization between multiple browser tabs

---

## 🛠️ Phase 5: MCP Tooling & Advanced AI Integration

### Overview

Expand AdventureCue's AI capabilities through Model Context Protocol (MCP) integration, advanced OpenAI features, and custom tool development.

### Core Components Checklist

#### 5A. Model Context Protocol (MCP) Integration

- **MCP Server Development**

  - [ ] Custom MCP server implementation for AdventureCue
  - [ ] Protocol-compliant tool registration and discovery
  - [ ] Resource management and access control
  - [ ] MCP client integration with existing chat system

- **Tool Ecosystem Architecture**
  - [ ] Plugin system for third-party MCP tools
  - [ ] Tool versioning and compatibility management
  - [ ] Tool permission and security framework
  - [ ] Tool performance monitoring and analytics

#### 5B. OpenAI Advanced Features

- **Custom Function Development**

  - [ ] Domain-specific function definitions for adventure/travel
  - [ ] Function calling optimization and error handling
  - [ ] Nested function call support and orchestration
  - [ ] Function result caching and performance optimization

- **Built-in Tools Integration**
  - [ ] Code interpreter integration for data analysis
  - [ ] Web browsing capabilities for real-time information
  - [ ] File analysis and document processing tools
  - [ ] Image generation and analysis capabilities

#### 5C. Custom Tool Development Framework

- **Tool Development Kit**

  - [ ] Standardized tool interface and protocol
  - [ ] Tool testing and validation framework
  - [ ] Tool documentation and metadata management
  - [ ] Tool marketplace preparation infrastructure

- **Adventure-Specific Tools**
  - [ ] Travel booking and reservation tools
  - [ ] Weather and location-based services
  - [ ] Currency conversion and local information
  - [ ] Activity recommendation engines
  - [ ] Safety and travel advisory tools

#### 5D. Tool Orchestration System

- **Intelligent Tool Selection**

  - [ ] Context-aware tool recommendation
  - [ ] Tool combination and workflow automation
  - [ ] Tool execution priority and dependency management
  - [ ] Tool result synthesis and presentation

- **Error Handling & Fallbacks**
  - Tool failure recovery strategies
  - Alternative tool suggestion system
  - Graceful degradation when tools are unavailable
  - Tool performance monitoring and alerting

### Technical Considerations

- MCP protocol compliance and compatibility
- Tool security sandboxing and execution isolation
- Rate limiting and cost management for external APIs
- Tool result caching and performance optimization

---

## 🚀 Phase 6: Production MVP & Admin Dashboard

### Overview

Transform AdventureCue into a production-ready application with comprehensive admin capabilities, monitoring, and user management systems.

### Core Components

#### 6A. Production Infrastructure

- **Deployment & Scaling**

  - Multi-environment setup (dev, staging, production)
  - Auto-scaling configurations for Netlify Functions
  - Database connection pooling and optimization
  - CDN setup for static assets and global distribution

- **Security Implementation**
  - Authentication system (Auth0, Supabase Auth, or custom)
  - API rate limiting and DDoS protection
  - Data encryption at rest and in transit
  - CORS policy management and security headers

#### 6B. Admin Dashboard Development

- **User Management Interface**

  - User registration, authentication, and profile management
  - User activity monitoring and analytics
  - Session management and security controls
  - User data export and privacy compliance tools

- **System Monitoring Dashboard**
  - Real-time system health and performance metrics
  - Database performance and query optimization insights
  - API usage analytics and cost tracking
  - Error logging and alerting system

#### 6C. Advanced UI Development

- **Enhanced Chat Interface**

  - Rich message formatting and markdown support
  - File upload and document processing interface
  - Voice input and audio response capabilities
  - Mobile-responsive design and PWA features

- **Admin Control Panels**
  - System configuration management interface
  - Tool and integration management dashboard
  - User support and help desk integration
  - Analytics and reporting dashboards

#### 6D. Quality Assurance & Testing

- **Comprehensive Testing Suite**

  - Unit tests for all service layers
  - Integration tests for API endpoints
  - End-to-end testing for user workflows
  - Performance testing and load testing

- **Monitoring & Observability**
  - Application performance monitoring (APM)
  - Error tracking and debugging tools
  - User experience monitoring and analytics
  - Business metrics tracking and reporting

### Business Considerations

- User onboarding and tutorial system
- Pricing model preparation and billing integration
- Legal compliance (GDPR, CCPA, Terms of Service)
- Customer support system integration

---

## 🤖 Phase 7: Multi-Agent Systems

### Overview

Evolve AdventureCue into a sophisticated multi-agent system where specialized AI agents collaborate to provide comprehensive adventure planning and support.

### Core Components

#### 7A. Agent Architecture Design

- **Agent Specialization Framework**

  - Travel Planning Agent (itinerary creation, booking coordination)
  - Local Expert Agent (destination knowledge, cultural insights)
  - Safety & Risk Assessment Agent (travel advisories, safety protocols)
  - Budget Management Agent (cost optimization, expense tracking)
  - Experience Curator Agent (activity recommendations, personalization)

- **Agent Communication Protocol**
  - Inter-agent messaging and data sharing
  - Agent coordination and task delegation
  - Conflict resolution between agent recommendations
  - Agent performance evaluation and optimization

#### 7B. Collaborative Intelligence System

- **Multi-Agent Orchestration**

  - Dynamic agent selection based on query context
  - Agent workflow management and task distribution
  - Parallel processing and result synthesis
  - Agent learning from collaborative experiences

- **Knowledge Sharing Infrastructure**
  - Shared knowledge base across all agents
  - Cross-agent learning and skill transfer
  - Collective memory and experience accumulation
  - Agent specialization evolution over time

#### 7C. Advanced Agent Capabilities

- **Autonomous Decision Making**

  - Agent goal setting and priority management
  - Independent research and information gathering
  - Proactive suggestion and recommendation systems
  - Adaptive behavior based on user feedback

- **Agent Personality & Specialization**
  - Distinct agent personas and communication styles
  - Domain expertise development and maintenance
  - Agent reliability and trust scoring
  - Specialized tool access and permissions

#### 7D. User Experience Integration

- **Multi-Agent Interface Design**

  - Agent identification and role clarity in conversations
  - Seamless handoffs between agents
  - Agent collaboration transparency for users
  - User preference learning across all agents

- **Agent Management Dashboard**
  - Agent performance monitoring and analytics
  - User feedback integration for agent improvement
  - Agent behavior customization and configuration
  - Agent training data management and curation

### Technical Challenges

- Agent state management and persistence
- Load balancing across multiple agent instances
- Agent versioning and backward compatibility
- Complex debugging and troubleshooting systems

---

## 🏢 Phase 8: RAG SaaS Platform Development

### Overview

Transform AdventureCue into a comprehensive RAG Software as a Service platform, enabling other businesses to build their own domain-specific RAG applications.

### Core Components

#### 8A. Platform Architecture

- **Multi-Tenant Infrastructure**

  - Tenant isolation and data segregation
  - Scalable resource allocation per tenant
  - Tenant-specific customization capabilities
  - White-label solution options

- **API Gateway & SDK Development**
  - RESTful API for all platform functionality
  - GraphQL endpoints for complex queries
  - SDK development for popular programming languages
  - API versioning and backward compatibility

#### 8B. RAG-as-a-Service Features

- **Custom Knowledge Base Management**

  - Tenant-specific document ingestion pipelines
  - Domain-specific embedding model selection
  - Custom preprocessing and chunking strategies
  - Knowledge base versioning and rollback capabilities

- **Configurable RAG Pipelines**
  - Drag-and-drop pipeline builder interface
  - Custom retrieval strategies and ranking algorithms
  - Configurable augmentation and generation parameters
  - A/B testing framework for pipeline optimization

#### 8C. Enterprise Features

- **Advanced Security & Compliance**

  - SOC 2 Type II compliance preparation
  - Enterprise-grade authentication (SAML, OIDC)
  - Data residency and regional compliance options
  - Advanced audit logging and compliance reporting

- **Enterprise Integration Capabilities**
  - Single Sign-On (SSO) integration
  - Enterprise directory service integration
  - Webhook system for enterprise workflows
  - Custom SLA and support tier options

#### 8D. Marketplace & Ecosystem

- **Tool and Integration Marketplace**

  - Third-party tool certification and marketplace
  - Revenue sharing model for tool developers
  - Integration template library
  - Community-driven tool development platform

- **Professional Services Layer**
  - Implementation consulting services
  - Custom development and integration services
  - Training and certification programs
  - Partner ecosystem development

#### 8E. Business Intelligence & Analytics

- **Platform Analytics Dashboard**

  - Cross-tenant usage analytics and insights
  - Performance benchmarking and optimization recommendations
  - Cost analysis and optimization suggestions
  - Predictive analytics for scaling and resource planning

- **Customer Success Tools**
  - Customer health scoring and monitoring
  - Automated onboarding and success workflows
  - Usage-based billing and subscription management
  - Customer feedback and feature request management

### Strategic Considerations

- Competitive analysis and market positioning
- Pricing strategy for different customer segments
- Partnership development with complementary services
- Intellectual property protection and licensing
- International expansion and localization strategy

---

## 🎯 Success Metrics by Phase

### Phase 4 Metrics

- [ ] Session retention rate > 70%
- [ ] Average conversation length > 10 turns
- [ ] Chat history search accuracy > 85%
- [ ] Memory recall effectiveness in conversations

### Phase 5 Metrics

- [ ] Tool success rate > 95%
- [ ] Average tools used per conversation
- [ ] Tool response time < 3 seconds
- [ ] Custom function adoption rate

### Phase 6 Metrics

- [ ] System uptime > 99.9%
- [ ] User registration and retention rates
- [ ] Admin dashboard adoption by internal users
- [ ] Customer support ticket resolution time < 24 hours

### Phase 7 Metrics

- [ ] Multi-agent collaboration success rate
- [ ] User satisfaction with agent specialization
- [ ] Agent learning and improvement metrics
- [ ] Cross-agent knowledge sharing effectiveness

### Phase 8 Metrics

- [ ] Customer acquisition cost (CAC) and lifetime value (LTV)
- [ ] Platform adoption rate by enterprise customers
- [ ] API usage growth and developer satisfaction
- [ ] Revenue per customer and platform profitability

---

## 🔄 Dependencies & Prerequisites

### Phase 4 Prerequisites

- Phase 3 completion (current status tracking system)
- Database migration planning
- User authentication strategy decision

### Phase 5 Prerequisites

- Phase 4 session management foundation
- MCP protocol research and planning
- OpenAI API tier upgrade planning

### Phase 6 Prerequisites

- Phases 4-5 core functionality completion
- Production infrastructure planning
- Security audit preparation

### Phase 7 Prerequisites

- Phase 6 stable production environment
- Multi-agent architecture research
- Advanced AI coordination planning

### Phase 8 Prerequisites

- Phases 1-7 complete and stable
- Market research and competitive analysis
- Business model validation

---

## 💡 Innovation Opportunities

### Emerging Technologies to Consider

- **AI Advancements**: Integration of latest LLM capabilities and multimodal AI
- **Edge Computing**: Local AI processing for privacy-sensitive applications
- **Blockchain Integration**: Decentralized knowledge verification and sharing
- **AR/VR Integration**: Immersive adventure planning and virtual experiences

### Market Differentiation Strategies

- **Vertical Specialization**: Deep domain expertise in adventure/travel vs. generic RAG
- **Community Features**: User-generated content and community knowledge sharing
- **Real-time Collaboration**: Multi-user adventure planning and group decision making
- **Offline Capabilities**: Download-and-go adventure guides with offline AI assistance

---

## 📝 Quick Reference & Progress Tracker

### Completed Phases Summary

- ✅ **Phase 1** (July 10, 2025): Foundation & RAG Core - [`rag-architecture.md`](./rag-architecture.md)
- ✅ **Phase 2** (July 22, 2025): Agentic Enhancement - [`agentic-vs-traditional-rag.md`](./agentic-vs-traditional-rag.md)
- ✅ **Phase 3** (July 27, 2025): System Refactoring - [`architecture-overview.md`](./architecture-overview.md), [`chat-system-diagrams.md`](./chat-system-diagrams.md), [`status-tracking-guide.md`](./status-tracking-guide.md)

### Current Focus

🎯 **Phase 4**: Chat History & Session Management (PostgreSQL + Neon database expansion)

### Overall Progress Tracking

```
Phase 1: ████████████████████████████████ 100% ✅
Phase 2: ████████████████████████████████ 100% ✅
Phase 3: ████████████████████████████████ 100% ✅
Phase 4: ████████░░░░░░░░░░░░░░░░░░░░░░░░  25% 🔄
Phase 5: ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   0% 📋
Phase 6: ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   0% 📋
Phase 7: ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   0% 📋
Phase 8: ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   0% 📋
```

### Key Architectural Foundations Established ✅

- [x] Vector embeddings and semantic search
- [x] Agentic RAG with tool calling
- [x] Modular service architecture
- [x] Real-time status tracking system
- [x] Comprehensive type system
- [x] Visual documentation and diagrams

### Next Milestone Checklist (Phase 4)

Track your progress on chat history implementation:

- [x] **Database schema extensions** - Core tables and relationships established
- [ ] Session management system
- [ ] Message storage and threading
- [ ] Chat history search and retrieval
- [ ] Memory management (short & long-term)
- [ ] Performance optimization

---

_This roadmap serves as your development north star, providing clear phases, measurable goals, and strategic direction for transforming AdventureCue into a comprehensive RAG SaaS platform._
