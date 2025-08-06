/**
 * Types shared between services
 */

// Query and request types
export interface QueryRequest {
  query: string;
  top_k?: number;
  sessionId?: string;
}

// Chat status and response types
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

// Memory and session types
export interface ChatInput {
  userQuery: string;
  sessionId?: string;
  similarEmbeddingContext: string;
}

export interface EmbeddingRow {
  id: string;
  content: string;
  distance: number;
}

export interface FileData {
  filePath: string;
  relPath: string;
  content: string;
}

export interface EmbeddingData {
  content: string;
  embedding: number[];
  filePath: string;
}

export interface ProcessingResult {
  id: number;
  filePath: string;
  relPath: string;
  success: boolean;
  error?: string;
}

export interface IngestionConfig {
  targetDir: string;
  fileExtensions: string[];
  rateLimitMs: number;
  batchSize?: number;
}
