import { RequestBody, ValidateRequest } from "../shared/types";

/**
 * Handles input validation for chat requests
 *
 * Validates the request body to ensure it contains a valid query string and optional parameters.
 * @returns An object containing the validation result and any extracted data
 */
export const validateRequest = (
  body: RequestBody | null | undefined
): ValidateRequest => {
  if (!body || typeof body !== "object") {
    return { isValid: false, error: "Invalid request body" };
  }

  const bodyObj = body as RequestBody;

  // Query validation
  if (typeof bodyObj.query !== "string") {
    return { isValid: false, error: "`query` must be a string" };
  }

  if (bodyObj.query.trim().length === 0) {
    return { isValid: false, error: "`query` must be a non-empty string" };
  }

  /*
  // Optional: top_k validation
  if (bodyObj.top_k !== undefined && (typeof bodyObj.top_k !== "number" || bodyObj.top_k < 1)) {
    return { isValid: false, error: "`top_k` must be a positive number" };
  }

  // Optional: sessionId validation
  if (bodyObj.sessionId !== undefined && typeof bodyObj.sessionId !== "string") {
    return { isValid: false, error: "`sessionId` must be a string" };
  }

  // Optional: streaming validation
  if (bodyObj.streaming !== undefined && typeof bodyObj.streaming !== "boolean") {
    return { isValid: false, error: "`streaming` must be a boolean" };
  }
  */

  return {
    isValid: true,
    data: {
      query: bodyObj.query,
      top_k: typeof bodyObj.top_k === "number" ? bodyObj.top_k : 5,
      sessionId:
        typeof bodyObj.sessionId === "string" ? bodyObj.sessionId : undefined,
    },
  };
};
