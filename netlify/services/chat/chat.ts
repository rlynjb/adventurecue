/* eslint-disable @typescript-eslint/no-explicit-any */

import { ChatStatus, NonStreamingResponse } from "../../types";
import {
  createChatSession,
  generateSessionId,
  generateSessionTitle,
  getRecentMessages,
  saveChatMessage,
} from "../memory";
import { TRAVEL_ASSISTANT_SYSTEM_PROMPT } from "../prompts";
import { ChatStatusMessages, ChatStatusTracker } from "../status";
import { executeToolCall, openAITools } from "../tools";
import { callOpenAI } from "./helpers";

/**
 * Generates an answer to the user's query using OpenAI's model and tracks the status of each step.
 * It handles tool calls and provides detailed status updates throughout the process.
 *
 * Memory functionality:
 * - Pass undefined (default): No memory, stateless operation
 * - Pass empty string ""or null: Creates new session automatically
 * - Pass existing sessionId: Continues conversation in that session
 *
 * @param userQuery - The user's question or input
 * @param similarEmbeddingContext - Context from embedding search
 * @param onStatusUpdate - Optional callback for status updates
 * @param sessionId - Optional session ID for memory functionality
 * @returns NonStreamingResponse with optional sessionId for memory-enabled calls
 */
export const generateAnswer = async (
  userQuery: string,
  similarEmbeddingContext: string,
  onStatusUpdate?: (status: ChatStatus) => void,
  sessionId?: string // Optional: enables memory functionality
): Promise<NonStreamingResponse> => {
  const startTime = Date.now();
  const status = new ChatStatusTracker(onStatusUpdate);
  const tools: string[] = [];
  let currentSessionId = sessionId;

  try {
    status.executing(1, ChatStatusMessages.ANALYZING_QUERY);

    /**
     * @todo this can be extracted and moved to helpers.ts
     */
    // Memory functionality: Create session if sessionId provided but doesn't exist
    if (sessionId !== undefined) {
      // Create new session if none provided
      if (!currentSessionId) {
        currentSessionId = generateSessionId();
        const title = generateSessionTitle(userQuery);

        await createChatSession({
          session_id: currentSessionId,
          title,
        });

        status.completed(1, "Chat session created");
      }

      // Save user message to session
      await saveChatMessage({
        session_id: currentSessionId,
        role: "user",
        content: userQuery,
      });

      status.completed(1, "Chat history loaded");
    }

    // Build input with optional conversation history
    const conversationHistory = currentSessionId
      ? (await getRecentMessages(currentSessionId, 8)).map((msg) => ({
          role: msg.role,
          content: msg.content,
        }))
      : [];

    // up to here

    const input: any[] = [
      { role: "system", content: TRAVEL_ASSISTANT_SYSTEM_PROMPT },
      ...conversationHistory,
      { role: "user", content: userQuery },
      { role: "assistant", content: similarEmbeddingContext },
    ];

    status.completed(1, ChatStatusMessages.QUERY_PREPARED);
    status.executing(2, ChatStatusMessages.WAITING_OPENAI);

    const response = await callOpenAI(input, openAITools);

    status.completed(2, ChatStatusMessages.RECEIVED_RESPONSE);

    const toolCall = response.output?.[0];
    if (toolCall?.type) {
      /**
       * @todo extract tool execution logic to a separate function
       */
      tools.push(toolCall.type);

      const toolResult = await executeToolCall(
        toolCall,
        { query: userQuery, contextText: similarEmbeddingContext },
        status
      );

      status.executing(4, ChatStatusMessages.SENDING_TOOL_RESULTS);
      input.push(toolResult);
      // tools - up to here

      const followUpResponse = await callOpenAI(input, openAITools, true);
      status.completed(4, ChatStatusMessages.RECEIVED_FINAL);
      status.completed(5, ChatStatusMessages.RESPONSE_COMPLETE);

      const finalResponse = followUpResponse.output_text ?? "";

      /**
       * @todo maybe this as well
       */
      // Save assistant response to memory if session exists
      if (currentSessionId) {
        await saveChatMessage({
          session_id: currentSessionId,
          role: "assistant",
          content: finalResponse,
        });
      }
      // end here

      return {
        success: true,
        response: finalResponse,
        steps: status.getSteps(),
        toolsUsed: tools,
        executionTimeMs: Date.now() - startTime,
        sessionId: currentSessionId,
      };
    }

    status.completed(2, ChatStatusMessages.RESPONSE_COMPLETE_NO_TOOLS);

    const finalResponse = response.output_text ?? "";

    // Save assistant response to memory if session exists
    if (currentSessionId) {
      await saveChatMessage({
        session_id: currentSessionId,
        role: "assistant",
        content: finalResponse,
      });
    }

    return {
      success: true,
      response: finalResponse,
      steps: status.getSteps(),
      toolsUsed: tools,
      executionTimeMs: Date.now() - startTime,
      sessionId: currentSessionId,
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
      sessionId: currentSessionId,
    };
  }
};

/**
 * Memory-enabled wrapper that automatically creates a new session
 * Use this for conversations that should be remembered
 * @todo this as well
 */
export const generateAnswerWithMemory = async (
  userQuery: string,
  similarEmbeddingContext: string,
  onStatusUpdate?: (status: ChatStatus) => void,
  existingSessionId?: string
): Promise<NonStreamingResponse> => {
  // Pass empty string to enable memory, or use existing session
  const sessionId = existingSessionId || "";
  return generateAnswer(
    userQuery,
    similarEmbeddingContext,
    onStatusUpdate,
    sessionId
  );
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
