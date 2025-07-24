export interface RAGQuery {
  query: string;
  top_k?: number;
}

export interface RAGIngest {
  text: string;
  source?: string; // Optional source file name
}

export interface RAGResponse {
  answer: string;
}

export interface RAGError {
  message: string;
  status?: number;
}
