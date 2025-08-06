import { RequestBody, ValidateRequest } from "../shared/types";

/**
 * Handles input validation for query requests
 *
 * Validates the request body to ensure it contains a valid query string and optional top_k parameter.
 * @returns An object containing the validation result and any extracted data
 */
export const validateRequest = (
  body: RequestBody | null | undefined
): ValidateRequest => {
  if (!body || typeof body !== "object") {
    return { isValid: false, error: "Invalid request body" };
  }

  const bodyObj = body as Record<string, unknown>;

  if (typeof bodyObj.query !== "string") {
    return { isValid: false, error: "`query` must be a string" };
  }

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
