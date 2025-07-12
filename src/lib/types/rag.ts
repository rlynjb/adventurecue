export interface RAGQuery {
  query: string;
  top_k?: number;
}

export interface RAGResponse {
  answer: string;
}

export interface RAGError {
  message: string;
  status?: number;
}