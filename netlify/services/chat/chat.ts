/* eslint-disable @typescript-eslint/no-explicit-any */

import { TRAVEL_ASSISTANT_SYSTEM_PROMPT } from "../prompts";
import { ChatStatusMessages, ChatStatusTracker } from "../status";
import { callOpenAI } from "./helpers";
import { executeToolCall, openAITools } from "./tools";
import { ChatResponse, ChatStatus } from "./types";

/**
 * Generates an answer to the user's query using OpenAI's model and tracks the status of each step.
 * It handles tool calls and provides detailed status updates throughout the process.
 */
export const generateAnswer = async (
  userQuery: string,
  similarEmbeddingContext: string,
  onStatusUpdate?: (status: ChatStatus) => void
): Promise<ChatResponse> => {
  const startTime = Date.now();
  const statusTracker = new ChatStatusTracker(onStatusUpdate);
  const toolsUsed: string[] = [];

  try {
    statusTracker.executing(1, ChatStatusMessages.ANALYZING_QUERY);

    const input: any[] = [
      { role: "system", content: TRAVEL_ASSISTANT_SYSTEM_PROMPT },
      { role: "user", content: userQuery },
      { role: "assistant", content: similarEmbeddingContext },
    ];

    statusTracker.completed(1, ChatStatusMessages.QUERY_PREPARED);
    statusTracker.executing(2, ChatStatusMessages.WAITING_OPENAI);

    const response = await callOpenAI(input, openAITools);

    statusTracker.completed(2, ChatStatusMessages.RECEIVED_RESPONSE);

    const toolCall = response.output?.[0];
    if (toolCall?.type) {
      toolsUsed.push(toolCall.type);

      // Use switch-based tool execution with status updates
      const toolResult = await executeToolCall(
        toolCall,
        { query: userQuery, contextText: similarEmbeddingContext },
        statusTracker
      );

      statusTracker.executing(4, ChatStatusMessages.SENDING_TOOL_RESULTS);
      input.push(toolResult);

      const followUpResponse = await callOpenAI(input, openAITools, true);
      statusTracker.completed(4, ChatStatusMessages.RECEIVED_FINAL);
      statusTracker.completed(5, ChatStatusMessages.RESPONSE_COMPLETE);

      return {
        success: true,
        response: followUpResponse.output_text ?? "",
        steps: statusTracker.getSteps(),
        toolsUsed,
        executionTimeMs: Date.now() - startTime,
      };
    }

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
  userQuery: string,
  similarEnbeddingContext: string
): Promise<string> => {
  const result = await generateAnswer(userQuery, similarEnbeddingContext);
  return result.response;
};
