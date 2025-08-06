import { IngestRequestBody, IngestValidateRequest } from "../shared/types";

/**
 * Handles input validation for ingest requests
 *
 * Validates the request body to ensure it contains valid text content.
 * @returns An object containing the validation result and any extracted data
 */
export const validateRequest = (
  body: IngestRequestBody | null | undefined
): IngestValidateRequest => {
  if (!body || typeof body !== "object") {
    return { isValid: false, error: "Invalid request body" };
  }

  const bodyObj = body as Record<string, unknown>;

  if (typeof bodyObj.text !== "string") {
    return { isValid: false, error: "`text` must be a string" };
  }

  return {
    isValid: true,
    data: {
      text: bodyObj.text,
    },
  };
};
