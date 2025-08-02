import { generateAnswerWithMemory } from "../netlify/services/chat/chat-with-memory";
import { ChatStatus } from "../netlify/services/chat/types";
import { generateContext } from "../netlify/services/embedding";
import { ChatMessage, getChatSession } from "../netlify/services/memory";

/**
 * Example usage of memory-enabled chat service
 * This shows how to integrate chat history with the existing pipeline
 */

// Example 1: Start a new conversation
export async function startNewConversation(userQuery: string) {
  // Generate context from embeddings (existing functionality)
  const context = await generateContext({
    query: userQuery,
    top_k: 5,
  });

  // Generate AI response with memory (new functionality)
  const response = await generateAnswerWithMemory({
    userQuery,
    similarEmbeddingContext: context,
    // sessionId is optional - if not provided, a new session is created
  });

  console.log("New conversation started with session:", response.sessionId);
  console.log("Response:", response.response);

  return response;
}

// Example 2: Continue existing conversation
export async function continueConversation(
  sessionId: string,
  userQuery: string
) {
  // Generate context from embeddings
  const context = await generateContext({
    query: userQuery,
    top_k: 5,
  });

  // Continue conversation with existing session
  const response = await generateAnswerWithMemory({
    userQuery,
    sessionId, // Provide existing session ID
    similarEmbeddingContext: context,
  });

  console.log("Continued conversation in session:", response.sessionId);
  console.log("Response:", response.response);

  return response;
}

// Example 3: Get conversation history
export async function getConversationHistory(sessionId: string) {
  const sessionWithMessages = await getChatSession(sessionId);

  if (!sessionWithMessages) {
    console.log("Session not found");
    return null;
  }

  console.log("Session title:", sessionWithMessages.title);
  console.log("Messages:");
  sessionWithMessages.messages.forEach((msg: ChatMessage, index: number) => {
    console.log(`${index + 1}. [${msg.role}] ${msg.content}`);
  });

  return sessionWithMessages;
}

// Example 4: Chat with status updates and memory
export async function chatWithStatusAndMemory(
  userQuery: string,
  sessionId?: string
) {
  const context = await generateContext({ query: userQuery });

  const response = await generateAnswerWithMemory(
    {
      userQuery,
      sessionId,
      similarEmbeddingContext: context,
    },
    (status: ChatStatus) => {
      console.log(`[Step ${status.step}] ${status.description}`);
      console.log(`Status: ${status.status} at ${new Date(status.timestamp)}`);
    }
  );

  console.log("Memory-enabled chat completed:");
  console.log("- Session ID:", response.sessionId);
  console.log("- Success:", response.success);
  console.log("- Execution time:", response.executionTimeMs + "ms");
  console.log("- Tools used:", response.toolsUsed);

  return response;
}
