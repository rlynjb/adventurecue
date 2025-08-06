import { QueryRequest } from "../services/query/types";

/**
 * Types for Netlify function request/response handling
 */

export interface RequestBody {
  query?: unknown;
  top_k?: unknown;
  sessionId?: unknown;
  streaming?: unknown;
}

export interface ValidateRequest {
  isValid: boolean;
  error?: string;
  data?: QueryRequest;
}
