/**
 * Central type exports for the netlify application
 * Import from here for better organization and discoverability
 */

// Re-export all types
export * from "./api";
export * from "./common";
export * from "./services";

// Organized exports for specific use cases
export type {
  // Common types
  BaseRequest,
  BaseResponse,
  ErrorResponse,
  Status,
} from "./common";

export type {
  IngestRequestBody,
  IngestValidateRequest,
  // API types
  RequestBody,
  ValidateRequest,
} from "./api";

export type {
  ChatInput,
  ChatStatus,
  NonStreamingResponse,
  // Service types
  QueryRequest,
} from "./services";
