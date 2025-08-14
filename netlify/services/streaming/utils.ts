import {
  createChatSession,
  generateSessionId,
  generateSessionTitle,
  getRecentMessages,
  saveChatMessage,
} from "../memory";

/**
 * Handle memory functionality and return conversation history
 * @todo
 * add limit to what amount can be saved in memory/db
 * delete in certain date. ex, within 7 days, session and its history will be deleted
 */
export async function handleChatMemory(data: {
  query: string;
  sessionId?: string;
}): Promise<{
  sessionId: string;
  conversationHistory: { role: "user" | "assistant"; content: string }[];
}> {
  let currentSessionId = data.sessionId;

  // Create session if none provided
  if (!currentSessionId) {
    currentSessionId = generateSessionId();
    const title = generateSessionTitle(data.query);
    await createChatSession({
      session_id: currentSessionId,
      title,
    });
  }

  // Save user message
  await saveChatMessage({
    session_id: currentSessionId,
    role: "user",
    content: data.query,
  });

  // Get conversation history
  const conversationHistory = (
    await getRecentMessages(currentSessionId, 8)
  ).map((msg) => ({
    role: msg.role as "user" | "assistant",
    content: msg.content,
  }));

  /*
  console.log("Session ID:", currentSessionId);
  console.log(
    "Conversation History:",
    conversationHistory.length,
    "messages"
  );
  console.log("History preview:", conversationHistory.slice(-2)); // Last 2 messages
  */

  return { sessionId: currentSessionId, conversationHistory };
}
