/* eslint-disable @typescript-eslint/no-explicit-any */

import { getOpenAIClient } from "../clients";
import { ChatResponse, ChatStatus } from "../types/chat";
import { EmbeddingRow } from "../types/embedding";

const openai = getOpenAIClient();

/**
 * Creates a status update
 */
const createStatus = (
  step: number,
  description: string,
  status: ChatStatus["status"],
  data?: any
): ChatStatus => {
  return {
    step,
    description,
    status,
    timestamp: Date.now(),
    data,
  };
};

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
  onStatusUpdate?: (status: ChatStatus) => void
): Promise<any> => {
  const toolType = toolCall.type || "unknown";

  // Update status: Starting tool execution
  onStatusUpdate?.(
    createStatus(3, `Executing ${toolType}`, "executing", { toolType })
  );

  console.log(`Executing tool: ${toolCall.type}`);

  try {
    switch (toolCall.type) {
      case "web_search_call":
        console.log("Searching web.....", { query: context.query });
        onStatusUpdate?.(
          createStatus(
            3,
            "Searching the web for relevant information",
            "executing"
          )
        );
        // Custom web search logic can go here
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate web search delay
        onStatusUpdate?.(createStatus(3, "Web search completed", "completed"));
        return toolCall;

      case "custom_api_call":
        console.log("Calling custom API.....", {
          toolCall: toolCall.type,
          query: context.query,
        });
        onStatusUpdate?.(
          createStatus(
            3,
            "Calling external API for additional data",
            "executing"
          )
        );
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500));
        onStatusUpdate?.(
          createStatus(3, "API call completed successfully", "completed")
        );
        return {
          ...toolCall,
          result: `Custom API result for: ${context.query}`,
          timestamp: Date.now(),
        };

      case "database_lookup":
        console.log("Looking up database.....", { query: context.query });
        onStatusUpdate?.(
          createStatus(
            3,
            "Searching database for relevant records",
            "executing"
          )
        );
        // Simulate database lookup
        await new Promise((resolve) => setTimeout(resolve, 300));
        onStatusUpdate?.(
          createStatus(3, "Database lookup completed", "completed")
        );
        return {
          ...toolCall,
          result: `Database result for: ${context.query}`,
          found: true,
        };

      default:
        console.log(
          `Unknown tool type: ${toolCall.type}, using default behavior`
        );
        onStatusUpdate?.(
          createStatus(3, `Using default behavior for ${toolType}`, "completed")
        );
        return toolCall;
    }
  } catch (error) {
    onStatusUpdate?.(
      createStatus(3, `Tool execution failed: ${error}`, "failed", { error })
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
  const steps: ChatStatus[] = [];
  const toolsUsed: string[] = [];

  const updateStatus = (status: ChatStatus) => {
    steps.push(status);
    onStatusUpdate?.(status);
  };

  try {
    /**
     * Step 1: Call model with user query, context from vector DB, and tools.
     */
    updateStatus(
      createStatus(1, "Analyzing your query and preparing request", "executing")
    );

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

    updateStatus(
      createStatus(1, "Query prepared, calling OpenAI", "completed")
    );
    updateStatus(createStatus(2, "Waiting for OpenAI response", "executing"));

    const response = await callOpenAI(input, tools);

    updateStatus(
      createStatus(2, "Received initial response from OpenAI", "completed")
    );

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
        updateStatus
      );

      /**
       * Step 4: Supply model with results – so it can incorporate them into its final response.
       */
      updateStatus(
        createStatus(4, "Sending tool results back to OpenAI", "executing")
      );
      input.push(toolResult);

      const followUpResponse = await callOpenAI(input, tools, true);
      updateStatus(
        createStatus(4, "Received final response from OpenAI", "completed")
      );

      /**
       * Step 5: Model responds – incorporating the result in its output.
       */
      console.log("final response --- ", followUpResponse.output);
      updateStatus(
        createStatus(5, "Response generation completed", "completed")
      );

      return {
        success: true,
        response: followUpResponse.output_text ?? "",
        steps,
        toolsUsed,
        executionTimeMs: Date.now() - startTime,
      };
    }

    console.log("sufficient response ----", response.output);
    updateStatus(
      createStatus(
        2,
        "Response generation completed (no tools needed)",
        "completed"
      )
    );

    return {
      success: true,
      response: response.output_text ?? "",
      steps,
      toolsUsed,
      executionTimeMs: Date.now() - startTime,
    };
  } catch (error) {
    updateStatus(
      createStatus(-1, `Error occurred: ${error}`, "failed", { error })
    );
    return {
      success: false,
      response:
        "I apologize, but I encountered an error while processing your request.",
      steps,
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
