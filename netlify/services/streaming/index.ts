// Re-export the main streaming functionality
export { handleStreamingRequest } from "./sse-handler";

// Types (to be expanded in future phases)
export type { ChatStatus } from "../chat/types";

/**
 * Streaming Service
 *
 * This service provides real-time streaming capabilities for chat responses
 * using Server-Sent Events (SSE). Currently in Phase 0 with basic functionality.
 *
 * See roadmap.md for planned enhancements and future development phases.
 */
