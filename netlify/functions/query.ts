import { processQuery } from "../services/query";
import { validateRequest } from "../utils/validation";
import { ValidateRequest } from "./types";

/**
 * /query handler for processing user queries
 * @deprecated use /chat endpoint instead
 * This handler is deprecated and will be removed in future versions.
 * Use the new query handler with status tracking instead.
 */
const handler = async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  let body;
  try {
    body = await req.json();
  } catch (e) {
    console.error(e);
    return new Response("Invalid JSON payload", { status: 400 });
  }

  // Validate request
  const validation: ValidateRequest = validateRequest(body);
  if (!validation.isValid) {
    return new Response(validation.error, { status: 400 });
  }

  try {
    const answer = await processQuery(validation.data!);

    return new Response(JSON.stringify({ answer }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    console.error(err);
    return new Response("Internal Server Error", { status: 500 });
  }
};

export default handler;
