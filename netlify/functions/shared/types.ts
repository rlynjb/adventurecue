import { QueryRequest } from "../../services/query/types";

/**
 * Shared types for Netlify function request/response handling
 */

export interface RequestBody {
  query?: string;
  top_k?: number;
  sessionId?: string;
  streaming?: boolean;
}

export interface ValidateRequest {
  isValid: boolean;
  error?: string;
  data?: QueryRequest;
}

export interface IngestRequestBody {
  text?: string;
}

export interface IngestValidateRequest {
  isValid: boolean;
  error?: string;
  data?: { text: string };
}
