// Utility functions for chat memory management

/**
 * Generate a unique session ID
 * Uses timestamp + random string for simplicity
 * In production, consider using a proper UUID library
 */
export function generateSessionId(): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `chat_${timestamp}_${randomStr}`;
}

/**
 * Generate a session title from the first user message
 * Truncates to a reasonable length and removes line breaks
 */
export function generateSessionTitle(firstMessage: string): string {
  const maxLength = 50;
  const cleaned = firstMessage.replace(/\n/g, " ").replace(/\s+/g, " ").trim();

  if (cleaned.length <= maxLength) {
    return cleaned;
  }

  return cleaned.substring(0, maxLength - 3) + "...";
}

/**
 * Validate chat role
 */
export function isValidChatRole(
  role: string
): role is "user" | "assistant" | "system" {
  return ["user", "assistant", "system"].includes(role);
}
