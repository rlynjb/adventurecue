import { openai } from "@ai-sdk/openai";
import { CoreMessage, streamText, tool } from "ai";
import { z } from "zod";
import { generateContext } from "../embedding";
import { saveChatMessage } from "../memory";
import { TRAVEL_ASSISTANT_SYSTEM_PROMPT } from "../prompts";
import { handleChatMemory } from "./utils";

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
      console.log("🌤️ Weather tool executing for location:", location);

      try {
        // Use Open-Meteo API for real weather data
        const geocodingResponse = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
            location
          )}&count=1`
        );
        const geocodingData = await geocodingResponse.json();

        if (!geocodingData.results || geocodingData.results.length === 0) {
          return {
            location,
            error: "Location not found",
          };
        }

        const { latitude, longitude, name, country } = geocodingData.results[0];

        // Get current weather
        const weatherResponse = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`
        );
        const weatherData = await weatherResponse.json();

        const result = {
          location: `${name}, ${country}`,
          temperature: Math.round(weatherData.current.temperature_2m),
          humidity: weatherData.current.relative_humidity_2m,
          windSpeed: weatherData.current.wind_speed_10m,
          conditions: getWeatherDescription(weatherData.current.weather_code),
          timestamp: new Date().toISOString(),
        };

        console.log("✅ Weather data retrieved:", result);
        return result;
      } catch (error) {
        console.error("❌ Weather API error:", error);
        return {
          location,
          error: "Failed to fetch weather data",
          fallbackTemp: 72 + Math.floor(Math.random() * 21) - 10,
        };
      }
    },
  }),
};

// Helper function to convert weather codes to descriptions
function getWeatherDescription(code: number): string {
  const weatherCodes: Record<number, string> = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Foggy",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    71: "Slight snow",
    73: "Moderate snow",
    75: "Heavy snow",
    80: "Slight rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    95: "Thunderstorm",
    96: "Thunderstorm with slight hail",
    99: "Thunderstorm with heavy hail",
  };

  return weatherCodes[code] || "Unknown conditions";
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

    // Stream with AI SDK Core
    console.log("🚀 Starting streamText with query:", data.query);
    console.log("🛠️ Tools available:", Object.keys(tools));

    const result = await streamText({
      model: openai("gpt-4-turbo"),
      messages,
      temperature: 0.7,
      tools: tools,
      onFinish: async (result) => {
        console.log("🏁 Stream finished");
        console.log("📊 Result summary:", {
          textLength: result.text?.length || 0,
          toolCallsCount: result.toolCalls?.length || 0,
          finishReason: result.finishReason,
        });

        // Handle tool calls if present
        if (result.toolCalls && result.toolCalls.length > 0) {
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
        }

        // Save assistant response to memory
        if (currentSessionId && result.text) {
          await saveChatMessage({
            session_id: currentSessionId,
            role: "assistant",
            content: result.text,
          });
          console.log(
            "💾 Saved response to memory for session:",
            currentSessionId
          );
        }
      },
    });

    console.log("🔄 Creating stream response...");

    // Return AI SDK UI compatible stream
    const streamResponse = result.toTextStreamResponse({
      headers: {
        "x-session-id": currentSessionId || "",
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });

    console.log("✅ Stream response created successfully");
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
