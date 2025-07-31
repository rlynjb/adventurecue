import { generateAnswer } from "../services/chat";
import { ChatResponse, ChatStatus } from "../services/chat/types";
import {
  validateRequest,
  type ValidateRequest,
} from "../utils/validation";

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
    // For streaming responses, you might want to use Server-Sent Events
    if (body.streaming) {
      return handleStreamingRequest(validation.data!);
    }

    // Regular request with full status tracking
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
 * Handle streaming responses with Server-Sent Events
 */
async function handleStreamingRequest(data: {
  query: string;
}): Promise<Response> {
  const stream = new ReadableStream({
    start(controller) {
      // This would be implemented for real-time status updates
      const onStatusUpdate = (status: ChatStatus) => {
        const eventData = `data: ${JSON.stringify({
          type: "status",
          status,
        })}\n\n`;
        controller.enqueue(new TextEncoder().encode(eventData));
      };

      // Process the query with streaming updates
      processQueryWithStreaming(data, onStatusUpdate, controller);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

/**
 * Example streaming implementation
 */
async function processQueryWithStreaming(
  data: { query: string },
  onStatusUpdate: (status: ChatStatus) => void,
  controller: ReadableStreamDefaultController
) {
  try {
    const contextText = "Your travel context here...";

    const result = await generateAnswer(
      data.query,
      contextText,
      onStatusUpdate
    );

    // Send final result
    const finalData = `data: ${JSON.stringify({
      type: "final",
      result,
    })}\n\n`;
    controller.enqueue(new TextEncoder().encode(finalData));

    // Close the stream
    controller.close();
  } catch (error) {
    const errorData = `data: ${JSON.stringify({
      type: "error",
      error: error instanceof Error ? error.message : "Unknown error",
    })}\n\n`;
    controller.enqueue(new TextEncoder().encode(errorData));
    controller.close();
  }
}

export default handler;
