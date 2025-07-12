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