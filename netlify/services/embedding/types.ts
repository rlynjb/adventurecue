export interface EmbeddingRow {
  id: string;
  content: string;
  distance: number;
}

export interface QueryRequest {
  query: string;
  top_k?: number;
}
