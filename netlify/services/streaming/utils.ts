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

// Helper function to convert weather codes to descriptions
export function getWeatherDescription(code: number): string {
  const weatherCodes: Record<number, string> = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Foggy",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    71: "Slight snow",
    73: "Moderate snow",
    75: "Heavy snow",
    80: "Slight rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    95: "Thunderstorm",
    96: "Thunderstorm with slight hail",
    99: "Thunderstorm with heavy hail",
  };

  return weatherCodes[code] || "Unknown conditions";
}
