import { openai } from "@ai-sdk/openai";
import { CoreMessage, streamText } from "ai";
import { ChatStatus } from "../../types";
import { generateContext } from "../embedding";
import {
  createChatSession,
  generateSessionId,
  generateSessionTitle,
  getRecentMessages,
  saveChatMessage,
} from "../memory";
import { TRAVEL_ASSISTANT_SYSTEM_PROMPT } from "../prompts";
import { ChatStatusMessages, ChatStatusTracker } from "../status";

/**
 * Handle streaming responses using AI SDK Core with status tracking
 * Returns AI SDK UI compatible streaming response
 */
export async function handleStreamingRequest(
  data: {
    query: string;
    sessionId?: string;
  },
  onStatusUpdate?: (status: ChatStatus) => void
): Promise<Response> {
  const status = new ChatStatusTracker(onStatusUpdate);
  let currentSessionId = data.sessionId;

  try {
    status.executing(1, ChatStatusMessages.ANALYZING_QUERY);

    // Memory functionality - reusing logic from chat.ts
    if (data.sessionId !== undefined) {
      if (!currentSessionId) {
        currentSessionId = generateSessionId();
        const title = generateSessionTitle(data.query);
        await createChatSession({
          session_id: currentSessionId,
          title,
        });
        status.completed(1, "Chat session created");
      }

      await saveChatMessage({
        session_id: currentSessionId,
        role: "user",
        content: data.query,
      });

      status.completed(1, "Chat history loaded");
    }

    status.executing(2, "Generating context from embeddings");
    // Get context and conversation history - same as chat.ts
    const contextText = await generateContext(data);
    status.completed(2, "Context generated");

    const conversationHistory = currentSessionId
      ? (await getRecentMessages(currentSessionId, 8)).map((msg) => ({
          role: msg.role as "user" | "assistant",
          content: msg.content,
        }))
      : [];

    // Build messages for AI SDK
    const messages: CoreMessage[] = [
      {
        role: "system",
        content: TRAVEL_ASSISTANT_SYSTEM_PROMPT,
      },
      ...conversationHistory,
      {
        role: "user",
        content: data.query,
      },
      {
        role: "assistant",
        content: contextText,
      },
    ];

    status.executing(3, ChatStatusMessages.WAITING_OPENAI);
    // Stream with AI SDK Core
    const result = await streamText({
      model: openai("gpt-4-turbo"),
      messages,
      temperature: 0.7,
      onFinish: async (result) => {
        // Save assistant response to memory
        if (currentSessionId && result.text) {
          await saveChatMessage({
            session_id: currentSessionId,
            role: "assistant",
            content: result.text,
          });
        }
        status.completed(3, ChatStatusMessages.RESPONSE_COMPLETE);
      },
    });

    status.completed(3, "Streaming started");

    // Return AI SDK UI compatible stream
    return result.toTextStreamResponse({
      headers: {
        "x-session-id": currentSessionId || "",
        "x-status-steps": JSON.stringify(status.getSteps()),
      },
    });
  } catch (error) {
    status.failed(-1, ChatStatusMessages.ERROR_OCCURRED(String(error)), {
      error,
    });
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
        steps: status.getSteps(),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
