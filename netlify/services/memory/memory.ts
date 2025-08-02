import { desc, eq } from "drizzle-orm";
import { chatMessages, chatSessions } from "../../../db/schema";
import { getDrizzleClient } from "../../clients/database";
import {
  ChatMessage,
  ChatSession,
  ChatSessionWithMessages,
  CreateChatMessageInput,
  CreateChatSessionInput,
} from "./types";

/**
 * Memory service for chat history management
 * Provides basic CRUD operations for chat sessions and messages
 */

/**
 * Create a new chat session
 */
export async function createChatSession(
  input: CreateChatSessionInput
): Promise<ChatSession> {
  const db = getDrizzleClient();

  const [session] = await db
    .insert(chatSessions)
    .values({
      session_id: input.session_id,
      title: input.title,
    })
    .returning();

  return session;
}

/**
 * Save a chat message to an existing session
 */
export async function saveChatMessage(
  input: CreateChatMessageInput
): Promise<ChatMessage> {
  const db = getDrizzleClient();

  const [message] = await db
    .insert(chatMessages)
    .values({
      session_id: input.session_id,
      role: input.role,
      content: input.content,
    })
    .returning();

  return message;
}

/**
 * Get a chat session with all its messages
 */
export async function getChatSession(
  sessionId: string
): Promise<ChatSessionWithMessages | null> {
  const db = getDrizzleClient();

  // Get session
  const [session] = await db
    .select()
    .from(chatSessions)
    .where(eq(chatSessions.session_id, sessionId))
    .limit(1);

  if (!session) {
    return null;
  }

  // Get messages for the session
  const messages = await db
    .select()
    .from(chatMessages)
    .where(eq(chatMessages.session_id, sessionId))
    .orderBy(chatMessages.created_at);

  return {
    ...session,
    messages,
  };
}

/**
 * Get recent messages from a session for context
 * Used to provide conversation history to the AI
 */
export async function getRecentMessages(
  sessionId: string,
  limit: number = 10
): Promise<ChatMessage[]> {
  const db = getDrizzleClient();

  const messages = await db
    .select()
    .from(chatMessages)
    .where(eq(chatMessages.session_id, sessionId))
    .orderBy(desc(chatMessages.created_at))
    .limit(limit);

  // Return in chronological order (oldest first)
  return messages.reverse();
}

/**
 * Update session title (usually after first message)
 */
export async function updateSessionTitle(
  sessionId: string,
  title: string
): Promise<void> {
  const db = getDrizzleClient();

  await db
    .update(chatSessions)
    .set({
      title,
      updated_at: new Date(),
    })
    .where(eq(chatSessions.session_id, sessionId));
}
