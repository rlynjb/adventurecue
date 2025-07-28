/**
 * UI PACKAGES INDEX
 *
 * This file exports all the UI packages/features for easy importing.
 * Each package is a self-contained feature with clear functionality.
 */

// Streaming Client Package - Handles real-time chat streaming
export {
  example1_BasicUsage,
  example2_CustomEventHandling,
  example3_WithErrorHandling,
  example4_NonStreaming,
  initializeChatForm,
  queryWithStreaming,
  StreamProcessor,
} from "./sse-streaming-client";

// Export types for external use
export type { StreamEvent } from "./sse-streaming-client";

// Re-export the main streaming function with a clear name
export { queryWithStreaming as streamingChatClient } from "./sse-streaming-client";
