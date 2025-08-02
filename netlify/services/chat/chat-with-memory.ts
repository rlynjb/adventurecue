/* eslint-disable @typescript-eslint/no-explicit-any */

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
import { ChatInput, ChatResponse, ChatStatus } from "./types";

/**
 * Memory-enabled chat function that saves conversation history
 * Generates an answer with session management and conversation context
 */
export const generateAnswerWithMemory = async (
  input: ChatInput,
  onStatusUpdate?: (status: ChatStatus) => void
): Promise<ChatResponse> => {
  const startTime = Date.now();
  const status = new ChatStatusTracker(onStatusUpdate);
  const tools: string[] = [];
  let sessionId = input.sessionId;

  try {
    status.executing(1, ChatStatusMessages.ANALYZING_QUERY);

    // Create new session if none provided
    if (!sessionId) {
      sessionId = generateSessionId();
      const title = generateSessionTitle(input.userQuery);

      await createChatSession({
        session_id: sessionId,
        title,
      });

      status.completed(1, "Chat session created");
    }

    // Save user message
    await saveChatMessage({
      session_id: sessionId,
      role: "user",
      content: input.userQuery,
    });

    // Get recent conversation history for context
    const recentMessages = await getRecentMessages(sessionId, 8); // Last 8 messages

    status.completed(1, "Chat history loaded");
    status.executing(2, ChatStatusMessages.QUERY_PREPARED);

    // Build conversation context with history
    const conversationHistory = recentMessages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    const inputMessages: any[] = [
      { role: "system", content: TRAVEL_ASSISTANT_SYSTEM_PROMPT },
      ...conversationHistory,
      { role: "assistant", content: input.similarEmbeddingContext },
    ];

    status.completed(2, ChatStatusMessages.QUERY_PREPARED);
    status.executing(3, ChatStatusMessages.WAITING_OPENAI);

    const response = await callOpenAI(inputMessages, openAITools);

    status.completed(3, ChatStatusMessages.RECEIVED_RESPONSE);

    let finalResponse = response.output_text ?? "";

    const toolCall = response.output?.[0];
    if (toolCall?.type) {
      tools.push(toolCall.type);

      const toolResult = await executeToolCall(
        toolCall,
        { query: input.userQuery, contextText: input.similarEmbeddingContext },
        status
      );

      status.executing(4, ChatStatusMessages.SENDING_TOOL_RESULTS);
      inputMessages.push(toolResult);

      const followUpResponse = await callOpenAI(
        inputMessages,
        openAITools,
        true
      );
      finalResponse = followUpResponse.output_text ?? "";

      status.completed(4, ChatStatusMessages.RECEIVED_FINAL);
    }

    // Save assistant response
    await saveChatMessage({
      session_id: sessionId,
      role: "assistant",
      content: finalResponse,
    });

    status.completed(5, ChatStatusMessages.RESPONSE_COMPLETE);

    return {
      success: true,
      response: finalResponse,
      steps: status.getSteps(),
      toolsUsed: tools,
      executionTimeMs: Date.now() - startTime,
      sessionId,
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
      sessionId,
    };
  }
};
