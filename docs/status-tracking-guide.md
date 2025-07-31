# Chat Status Tracking System

This document explains how to use the enhanced chat system with real-time status updates for OpenAI calls and tool execution.

## Overview

The status tracking system provides real-time feedback to users about what's happening during the chat processing pipeline. This includes:

- OpenAI API call status
- Tool execution progress
- Error handling
- Execution timing and metrics

## Key Components

### 1. Status Interfaces

```typescript
interface ChatStatus {
  step: number;
  description: string;
  status: "pending" | "executing" | "completed" | "failed";
  timestamp: number;
  data?: any;
}

interface ChatResponse {
  success: boolean;
  response: string;
  steps: ChatStatus[];
  toolsUsed: string[];
  executionTimeMs: number;
}
```

### 2. Enhanced Functions

#### `generateAnswer()` - Main function with status tracking

```typescript
const result = await generateAnswer(
  query,
  contextText,
  onStatusUpdate // Optional callback for real-time updates
);
```

#### `executeToolCall()` - Tool execution with status

```typescript
const toolResult = await executeToolCall(
  toolCall,
  context,
  onStatusUpdate // Receives status updates during tool execution
);
```

## Usage Examples

### 1. Basic Usage (Non-streaming)

```typescript
import { generateAnswer, ChatStatus } from "../services/chat";

const statusUpdates: ChatStatus[] = [];

const onStatusUpdate = (status: ChatStatus) => {
  console.log(`[${status.step}] ${status.description} - ${status.status}`);
  statusUpdates.push(status);

  // Update your UI here
  updateUserInterface(status);
};

const result = await generateAnswer(
  "What are the best places to visit in Tokyo?",
  contextText,
  onStatusUpdate
);

console.log("Final response:", result.response);
console.log("Execution time:", result.executionTimeMs + "ms");
console.log("Tools used:", result.toolsUsed);
```

### 2. Streaming Implementation

For real-time updates, use Server-Sent Events:

```typescript
// Server-side (Netlify function)
const stream = new ReadableStream({
  start(controller) {
    const onStatusUpdate = (status: ChatStatus) => {
      const eventData = `data: ${JSON.stringify({
        type: "status",
        status,
      })}\\n\\n`;
      controller.enqueue(new TextEncoder().encode(eventData));
    };

    processQuery(data, onStatusUpdate, controller);
  },
});

return new Response(stream, {
  headers: {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  },
});
```

```javascript
// Client-side
const response = await fetch("/api/chat", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ query: userQuery, streaming: true }),
});

const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  const chunk = decoder.decode(value);
  const lines = chunk.split("\\n");

  for (const line of lines) {
    if (line.startsWith("data: ")) {
      const eventData = JSON.parse(line.slice(6));
      handleStatusUpdate(eventData.status);
    }
  }
}
```

### 3. React Component Example

```jsx
import React, { useState, useCallback } from "react";

function ChatWithStatus() {
  const [status, setStatus] = useState([]);
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleQuery = useCallback(async (query) => {
    setIsLoading(true);
    setStatus([]);
    setResponse("");

    try {
      const result = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      const data = await result.json();

      setResponse(data.response);
      setStatus(data.steps);
    } catch (error) {
      console.error("Query failed:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div>
      <input
        type="text"
        onKeyPress={(e) => e.key === "Enter" && handleQuery(e.target.value)}
        placeholder="Ask a question..."
      />

      {isLoading && <div>Processing...</div>}

      <div className="status-container">
        {status.map((step, index) => (
          <div key={index} className={`status-step ${step.status}`}>
            <span>
              Step {step.step}: {step.description}
            </span>
            <span className="status-badge">{step.status}</span>
          </div>
        ))}
      </div>

      {response && (
        <div className="response-container">
          <h3>Response:</h3>
          <p>{response}</p>
        </div>
      )}
    </div>
  );
}
```

## Status Steps Explained

The system tracks these main steps:

1. **Step 1**: Query Analysis and Preparation

   - "Analyzing your query and preparing request"
   - "Query prepared, calling OpenAI"

2. **Step 2**: Initial OpenAI Call

   - "Waiting for OpenAI response"
   - "Received initial response from OpenAI"

3. **Step 3**: Tool Execution (if needed)

   - "Executing [tool_name]"
   - Tool-specific status messages
   - "Tool execution completed"

4. **Step 4**: Follow-up OpenAI Call (if tools were used)

   - "Sending tool results back to OpenAI"
   - "Received final response from OpenAI"

5. **Step 5**: Completion
   - "Response generation completed"

## Tool-Specific Status Messages

Each tool type provides specific status updates:

- **web_search_call**: "Searching the web for relevant information"
- **custom_api_call**: "Calling external API for additional data"
- **database_lookup**: "Searching database for relevant records"

## Error Handling

Failed steps are marked with `status: 'failed'` and include error details:

```typescript
{
  step: 3,
  description: "Tool execution failed: API timeout",
  status: 'failed',
  timestamp: 1642684800000,
  data: { error: "Request timeout after 10s" }
}
```

## Performance Metrics

The `ChatResponse` includes timing information:

- `executionTimeMs`: Total execution time
- `toolsUsed`: Array of tool types that were executed
- `steps`: Complete step-by-step breakdown with timestamps

## Files

- `netlify/services/chat.ts` - Main chat service with status tracking
- `netlify/functions/chat.ts` - Example Netlify function
- `examples/client-status-handling.ts` - Client-side JavaScript examples
- `examples/status-demo.html` - Interactive HTML demo

## Demo

Open `examples/status-demo.html` in your browser to see a working demonstration of the status tracking system.

## Migration from Old System

If you're upgrading from the old system:

1. **Backward Compatibility**: Use `generateSimpleAnswer()` for a drop-in replacement
2. **Gradual Migration**: Update one endpoint at a time to use the new status tracking
3. **UI Updates**: Add status display components to show progress to users

The old function signature still works:

```typescript
// Old way (still supported)
const answer = await generateAnswer(query, contextText);

// New way (recommended)
const result = await generateAnswer(query, contextText, onStatusUpdate);
const answer = result.response;
```
