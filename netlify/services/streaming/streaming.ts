import { openai } from "@ai-sdk/openai";
import { CoreMessage, streamText, tool } from "ai";
import { z } from "zod";
import { generateContext } from "../embedding";
import { saveChatMessage } from "../memory";
import { TRAVEL_ASSISTANT_SYSTEM_PROMPT } from "../prompts";
import { fetchWeatherData, handleChatMemory } from "./utils";

/**
 * Enhanced tool definitions for AI SDK - using Zod schemas
 */
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

    // Stream with AI SDK Core
    /*console.log("🚀 Starting streamText with query:", data.query);
    console.log("🔧 Is weather query:", isWeatherQuery);
    console.log(
      "🛠️ Tools available:",
      isWeatherQuery ? Object.keys(tools) : "none"
    );*/

    // For weather queries, we need special handling to ensure text responses
    if (isWeatherQuery) {
      //console.log("🌤️ Weather query detected - using manual weather handling");

      // Execute weather tool first to get the data
      const weatherLocation = data.query.toLowerCase().includes("seattle")
        ? "Seattle"
        : "current location";

      try {
        /*console.log(
          "🌤️ Using centralized weather function for:",
          weatherLocation
        );*/
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

        // Generate response with weather data included
        const result = await streamText({
          model: openai("gpt-4-turbo"),
          messages: weatherMessages,
          temperature: 0.7,
          tools: undefined, // No tools needed since we already have the data
          onFinish: async (result) => {
            /*console.log("🏁 Weather stream finished");
            console.log("📊 Result summary:", {
              textLength: result.text?.length || 0,
              finishReason: result.finishReason,
            });*/

            // Save response to memory
            if (currentSessionId && result.text) {
              await saveChatMessage({
                session_id: currentSessionId,
                role: "assistant",
                content: result.text,
              });
              //console.log("💾 Saved weather response to memory");
            }
          },
        });

        //console.log("🔄 Creating weather stream response...");
        const streamResponse = result.toTextStreamResponse({
          headers: {
            "x-session-id": currentSessionId || "",
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
          },
        });

        //console.log("✅ Weather stream response created successfully");
        return streamResponse;
      } catch (error) {
        console.error("❌ Error in manual weather handling:", error);
        // Fall back to regular flow
      }
    }

    // For non-weather queries, use normal flow without tools
    const result = await streamText({
      model: openai("gpt-4-turbo"),
      messages,
      temperature: 0.7,
      tools: undefined, // No tools for non-weather queries
      onFinish: async (result) => {
        /*console.log("🏁 Stream finished", result);
        console.log("📊 Result summary:", {
          textLength: result.text?.length || 0,
          toolCallsCount: result.toolCalls?.length || 0,
          finishReason: result.finishReason,
        });*/

        // Handle tool calls if present
        /*if (result.toolCalls && result.toolCalls.length > 0) {
          console.log(
            "✅ Tool calls detected:",
            result.toolCalls.length,
            "calls"
          );
          console.log(
            "📋 Tool details:",
            JSON.stringify(result.toolCalls, null, 2)
          );
        } else {
          console.log("ℹ️ No tool calls made for this request");
        }*/

        // Save assistant response to memory
        if (currentSessionId && result.text) {
          await saveChatMessage({
            session_id: currentSessionId,
            role: "assistant",
            content: result.text,
          });
          /*console.log(
            "💾 Saved response to memory for session:",
            currentSessionId
          );*/
        }

        // Handle tool-only responses (weather queries that don't generate text)
        /*if (
          result.toolCalls &&
          result.toolCalls.length > 0 &&
          (!result.text || result.text.length === 0)
        ) {
          console.log(
            "🔧 Tool-only response detected - this needs follow-up handling"
          );
        }*/
      },
    });

    //console.log("🔄 Creating stream response...", result);

    // Return AI SDK UI compatible stream
    const streamResponse = result.toTextStreamResponse({
      headers: {
        "x-session-id": currentSessionId || "",
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });

    //console.log("✅ Stream response created successfully", streamResponse);
    return streamResponse;
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
