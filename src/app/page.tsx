"use client";

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
      {/* Chat Header */}
      <div className="mb-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <h1 className="text-xl font-bold">AdventureCue AI Assistant</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Session: {sessionId || "New conversation"}
        </p>
        {status !== "ready" && (
          <p className="text-sm text-blue-600 dark:text-blue-400">
            Status: {status}
          </p>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-4 min-h-[400px] max-h-[600px]">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`p-4 rounded-lg ${
              message.role === "user"
                ? "bg-blue-100 dark:bg-blue-900 ml-8"
                : "bg-gray-100 dark:bg-gray-800 mr-8"
            }`}
          >
            <div className="font-semibold mb-2">
              {message.role === "user" ? "You" : "AI Assistant"}
            </div>
            <div className="whitespace-pre-wrap">
              {message.parts.map((part, i) => {
                switch (part.type) {
                  case "text":
                    return (
                      <div key={`${message.id}-${i}`} className="text-sm">
                        {part.text}
                      </div>
                    );
                  default:
                    return null;
                }
              })}
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {(status === "submitted" || status === "streaming") && (
          <div className="p-4 bg-gray-100 dark:bg-gray-800 mr-8 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {status === "submitted" ? "Thinking..." : "Typing..."}
              </span>
              <button
                type="button"
                onClick={() => stop()}
                className="text-xs px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Stop
              </button>
            </div>
          </div>
        )}

        {/* Empty state */}
        {messages.length === 0 && status === "ready" && (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            <h2 className="text-lg font-semibold mb-2">
              Welcome to AdventureCue!
            </h2>
            <p className="mb-4">
              Ask me about travel destinations, activities, or planning advice.
            </p>
            <div className="grid grid-cols-1 gap-2 max-w-md mx-auto text-sm">
              <button
                onClick={() =>
                  setInput("What are the best attractions in Paris?")
                }
                className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-100 dark:hover:bg-blue-900/40"
              >
                What are the best attractions in Paris?
              </button>
              <button
                onClick={() => setInput("Plan a 3-day itinerary for Tokyo")}
                className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-100 dark:hover:bg-blue-900/40"
              >
                Plan a 3-day itinerary for Tokyo
              </button>
              <button
                onClick={() => setInput("Best hiking trails in national parks")}
                className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-100 dark:hover:bg-blue-900/40"
              >
                Best hiking trails in national parks
              </button>
            </div>
          </div>
        )}
      </div>

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

      {/* Input form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (input.trim()) {
            sendMessage({ text: input });
            setInput("");
          }
        }}
        className="flex space-x-2"
      >
        <input
          className="flex-1 p-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={input}
          placeholder="Ask about travel destinations, activities, or planning advice..."
          onChange={(e) => setInput(e.currentTarget.value)}
          disabled={status !== "ready"}
        />
        <button
          type="submit"
          disabled={status !== "ready" || !input.trim()}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </form>

      {/* Chat controls */}
      <div className="mt-4 flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
        <div className="flex space-x-4">
          <button
            onClick={() => {
              setSessionId("");
              window.location.reload();
            }}
            className="hover:text-blue-600 dark:hover:text-blue-400"
          >
            New Chat
          </button>
        </div>
        <div>
          {messages.length > 0 && <span>{messages.length} messages</span>}
        </div>
      </div>
    </div>
  );
}
