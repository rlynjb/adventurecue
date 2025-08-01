/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChatStatusMessages, ChatStatusTracker } from "./chat-status-tracking";

export const openAITools = [
  { type: "web_search_preview" },
  { type: "web_search_preview_2025_03_11" },
];

/**
 * Executes different tool types using a simple switch statement
 */
export const executeToolCall = async (
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
