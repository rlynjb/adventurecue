import { processText } from "@netlify/services/ingestion";

/**
 * @NOTE
 * copy how query.ts is structured
 * - method validation
 * - JSON parsing
 * - request validation
 * - process ingestion
 * - return response
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

  if (typeof body.text !== "string") {
    return new Response("Invalid request body", { status: 400 });
  }
  try {
    const result = await processText(body.text);

    return new Response(JSON.stringify({ result }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    console.error(err);
    return new Response("Internal Server Error", { status: 500 });
  }
};

export default handler;
