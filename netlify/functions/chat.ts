import { generateAnswer } from "../services/chat";
import { ChatResponse, ChatStatus } from "../services/chat/types";
import { generateContext } from "../services/embedding";
import { handleStreamingRequest } from "../utils/sse-streaming";
import { validateRequest, type ValidateRequest } from "../utils/validation";

/**
 * SERVER-SENT EVENTS (SSE) IMPLEMENTATION OVERVIEW
 * ================================================
 *
 * This file implements a chat API with two response modes:
 *
 * 1. REGULAR MODE: Standard JSON response after processing completes
 * 2. STREAMING MODE: Real-time updates via Server-Sent Events (SSE)
 *
 * SSE Implementation Details:
 * ---------------------------
 * • Uses ReadableStream to create continuous data flow
 * • Follows SSE protocol: "data: <JSON>\n\n" format
 * • Sets required headers: text/event-stream, no-cache, keep-alive
 * • Sends three types of events: "status", "final", "error"
 * • Properly handles stream lifecycle (start, update, close)
 *
 * Client Usage:
 * -------------
 * const eventSource = new EventSource('/api/chat');
 * eventSource.onmessage = (event) => {
 *   const data = JSON.parse(event.data);
 *   if (data.type === 'status') {
 *     // Handle real-time status updates
 *   } else if (data.type === 'final') {
 *     // Handle final result
 *     eventSource.close();
 *   }
 * };
 */

/**
 * Enhanced query handler with real-time status updates
 * This demonstrates how to use the status tracking functionality
 */
const handler = async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  let body;
  try {
    body = await req.json();
  } catch (e) {
    console.error(e);
    return new Response("Invalid JSON payload", { status: 400 });
  }

  // Validate request
  const validation: ValidateRequest = validateRequest(body);
  if (!validation.isValid) {
    return new Response(validation.error, { status: 400 });
  }

  try {
    // SSE ROUTING: Check if client requested streaming response
    // When streaming=true, use Server-Sent Events for real-time updates
    if (body.streaming) {
      return handleStreamingRequest(validation.data!);
    }

    // NON-SSE PATH: Regular request with full status tracking
    // This returns a complete response after all processing is done
    const result: ChatResponse = await processQueryWithStatus(validation.data!);

    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    console.error(err);
    return new Response("Internal Server Error", { status: 500 });
  }
};

/**
 * Process query with detailed status tracking
 */
async function processQueryWithStatus(data: {
  query: string;
}): Promise<ChatResponse> {
  const statusUpdates: ChatStatus[] = [];

  // Status callback to collect all updates
  const onStatusUpdate = (status: ChatStatus) => {
    console.log(`[${status.step}] ${status.description} - ${status.status}`);
    statusUpdates.push(status);
  };

  // This is a simplified version - in reality you'd want to get the context
  // from your vector database first, then call generateAnswer
  const contextText = await generateContext(data);

  const result = await generateAnswer(data.query, contextText, onStatusUpdate);

  // Add any additional processing status if needed
  return {
    ...result,
    steps: [...statusUpdates, ...result.steps], // Merge any additional status updates
  };
}

export default handler;
