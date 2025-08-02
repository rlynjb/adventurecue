# Chat API

## Table of Contents

- [Endpoint Description](#endpoint-description)
- [Request](#request)
- [Response](#response)
- [Frontend Usage](#frontend-usage)
- [HTTP Status Codes](#http-status-codes)
- [Security Notes](#security-notes)
- [Related Endpoints](#related-endpoints)
- [UI Implementation](#ui-implementation)

## Endpoint Description

The Chat API enables conversational AI interactions with support for memory-enabled conversations and real-time streaming responses. It processes user queries and returns intelligent responses using RAG (Retrieval-Augmented Generation) capabilities.

## Request

### Method & URL

```
POST https://your-domain.netlify.app/.netlify/functions/chat
```

### Headers

```
Content-Type: application/json
```

### Request Body

| Parameter   | Type    | Required | Default | Description                           |
| ----------- | ------- | -------- | ------- | ------------------------------------- |
| `query`     | string  | Yes      | -       | User's question or input              |
| `sessionId` | string  | No       | -       | Session ID for conversation memory    |
| `streaming` | boolean | No       | false   | Enable Server-Sent Events streaming   |
| `top_k`     | number  | No       | 5       | Number of context results to retrieve |

#### Example Request Body

```json
{
  "query": "What are the best attractions in Paris?",
  "sessionId": "chat_1722513600_abc123",
  "streaming": false,
  "top_k": 5
}
```

## Response

### Success Response

#### Standard Response (streaming: false)

```json
{
  "success": true,
  "response": "Here are the top attractions in Paris: 1. Eiffel Tower...",
  "steps": [
    {
      "step": 1,
      "description": "Analyzing query and generating context",
      "status": "completed",
      "timestamp": 1722513600000
    }
  ],
  "toolsUsed": ["vector_search", "ai_generation"],
  "executionTimeMs": 2400,
  "sessionId": "chat_1722513600_abc123"
}
```

#### Streaming Response (streaming: true)

Server-Sent Events with the following event types:

```
data: {"type":"status","status":{"step":1,"description":"Processing query","status":"executing","timestamp":1722513600000}}

data: {"type":"final","result":{"success":true,"response":"Paris attractions include...","sessionId":"chat_1722513600_abc123"}}
```

### Error Response

```json
{
  "error": "Invalid request: query is required",
  "code": "VALIDATION_ERROR"
}
```

## Frontend Usage

### TypeScript Interface

```typescript
interface ChatRequest {
  query: string;
  sessionId?: string;
  streaming?: boolean;
  top_k?: number;
}

interface ChatResponse {
  success: boolean;
  response: string;
  steps: ChatStatus[];
  toolsUsed: string[];
  executionTimeMs: number;
  sessionId?: string;
}

interface ChatStatus {
  step: number;
  description: string;
  status: "pending" | "executing" | "completed" | "failed";
  timestamp: number;
}
```

### Standard Request

```typescript
async function sendChatMessage(request: ChatRequest): Promise<ChatResponse> {
  const response = await fetch("/.netlify/functions/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

// Usage
const result = await sendChatMessage({
  query: "Tell me about Tokyo attractions",
  sessionId: "my-session-123",
});
```

### Streaming Request

```typescript
async function streamChatMessage(
  request: ChatRequest,
  onStatus: (status: ChatStatus) => void,
  onComplete: (result: ChatResponse) => void,
  onError: (error: Error) => void
): Promise<void> {
  const response = await fetch("/.netlify/functions/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ...request, streaming: true }),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  try {
    while (reader) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split("\n");

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = JSON.parse(line.slice(6));

          if (data.type === "status") {
            onStatus(data.status);
          } else if (data.type === "final") {
            onComplete(data.result);
          } else if (data.type === "error") {
            onError(new Error(data.error));
          }
        }
      }
    }
  } catch (error) {
    onError(error as Error);
  }
}
```

## HTTP Status Codes

| Status Code | Description                                           |
| ----------- | ----------------------------------------------------- |
| `200`       | Request successful                                    |
| `400`       | Bad Request - Invalid JSON or missing required fields |
| `405`       | Method Not Allowed - Only POST requests accepted      |
| `500`       | Internal Server Error - Server-side processing error  |

## Security Notes

- **Rate Limiting**: Consider implementing rate limiting for production use
- **Input Validation**: All user inputs are validated and sanitized
- **Error Handling**: Sensitive error details are not exposed to clients
- **CORS**: Configure CORS headers appropriately for your domain

## Related Endpoints

| Endpoint         | Method | Description                          |
| ---------------- | ------ | ------------------------------------ |
| `/chat`          | POST   | Main chat interface (this endpoint)  |
| `/sessions`      | GET    | List chat sessions (if implemented)  |
| `/sessions/{id}` | DELETE | Delete chat session (if implemented) |

## UI Implementation

### Recommended Libraries

**For React/Next.js:**

- `@chatscope/chat-ui-kit-react` - Complete chat UI components
- `react-chat-widget` - Simple chat widget
- `@microsoft/fluentui-chat` - Microsoft Fluent UI chat components

**For Basic Streaming:**

- `eventsource` - Polyfill for Server-Sent Events
- `sse.js` - Lightweight SSE client

### Custom React Implementation

```tsx
import React, { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const result = await sendChatMessage({
        query: input,
        sessionId: sessionId || undefined,
      });

      const assistantMessage: Message = {
        role: "assistant",
        content: result.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (result.sessionId) {
        setSessionId(result.sessionId);
      }
    } catch (error) {
      console.error("Chat error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <div className="messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.role}`}>
            <strong>{msg.role}:</strong> {msg.content}
          </div>
        ))}
        {loading && <div className="loading">Thinking...</div>}
      </div>

      <div className="input-area">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type your message..."
          disabled={loading}
        />
        <button onClick={sendMessage} disabled={loading || !input.trim()}>
          Send
        </button>
      </div>
    </div>
  );
}
```

### Basic CSS

```css
.chat-container {
  max-width: 600px;
  height: 500px;
  display: flex;
  flex-direction: column;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.messages {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.message {
  margin-bottom: 0.5rem;
  padding: 0.5rem;
  border-radius: 4px;
}

.message.user {
  background-color: #e3f2fd;
  margin-left: 2rem;
}

.message.assistant {
  background-color: #f5f5f5;
  margin-right: 2rem;
}

.input-area {
  display: flex;
  padding: 1rem;
  border-top: 1px solid #ddd;
}

.input-area input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-right: 0.5rem;
}

.input-area button {
  padding: 0.5rem 1rem;
  background-color: #1976d2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.input-area button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.loading {
  font-style: italic;
  color: #666;
}
```
