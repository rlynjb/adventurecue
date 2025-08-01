import { generateAnswer } from "../services/chat";
import { ChatResponse, ChatStatus } from "../services/chat/types";
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
  const contextText = "Your travel context here...";

  const result = await generateAnswer(data.query, contextText, onStatusUpdate);

  // Add any additional processing status if needed
  return {
    ...result,
    steps: [...statusUpdates, ...result.steps], // Merge any additional status updates
  };
}

/**
 * Handle streaming responses with Server-Sent Events (SSE)
 *
 * SSE Implementation Overview:
 * 1. Creates a ReadableStream to handle continuous data flow
 * 2. Sets proper SSE headers (text/event-stream, no-cache, keep-alive)
 * 3. Formats data according to SSE protocol (data: prefix, double newline)
 * 4. Streams real-time status updates to the client
 */
async function handleStreamingRequest(data: {
  query: string;
}): Promise<Response> {
  // SSE STEP 1: Create a ReadableStream for continuous data transmission
  // This stream allows us to send data chunks incrementally to the client
  const stream = new ReadableStream({
    start(controller) {
      // SSE STEP 2: Define status update handler
      // This callback sends formatted SSE events to the client
      const onStatusUpdate = (status: ChatStatus) => {
        // SSE Protocol: Format data with "data: " prefix and double newline terminator
        // Each SSE event must follow this format: "data: <JSON>\n\n"
        const eventData = `data: ${JSON.stringify({
          type: "status", // Event type for client-side handling
          status, // The actual status data
        })}\n\n`;

        // SSE STEP 3: Enqueue encoded data to the stream
        // TextEncoder converts string to Uint8Array for network transmission
        controller.enqueue(new TextEncoder().encode(eventData));
      };

      // SSE STEP 4: Start processing with streaming callbacks
      // This function will call onStatusUpdate multiple times during processing
      processQueryWithStreaming(data, onStatusUpdate, controller);
    },
  });

  // SSE STEP 5: Return Response with proper SSE headers
  return new Response(stream, {
    headers: {
      // REQUIRED: Identifies this as an SSE stream
      "Content-Type": "text/event-stream",

      // IMPORTANT: Prevents browser/proxy caching of streaming data
      "Cache-Control": "no-cache",

      // IMPORTANT: Keeps connection open for continuous streaming
      Connection: "keep-alive",
    },
  });
}

/**
 * Example streaming implementation with SSE protocol handling
 *
 * This function demonstrates the complete SSE lifecycle:
 * 1. Process data asynchronously
 * 2. Send incremental updates via SSE
 * 3. Send final result
 * 4. Properly close the stream
 */
async function processQueryWithStreaming(
  data: { query: string },
  onStatusUpdate: (status: ChatStatus) => void,
  controller: ReadableStreamDefaultController
) {
  try {
    // Simulate getting context (in real implementation, this would be from vector DB)
    const contextText = "Your travel context here...";

    // SSE EVENT FLOW: This function will trigger multiple onStatusUpdate calls
    // Each call sends an individual SSE event to the client
    const result = await generateAnswer(
      data.query,
      contextText,
      onStatusUpdate // This callback sends real-time status updates via SSE
    );

    // SSE FINAL EVENT: Send the complete result to the client
    // Note the "type: final" - this tells the client processing is complete
    const finalData = `data: ${JSON.stringify({
      type: "final", // Special event type indicating completion
      result, // The final processed result
    })}\n\n`;

    // SSE Protocol: Send final event through the stream
    controller.enqueue(new TextEncoder().encode(finalData));

    // SSE CLEANUP: Close the stream to signal completion
    // This tells the browser that no more events will be sent
    controller.close();
  } catch (error) {
    // SSE ERROR HANDLING: Send error event and close stream
    const errorData = `data: ${JSON.stringify({
      type: "error", // Error event type for client-side error handling
      error: error instanceof Error ? error.message : "Unknown error",
    })}\n\n`;

    // Send error event via SSE
    controller.enqueue(new TextEncoder().encode(errorData));

    // Always close the stream, even on error
    controller.close();
  }
}

export default handler;
