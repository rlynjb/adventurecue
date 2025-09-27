// Message types
export const MESSAGE_TYPES = {
  USER: "user",
  ASSISTANT: "assistant",
} as const;

// UI Configuration
export const UI_CONFIG = {
  SESSION_ID_PREVIEW_LENGTH: 8,
  PLACEHOLDER_TEXT: "Ask me anything...",
  SUBMIT_BUTTON_TEXT: "Send",
  TYPING_INDICATOR_TEXT: "Assistant is typing...",
  ERROR_PREFIX: "Error: ",
  LOADING_INDICATOR: "●",
} as const;

// Labels
export const MESSAGE_LABELS = {
  USER: "You",
  ASSISTANT: "Assistant",
} as const;

// App Configuration
export const APP_CONFIG = {
  TITLE: "advntrQ",
} as const;

// Type exports for better type safety
export type MessageType = (typeof MESSAGE_TYPES)[keyof typeof MESSAGE_TYPES];
