import { openai } from "@ai-sdk/openai";
import { CoreMessage, streamText } from "ai";
import { generateContext } from "../embedding";
import { saveChatMessage } from "../memory";
import { TRAVEL_ASSISTANT_SYSTEM_PROMPT } from "../prompts";
import { handleChatMemory } from "./utils";

/**
 * Simple tool definitions for AI SDK
 */
/*
const tools = {
  web_search: {
    description: "Search the web for current information",
    parameters: {
      type: "object" as const,
      properties: {
        query: {
          type: "string" as const,
          description: "The search query to execute",
        },
      },
      required: ["query"],
    },
    execute: async ({ query }: { query: string }) => {
      // Simple mock implementation - replace with actual web search
      return {
        query,
        results: `Mock search results for: ${query}`,
        timestamp: new Date().toISOString(),
      };
    },
  },
};
*/

/**
 * Handle streaming responses using AI SDK Core with memory support
 * Returns AI SDK UI compatible streaming response
 */
export async function handleStreamingRequest(data: {
  query: string;
  sessionId?: string;
}): Promise<Response> {
  try {
    const { sessionId: currentSessionId, conversationHistory } =
      await handleChatMemory(data);

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
      //tools: tools,
      onFinish: async (result) => {
        // Handle tool calls if present
        /*
        if (result.toolCalls && result.toolCalls.length > 0) {
          console.log("Tool calls detected:", result.toolCalls);
          // Tool results would be handled in a follow-up call
          // For now, just log them
        }
        */

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
