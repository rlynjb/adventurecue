/**
 * API request/response types for Netlify functions
 */

import { QueryRequest } from "./services";

// Function request body types
export interface RequestBody {
  query?: unknown;
  top_k?: unknown;
  sessionId?: unknown;
  streaming?: unknown;
}

export interface IngestRequestBody {
  text?: unknown;
}

// Validation result types
export interface ValidateRequest {
  isValid: boolean;
  error?: string;
  data?: QueryRequest;
}

export interface IngestValidateRequest {
  isValid: boolean;
  error?: string;
  data?: { text: string };
}
