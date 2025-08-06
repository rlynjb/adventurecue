// Status tracking interfaces
export interface ChatStatus {
  step: number;
  description: string;
  status: "pending" | "executing" | "completed" | "failed";
  timestamp: number;
  data?: unknown;
}

export interface NonStreamingResponse {
  success: boolean;
  response: string;
  steps: ChatStatus[];
  toolsUsed: string[];
  executionTimeMs: number;
  sessionId?: string;
}

// Memory-enabled chat input
export interface ChatInput {
  userQuery: string;
  sessionId?: string;
  similarEmbeddingContext: string;
}
