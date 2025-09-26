/**
 * Send a chat message and get streaming response
 */
export async function sendChatMessage(request: {
  query: string;
  sessionId?: string;
  streaming?: boolean;
}): Promise<{
  reader: ReadableStreamDefaultReader<Uint8Array>;
  sessionId?: string;
}> {
  const response = await fetch("/.netlify/functions/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("No response body");
  }

  const sessionId = response.headers.get("x-session-id") || undefined;

  return { reader, sessionId };
}

/**
 * Stream chat with callbacks
 */
export async function streamChat(
  request: { query: string; sessionId?: string; streaming?: boolean },
  onChunk: (chunk: string) => void,
  onComplete: () => void,
  onError: (error: string) => void
): Promise<string | null> {
  try {
    const { reader, sessionId } = await sendChatMessage(request);
    const decoder = new TextDecoder();

    while (true) {
      const { value, done } = await reader.read();

      if (done) break;

      if (value) {
        const chunk = decoder.decode(value);
        onChunk(chunk);
      }
    }

    onComplete();
    return sessionId || null;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    onError(message);
    return null;
  }
}
