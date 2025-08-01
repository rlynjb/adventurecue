# UI Packages

This directory contains reusable UI packages/features that can be used across the application. Each package is self-contained and focused on a specific functionality.

## 📁 Structure

```
src/lib/packages/
├── index.ts                    # Main exports for all packages
├── sse-streaming-client.ts     # Real-time chat streaming functionality
├── usage-examples.tsx          # React component examples
└── README.md                   # This file
```

## 📦 Available Packages

### SSE Streaming Client (`sse-streaming-client.ts`)

A complete streaming chat client for handling real-time Server-Sent Events (SSE) from the chat API.

**Core Components:**

- **StreamConnection** - Handles server communication
- **StreamBuffer** - Manages incoming data chunks
- **EventParser** - Converts text lines to event objects
- **StreamProcessor** - Coordinates all components
- **EventHandler** - Routes events to appropriate handlers

**Usage:**

```typescript
import { queryWithStreaming, StreamEvent } from "@/lib/packages";

// Basic usage
await queryWithStreaming("What is the weather like today?");

// Custom event handling
const processor = new StreamProcessor();
await processor.processQuery(userQuery, (event: StreamEvent) => {
  console.log("Received event:", event);
});
```

**Key Features:**

- ✅ Modular, trainee-friendly code structure
- ✅ Complete error handling and cleanup
- ✅ Multiple usage examples included
- ✅ TypeScript interfaces for type safety
- ✅ Built-in UI integration helpers

## 🔄 EventSource vs Custom SSE Streaming Client

### Why We Built a Custom Implementation

While the browser's built-in `EventSource` API is great for basic Server-Sent Events, our custom implementation provides more flexibility and control for complex chat applications.

| Feature             | EventSource             | Our Custom SSE Client         |
| ------------------- | ----------------------- | ----------------------------- |
| **HTTP Method**     | GET only                | POST, PUT, DELETE, etc.       |
| **Request Body**    | URL params only         | Full JSON request body        |
| **Headers**         | Limited control         | Full header control           |
| **Authentication**  | Basic auth only         | Bearer tokens, custom auth    |
| **Error Handling**  | Basic reconnection      | Custom retry logic            |
| **Data Format**     | Must follow SSE format  | Any format we want            |
| **Parsing**         | Automatic event parsing | Manual parsing (more control) |
| **Browser Support** | Built-in, optimized     | Manual implementation         |

### EventSource Limitations for Chat Applications

```typescript
// ❌ EventSource - Limited to GET requests
const eventSource = new EventSource("/api/events?query=hello&streaming=true");

// ❌ Complex data must go in URL (messy)
const url = `/api/events?query=${encodeURIComponent(
  longQuery
)}&context=${encodeURIComponent(JSON.stringify(context))}`;

// ❌ Limited authentication options
const eventSource = new EventSource("/api/events", {
  withCredentials: true, // Only basic auth
});
```

### Our Custom Implementation Benefits

```typescript
// ✅ POST requests with clean JSON bodies
const response = await fetch("/api/chat", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    "X-User-ID": userId,
  },
  body: JSON.stringify({
    query: userQuery,
    context: additionalData,
    options: { temperature: 0.7 },
  }),
});

// ✅ Custom data format (more flexible)
/*
data: {"type": "status", "status": {"step": 1, "description": "Processing"}}
data: {"type": "final", "result": {"response": "Here's your answer..."}}
*/
```

### When to Use Each Approach

**Use EventSource when:**

- ✅ Simple GET-based streaming is sufficient
- ✅ Standard SSE format is acceptable
- ✅ Basic authentication is enough
- ✅ Built-in reconnection is preferred
- ✅ Data can fit in URL parameters

**Use Our Custom SSE Client when:**

- ✅ Need POST/PUT/DELETE methods (like chat applications)
- ✅ Complex request bodies with JSON data
- ✅ Custom authentication headers (Bearer tokens)
- ✅ Flexible data formats
- ✅ Advanced error handling and retry logic
- ✅ Educational value (understanding streaming internals)

### Educational Benefits

Our custom implementation teaches important concepts:

- **Stream Processing**: How browsers handle streaming data
- **Buffer Management**: Why we need to collect data chunks
- **Event Parsing**: How to parse Server-Sent Events manually
- **Connection Handling**: HTTP request lifecycle management
- **Error Recovery**: Proper cleanup and error handling

EventSource hides these details behind a simple API, which is great for production but less educational for understanding streaming fundamentals.

## 🚀 How to Add New Packages

1. **Create the package file** in this directory (e.g., `my-feature.ts`)
2. **Export the main functions** from your package
3. **Add exports to `index.ts`** so others can import easily
4. **Update this README** with documentation
5. **Follow the same patterns** as existing packages

## 📋 Package Guidelines

- **Single Responsibility** - Each package should focus on one feature
- **Clear Documentation** - Include comments and examples
- **TypeScript Types** - Export interfaces for type safety
- **Error Handling** - Proper error handling and cleanup
- **Testable** - Design for easy unit testing
- **Self-Contained** - Minimal external dependencies

## 📖 Import Examples

```typescript
// Import specific functions
import { queryWithStreaming, StreamEvent } from "@/lib/packages";

// Import with alias
import { streamingChatClient } from "@/lib/packages";

// Import examples for learning
import {
  example1_BasicUsage,
  example2_CustomEventHandling,
} from "@/lib/packages";

// Import initialization helpers
import { initializeChatForm } from "@/lib/packages";
```

## 🏗️ Architecture Benefits

- **Maintainable** - Each package can be updated independently
- **Reusable** - Features can be used across different components
- **Testable** - Individual packages can be unit tested
- **Educational** - Clear separation makes code easier to understand
- **Scalable** - Easy to add new features without cluttering
