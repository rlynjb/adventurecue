import { openai } from "@ai-sdk/openai";
import { CoreMessage, streamText } from "ai";
import { generateContext } from "../embedding";
import { saveChatMessage } from "../memory";
import { TRAVEL_ASSISTANT_SYSTEM_PROMPT } from "../prompts";
import { fetchWeatherData, handleChatMemory } from "./utils";

/**
 * @note
 *
 * look into why AI SDK Core tool isnt working.
 * Go through docs and examples to ensure correct usage
 */

/**
 * Enhanced tool definitions for AI SDK - using Zod schemas
 */
/*
const tools = {
  weather: tool({
    description: "Get the weather in a location",
    inputSchema: z.object({
      location: z.string().describe("The location to get the weather for"),
    }),
    execute: async ({ location }) => {
      return await fetchWeatherData(location);
    },
  }),
};
*/

// Generate response with weather data included
const streamTextResult = async (
  message: CoreMessage[],
  currentSessionId: string
) => {
  const result = await streamText({
    model: openai("gpt-4-turbo"),
    messages: message,
    temperature: 0.7,
    tools: undefined,
    onFinish: async (result) => {
      if (currentSessionId && result.text) {
        await saveChatMessage({
          session_id: currentSessionId,
          role: "assistant",
          content: result.text,
        });
      }
    },
  });

  console.log(result);

  const streamResponse = await result.toTextStreamResponse({
    headers: {
      "x-session-id": currentSessionId || "",
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });

  console.log("🚀 Stream response ready", streamResponse);

  return streamResponse;
};

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
    // Build messages for AI SDK - include context in system message instead
    const systemPromptWithContext = `${TRAVEL_ASSISTANT_SYSTEM_PROMPT}

Additional context from knowledge base:
${contextText}`;

    const messages: CoreMessage[] = [
      { role: "system", content: systemPromptWithContext },
      ...conversationHistory,
      { role: "user", content: data.query },
    ];

    // Check if this is a weather-related query to conditionally provide tools
    const isWeatherQuery =
      data.query.toLowerCase().includes("weather") ||
      data.query.toLowerCase().includes("temperature") ||
      data.query.toLowerCase().includes("forecast") ||
      data.query.toLowerCase().includes("climate");

    // For weather queries, we need special handling to ensure text responses
    if (isWeatherQuery) {
      // Execute weather tool first to get the data
      const weatherLocation = data.query.toLowerCase().includes("seattle")
        ? "Seattle"
        : "current location";

      try {
        const weatherResult = await fetchWeatherData(weatherLocation);

        // Create a new prompt that includes the weather data and asks for a formatted response
        const weatherPromptWithData = `The user asked: "${data.query}"

I have retrieved the current weather data: ${JSON.stringify(
          weatherResult,
          null,
          2
        )}

Please provide a helpful travel assistant response following the TRAVEL_ASSISTANT_SYSTEM_PROMPT format. Include the weather information in the specified JSON markdown code block format as outlined in the system prompt.`;

        const weatherMessages: CoreMessage[] = [
          { role: "system", content: systemPromptWithContext },
          ...conversationHistory,
          { role: "user", content: weatherPromptWithData },
        ];

        return await streamTextResult(weatherMessages, currentSessionId);
      } catch (error) {
        console.error("❌ Error in manual weather handling:", error);
      }
    }

    // For non-weather queries, use normal flow without tools
    return await streamTextResult(messages, currentSessionId);
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
