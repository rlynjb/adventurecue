/**
 * EXAMPLE: Using the Streaming Client in a React Component
 *
 * This shows how to import and use the streaming client package
 * in your React components.
 */

"use client";

import {
  queryWithStreaming,
  StreamEvent,
} from "@/lib/packages/sse-streaming-client";
import { useState } from "react";

export default function ChatExample() {
  const [query, setQuery] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsStreaming(true);

    try {
      // Use the streaming client from our packages
      await queryWithStreaming(query);
    } catch (error) {
      console.error("Streaming failed:", error);
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div className="chat-container">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask something..."
          disabled={isStreaming}
        />
        <button type="submit" disabled={isStreaming}>
          {isStreaming ? "Streaming..." : "Send"}
        </button>
      </form>

      {/* These elements will be updated by the streaming client */}
      <div id="chat-status" className="status-area"></div>
      <div id="chat-response" className="response-area"></div>
      <div id="execution-summary" className="summary-area"></div>
      <div id="chat-error" className="error-area"></div>
    </div>
  );
}

/**
 * ADVANCED USAGE: Custom Event Handling
 */
export function AdvancedChatExample() {
  const [events, setEvents] = useState<StreamEvent[]>([]);

  const handleCustomStreaming = async (userQuery: string) => {
    // Import the StreamProcessor directly for more control
    const { StreamProcessor } = await import(
      "@/lib/packages/sse-streaming-client"
    );
    const processor = new StreamProcessor();

    await processor.processQuery(userQuery, (event: StreamEvent) => {
      // Custom handling - add to our state
      setEvents((prev) => [...prev, event]);

      // Log different event types
      if (event.type === "status") {
        console.log("Progress:", event.status?.description);
      } else if (event.type === "final") {
        console.log("Complete:", event.result?.response);
      }
    });
  };

  return (
    <div>
      <button onClick={() => handleCustomStreaming("Tell me a joke")}>
        Start Custom Streaming
      </button>

      <div>
        {events.map((event, index) => (
          <div key={index} className={`event event-${event.type}`}>
            <strong>{event.type}:</strong>
            <pre>{JSON.stringify(event, null, 2)}</pre>
          </div>
        ))}
      </div>
    </div>
  );
}
