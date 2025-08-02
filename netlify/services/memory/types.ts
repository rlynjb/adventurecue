// Basic types for the chat memory system

export type ChatRole = "user" | "assistant" | "system";

export interface ChatSession {
  id: number;
  session_id: string;
  title?: string;
  created_at: Date;
  updated_at: Date;
}

export interface ChatMessage {
  id: number;
  session_id: string;
  role: ChatRole;
  content: string;
  created_at: Date;
}

// Input types for creating new records
export interface CreateChatSessionInput {
  session_id: string;
  title?: string;
}

export interface CreateChatMessageInput {
  session_id: string;
  role: ChatRole;
  content: string;
}

// Types for API responses
export interface ChatSessionWithMessages extends ChatSession {
  messages: ChatMessage[];
}

export interface ChatHistoryResponse {
  sessions: ChatSession[];
  total: number;
}
