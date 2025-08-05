"use client";

import { ChatHeader } from "@/components/ChatHeader";
import { ChatInput } from "@/components/ChatInput";
import { Messages } from "@/components/Messages";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState } from "react";

/**
 * @note
 * go through this file and clean up any unnecessary comments or code
 * ensure the chat functionality is clear and concise
 * maintain the core functionality of sending messages and displaying responses
 * consider adding comments where necessary for clarity
 */

export default function Chat() {
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState<string>("");

  const { messages, sendMessage, status, error, stop } = useChat({
    id: sessionId || undefined,
    transport: new DefaultChatTransport({
      api: "/.netlify/functions/chat",
      // Transform AI SDK messages to your endpoint format
      prepareSendMessagesRequest: ({ messages }) => {
        const lastMessage = messages[messages.length - 1];
        const query = lastMessage.parts
          .filter((part) => part.type === "text")
          .map((part) => part.text)
          .join("");

        return {
          body: {
            query,
            sessionId: sessionId || undefined,
            top_k: 5,
          },
        };
      },
    }),
    onError: (error) => {
      console.error("Chat error:", error);
    },
  });

  return (
    <div className="flex flex-col w-full max-w-2xl py-24 mx-auto stretch">
      <ChatHeader sessionId={sessionId} status={status} />

      <Messages
        messages={messages}
        status={status}
        stop={stop}
        setInput={setInput}
      />

      {/* Error handling */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg">
          <div className="flex justify-between items-center">
            <span>Something went wrong. Please try again.</span>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="text-xs px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      <ChatInput
        input={input}
        setInput={setInput}
        onSubmit={() => sendMessage({ text: input })}
        status={status}
        messagesCount={messages.length}
        onNewChat={() => {
          setSessionId("");
          window.location.reload();
        }}
      />
    </div>
  );
}
