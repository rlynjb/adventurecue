/* eslint-disable @typescript-eslint/no-explicit-any */

import { getOpenAIClient } from "../clients";
import { ChatResponse, ChatStatus } from "../types/chat";
import { EmbeddingRow } from "../types/embedding";
import { ChatStatusMessages, ChatStatusTracker } from "./chat-status-tracking";

const openai = getOpenAIClient();

/**
 * Makes an OpenAI API call with the given parameters
 */
const callOpenAI = async (
  input: any[],
  tools: any[],
  store = false
): Promise<any> => {
  return await openai.responses.create({
    model: "gpt-4.1",
    input,
    tools,
    ...(store && { store: true }),
  });
};

/**
 * Executes different tool types using a simple switch statement
 */
const executeToolCall = async (
  toolCall: any,
  context: { query: string; contextText: string },
  statusTracker: ChatStatusTracker
): Promise<any> => {
  const toolType = toolCall.type || "unknown";

  // Update status: Starting tool execution
  statusTracker.executing(3, ChatStatusMessages.EXECUTING_TOOL(toolType), {
    toolType,
  });

  console.log(`Executing tool: ${toolCall.type}`);

  try {
    switch (toolCall.type) {
      case "web_search_call":
        console.log("Searching web.....", { query: context.query });
        statusTracker.executing(3, ChatStatusMessages.WEB_SEARCH_START);

        // Custom web search logic can go here
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate web search delay

        statusTracker.completed(3, ChatStatusMessages.WEB_SEARCH_COMPLETE);
        return toolCall;

      case "custom_api_call":
        console.log("Calling custom API.....", {
          toolCall: toolCall.type,
          query: context.query,
        });
        statusTracker.executing(3, ChatStatusMessages.API_CALL_START);

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500));

        statusTracker.completed(3, ChatStatusMessages.API_CALL_COMPLETE);
        return {
          ...toolCall,
          result: `Custom API result for: ${context.query}`,
          timestamp: Date.now(),
        };

      case "database_lookup":
        console.log("Looking up database.....", { query: context.query });
        statusTracker.executing(3, ChatStatusMessages.DB_LOOKUP_START);

        // Simulate database lookup
        await new Promise((resolve) => setTimeout(resolve, 300));

        statusTracker.completed(3, ChatStatusMessages.DB_LOOKUP_COMPLETE);
        return {
          ...toolCall,
          result: `Database result for: ${context.query}`,
          found: true,
        };

      default:
        console.log(
          `Unknown tool type: ${toolCall.type}, using default behavior`
        );
        statusTracker.completed(3, `Using default behavior for ${toolType}`);
        return toolCall;
    }
  } catch (error) {
    statusTracker.failed(
      3,
      ChatStatusMessages.TOOL_FAILED(toolType, String(error)),
      { error }
    );
    throw error;
  }
};

/**
 * Formats context text from database results
 *
 * @desc Builds a context prompt from the provided embedding rows.
 * @param rows The rows of embedding data to build context from
 * @returns A string representing the context prompt
 */
export const buildContextPrompt = (rows: EmbeddingRow[]): string => {
  return rows.map((row, i) => `Context ${i + 1}:\n${row.content}`).join("\n\n");
};

/**
 * Handles OpenAI chat completion with status tracking
 *
 * Generates an answer to the user's query using OpenAI's chat completion
 * @desc Uses the provided context to generate a response to the user's query with real-time status updates.
 * @param query The user's question
 * @param contextText The context text built from similar embeddings
 * @param onStatusUpdate Optional callback to receive status updates
 * @returns A promise that resolves to a ChatResponse with answer and execution details
 */
export const generateAnswer = async (
  query: string,
  contextText: string,
  onStatusUpdate?: (status: ChatStatus) => void
): Promise<ChatResponse> => {
  const startTime = Date.now();
  const statusTracker = new ChatStatusTracker(onStatusUpdate);
  const toolsUsed: string[] = [];

  try {
    /**
     * Step 1: Call model with user query, context from vector DB, and tools.
     */
    statusTracker.executing(1, ChatStatusMessages.ANALYZING_QUERY);

    const input: any[] = [
      {
        role: "system",
        content: `
          You're a helpful travel assistant. When recommending places, include the following in a JSON format:

          In intro property, respond with the conversational tone first.
          And then include all recommendations in places property.
          End with a friendly offer to help further in outro property.

          {
            "intro": "string",
            "places": [
              {
                "name": "string",
                "description": "string",
                "type": "e.g. Cultural, Nature, Food",
                "location": "approximate area in the city"
              }
            ],
            "outro": "string"
          }
        `,
      },
      { role: "user", content: query },
      { role: "assistant", content: contextText },
    ];

    const tools: any[] = [
      { type: "web_search_preview" },
      { type: "web_search_preview_2025_03_11" },
    ];

    statusTracker.completed(1, ChatStatusMessages.QUERY_PREPARED);
    statusTracker.executing(2, ChatStatusMessages.WAITING_OPENAI);

    const response = await callOpenAI(input, tools);

    statusTracker.completed(2, ChatStatusMessages.RECEIVED_RESPONSE);

    /**
     * Step 2: Model decides to call function(s) – model returns the name and input arguments.
     */
    console.log("tools LLM wants to call -----", response.output);

    /**
     * Step 3: Execute function code – parse the model's response and handle function calls.
     */
    const toolCall = response.output?.[0];
    if (toolCall?.type) {
      toolsUsed.push(toolCall.type);

      // Use switch-based tool execution with status updates
      const toolResult = await executeToolCall(
        toolCall,
        { query, contextText },
        statusTracker
      );

      /**
       * Step 4: Supply model with results – so it can incorporate them into its final response.
       */
      statusTracker.executing(4, ChatStatusMessages.SENDING_TOOL_RESULTS);
      input.push(toolResult);

      const followUpResponse = await callOpenAI(input, tools, true);
      statusTracker.completed(4, ChatStatusMessages.RECEIVED_FINAL);

      /**
       * Step 5: Model responds – incorporating the result in its output.
       */
      console.log("final response --- ", followUpResponse.output);
      statusTracker.completed(5, ChatStatusMessages.RESPONSE_COMPLETE);

      return {
        success: true,
        response: followUpResponse.output_text ?? "",
        steps: statusTracker.getSteps(),
        toolsUsed,
        executionTimeMs: Date.now() - startTime,
      };
    }

    console.log("sufficient response ----", response.output);
    statusTracker.completed(2, ChatStatusMessages.RESPONSE_COMPLETE_NO_TOOLS);

    return {
      success: true,
      response: response.output_text ?? "",
      steps: statusTracker.getSteps(),
      toolsUsed,
      executionTimeMs: Date.now() - startTime,
    };
  } catch (error) {
    statusTracker.failed(-1, ChatStatusMessages.ERROR_OCCURRED(String(error)), {
      error,
    });
    return {
      success: false,
      response:
        "I apologize, but I encountered an error while processing your request.",
      steps: statusTracker.getSteps(),
      toolsUsed,
      executionTimeMs: Date.now() - startTime,
    };
  }
};

/**
 * Simplified wrapper for backward compatibility
 * @deprecated Use generateAnswer with status tracking instead
 */
export const generateSimpleAnswer = async (
  query: string,
  contextText: string
): Promise<string> => {
  const result = await generateAnswer(query, contextText);
  return result.response;
};
