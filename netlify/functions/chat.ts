import { generateAnswer } from "../services/chat";
import { ChatResponse, ChatStatus } from "../services/chat/types";
import { generateContext } from "../services/embedding";
import { handleStreamingRequest } from "../services/streaming";
import { validateRequest } from "../utils/validation";
import { RequestBody, ValidateRequest } from "./types";

/**
 * @todo
 * clean up response object.
 * maybe use AI SDK to format the response
 * to match the expected UI format.
 * This would allow us to use the same response structure
 * for both streaming and non-streaming requests.
 *
 * modify handleStreamingRequest to return a AI SDK compatible response
 * so we can use the same response structure for both streaming and non-streaming requests.
 */

/**
 * Enhanced query handler with real-time status updates and memory support
 */
const handler = async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  let body: RequestBody;
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
 * Process query with detailed status tracking and optional memory
 */
async function processQueryWithStatus(data: {
  query: string;
  sessionId?: string;
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

  // Pass sessionId to enable memory functionality if provided
  const result = await generateAnswer(
    data.query,
    contextText,
    onStatusUpdate,
    data.sessionId // Enable memory if sessionId is provided
  );

  // Add any additional processing status if needed
  return {
    ...result,
    steps: [...statusUpdates, ...result.steps], // Merge any additional status updates
  };
}

export default handler;
