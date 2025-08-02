// Status tracking interfaces
export interface ChatStatus {
  step: number;
  description: string;
  status: "pending" | "executing" | "completed" | "failed";
  timestamp: number;
  data?: unknown;
}

export interface ChatResponse {
  success: boolean;
  response: string;
  steps: ChatStatus[];
  toolsUsed: string[];
  executionTimeMs: number;
  sessionId?: string; // Add session ID to response
}

// Memory-enabled chat input
export interface ChatInput {
  userQuery: string;
  sessionId?: string; // Optional - if not provided, new session is created
  similarEmbeddingContext: string;
}
