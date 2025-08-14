import { openai } from "@ai-sdk/openai";
import { CoreMessage, streamText } from "ai";
import { generateContext } from "../embedding";
import {
  createChatSession,
  generateSessionId,
  generateSessionTitle,
  getRecentMessages,
  saveChatMessage,
} from "../memory";
import { TRAVEL_ASSISTANT_SYSTEM_PROMPT } from "../prompts";

/**
 * Handle memory functionality and return conversation history
 * @todo
 * add limit to what amount can be saved in memory/db
 * delete in certain date. ex, within 7 days, session and its history will be deleted
 */
async function handleChatMemory(data: {
  query: string;
  sessionId?: string;
}): Promise<{
  sessionId: string;
  conversationHistory: { role: "user" | "assistant"; content: string }[];
}> {
  let currentSessionId = data.sessionId;

  // Create session if none provided
  if (!currentSessionId) {
    currentSessionId = generateSessionId();
    const title = generateSessionTitle(data.query);
    await createChatSession({
      session_id: currentSessionId,
      title,
    });
  }

  // Save user message
  await saveChatMessage({
    session_id: currentSessionId,
    role: "user",
    content: data.query,
  });

  // Get conversation history
  const conversationHistory = (
    await getRecentMessages(currentSessionId, 8)
  ).map((msg) => ({
    role: msg.role as "user" | "assistant",
    content: msg.content,
  }));

  return { sessionId: currentSessionId, conversationHistory };
}

/**
 * Handle streaming responses using AI SDK Core with memory support
 * Returns AI SDK UI compatible streaming response
 */
export async function handleStreamingRequest(data: {
  query: string;
  sessionId?: string;
}): Promise<Response> {
  try {
    // Handle memory and get conversation history
    const { sessionId: currentSessionId, conversationHistory } =
      await handleChatMemory(data);

    console.log("Session ID:", currentSessionId);
    console.log(
      "Conversation History:",
      conversationHistory.length,
      "messages"
    );
    console.log("History preview:", conversationHistory.slice(-2)); // Last 2 messages

    // Get context and conversation history - same as chat.ts
    const contextText = await generateContext(data);

    // 3. GENERATION PHASE
    // Build messages for AI SDK
    const messages: CoreMessage[] = [
      { role: "system", content: TRAVEL_ASSISTANT_SYSTEM_PROMPT },
      ...conversationHistory,
      { role: "user", content: data.query },
      { role: "assistant", content: contextText },
    ];

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
      },
    });

    // Return AI SDK UI compatible stream
    return result.toTextStreamResponse({
      headers: {
        "x-session-id": currentSessionId || "",
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
