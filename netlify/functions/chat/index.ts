import { handleStreamingRequest } from "../../services/streaming";
import { RequestBody, ValidateRequest } from "../../types";
import { validateRequest } from "./validation";

const handler = async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  let body: RequestBody;
  try {
    body = await req.json();
  } catch (e) {
    console.error(e);
    return new Response("Invalid JSON payload", { status: 400 });
  }

  const validation: ValidateRequest = validateRequest(body);
  if (!validation.isValid) {
    return new Response(validation.error, { status: 400 });
  }

  try {
    // Make streaming mandatory
    if (body.streaming) {
      return handleStreamingRequest(validation.data!);
    } else {
      return new Response("Missing Required Parameter", { status: 400 });
    }
  } catch (err: unknown) {
    console.error(err);
    return new Response("Internal Server Error", { status: 500 });
  }
};

export default handler;
