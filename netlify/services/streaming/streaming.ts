import { CoreMessage } from "ai";
import { generateContext } from "../embedding";
import { TRAVEL_ASSISTANT_SYSTEM_PROMPT } from "../prompts";
import { generateWeather } from "../tools/weather";
import { handleChatMemory, streamTextResult } from "./utils";

/**
 *  @todo
 *  Implement comprehensive autonomous AI capabilities that enable AdventureCue to reason, plan, and execute complex multi-step tasks independently.

    Core Components
    - Autonomous Decision Making System
    -- Multi-step reasoning implementation
    -- Dynamic tool selection and orchestration
    -- Self-reflection and error correction
    -- Goal-oriented conversation management
    -- Advanced Agentic Behaviors

    - Proactive information gathering
    -- Multi-turn tool execution workflows
    -- Adaptive response strategies
    -- Context-aware planning and execution

    - Workflow Management
    -- State management for complex workflows
    -- Tool dependency resolution and execution ordering
    -- Response quality evaluation and iteration
    -- Error recovery and fallback strategies
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

    /**
     * @todo
     * look into a more scalable way to handle Prompts with Context
     * as this is repeated in multiple places
     * maybe create a helper function
     */
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

    /**
     * @todo
     * convert this into a switch statement for multiple tools
     * or check into a design pattern for scalability
     */
    // For weather queries, we need special handling to ensure text responses
    if (isWeatherQuery) {
      const resWeather = await generateWeather(
        data.query,
        currentSessionId,
        conversationHistory,
        systemPromptWithContext
      );

      return resWeather
        ? resWeather
        : new Response("Error generating weather response", { status: 500 });
    }

    /**
     * @todo
     * implement web search tool handling here as well
     */

    /**
     * @todo
     * implement foundation architecture MCP tool handling here as well
     */

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
