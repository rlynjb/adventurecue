//import { generateAnswer } from "../../services/chat";
//import { generateContext } from "../../services/embedding";
import { handleStreamingRequest } from "../../services/streaming";
import {
  //ChatStatus,
  //NonStreamingResponse,
  RequestBody,
  ValidateRequest,
} from "../../types";
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
    if (body.streaming) {
      return handleStreamingRequest(validation.data!);
    }

    /*
    const result: NonStreamingResponse = await processQueryWithStatus(
      validation.data!
    );

    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" },
    });
    */
  } catch (err: unknown) {
    console.error(err);
    return new Response("Internal Server Error", { status: 500 });
  }
};
/*
async function processQueryWithStatus(data: {
  query: string;
  sessionId?: string;
}): Promise<NonStreamingResponse> {
  const statusUpdates: ChatStatus[] = [];

  const onStatusUpdate = (status: ChatStatus) => {
    console.log(`[${status.step}] ${status.description} - ${status.status}`);
    statusUpdates.push(status);
  };

  const contextText = await generateContext(data);

  const result = await generateAnswer(
    data.query,
    contextText,
    onStatusUpdate,
    data.sessionId
  );

  return {
    ...result,
    steps: [...statusUpdates, ...result.steps],
  };
}
*/
export default handler;
