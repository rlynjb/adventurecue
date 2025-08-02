export interface QueryRequest {
  query: string;
  top_k?: number;
  sessionId?: string; // Optional session ID for memory-enabled conversations
}
