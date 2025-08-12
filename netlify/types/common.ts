/**
 * Common types used throughout the netlify application
 */

export interface BaseRequest {
  id?: string;
  timestamp?: Date;
}

export interface BaseResponse {
  success: boolean;
  message?: string;
  timestamp: number;
}

export type Status = "pending" | "processing" | "completed" | "error";

export interface ErrorResponse {
  error: string;
  code?: string;
  details?: Record<string, unknown>;
}
