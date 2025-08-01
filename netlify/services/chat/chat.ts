/* eslint-disable @typescript-eslint/no-explicit-any */

import { TRAVEL_ASSISTANT_SYSTEM_PROMPT } from "../prompts";
import { ChatStatusMessages, ChatStatusTracker } from "../status";
import { executeToolCall, openAITools } from "../tools";
import { callOpenAI } from "./helpers";
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
  const status = new ChatStatusTracker(onStatusUpdate);
  const tools: string[] = [];

  try {
    status.executing(1, ChatStatusMessages.ANALYZING_QUERY);

    const input: any[] = [
      { role: "system", content: TRAVEL_ASSISTANT_SYSTEM_PROMPT },
      { role: "user", content: userQuery },
      { role: "assistant", content: similarEmbeddingContext },
    ];

    status.completed(1, ChatStatusMessages.QUERY_PREPARED);
    status.executing(2, ChatStatusMessages.WAITING_OPENAI);

    const response = await callOpenAI(input, openAITools);

    status.completed(2, ChatStatusMessages.RECEIVED_RESPONSE);

    const toolCall = response.output?.[0];
    if (toolCall?.type) {
      tools.push(toolCall.type);

      const toolResult = await executeToolCall(
        toolCall,
        { query: userQuery, contextText: similarEmbeddingContext },
        status
      );

      status.executing(4, ChatStatusMessages.SENDING_TOOL_RESULTS);
      input.push(toolResult);

      const followUpResponse = await callOpenAI(input, openAITools, true);
      status.completed(4, ChatStatusMessages.RECEIVED_FINAL);
      status.completed(5, ChatStatusMessages.RESPONSE_COMPLETE);

      return {
        success: true,
        response: followUpResponse.output_text ?? "",
        steps: status.getSteps(),
        toolsUsed: tools,
        executionTimeMs: Date.now() - startTime,
      };
    }

    status.completed(2, ChatStatusMessages.RESPONSE_COMPLETE_NO_TOOLS);

    return {
      success: true,
      response: response.output_text ?? "",
      steps: status.getSteps(),
      toolsUsed: tools,
      executionTimeMs: Date.now() - startTime,
    };
  } catch (error) {
    status.failed(-1, ChatStatusMessages.ERROR_OCCURRED(String(error)), {
      error,
    });
    return {
      success: false,
      response:
        "I apologize, but I encountered an error while processing your request.",
      steps: status.getSteps(),
      toolsUsed: tools,
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
