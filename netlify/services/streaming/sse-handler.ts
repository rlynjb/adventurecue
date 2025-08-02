import { generateAnswer } from "../chat";
import { ChatStatus } from "../chat/types";
import { generateContext } from "../embedding";

/**
 * Handle streaming responses with Server-Sent Events (SSE)
 *
 * SSE Implementation Overview:
 * 1. Creates a ReadableStream to handle continuous data flow
 * 2. Sets proper SSE headers (text/event-stream, no-cache, keep-alive)
 * 3. Formats data according to SSE protocol (data: prefix, double newline)
 * 4. Streams real-time status updates to the client
 */
export async function handleStreamingRequest(data: {
  query: string;
  sessionId?: string;
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
 * Example streaming implementation with SSE protocol handling and optional memory
 *
 * This function demonstrates the complete SSE lifecycle:
 * 1. Process data asynchronously
 * 2. Send incremental updates via SSE
 * 3. Send final result
 * 4. Properly close the stream
 */
async function processQueryWithStreaming(
  data: { query: string; sessionId?: string },
  onStatusUpdate: (status: ChatStatus) => void,
  controller: ReadableStreamDefaultController
) {
  try {
    // Simulate getting context (in real implementation, this would be from vector DB)
    const contextText = await generateContext(data);

    // SSE EVENT FLOW: This function will trigger multiple onStatusUpdate calls
    // Each call sends an individual SSE event to the client
    // Pass sessionId to enable memory functionality if provided
    const result = await generateAnswer(
      data.query,
      contextText,
      onStatusUpdate, // This callback sends real-time status updates via SSE
      data.sessionId // Enable memory if sessionId is provided
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
