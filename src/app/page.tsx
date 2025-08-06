"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState } from "react";

export default function Home() {
  const [input, setInput] = useState("");
  const [sessionId] = useState<string>("");

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({
      api: "/.netlify/functions/chat",
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
            streaming: true,
          },
        };
      },
    }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage({ text: input });
      setInput("");
    }
  };

  const isLoading = status === "submitted" || status === "streaming";

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto">
      <header className="p-4 flex-shrink-0">
        <h2 className="text-2xl font-semibold text-slate-500">
          advntrQ Chatbot
        </h2>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`p-4 rounded ${
              message.role === "user"
                ? "bg-blue-600 text-white ml-8"
                : "bg-gray-800 text-white mr-8"
            }`}
          >
            <div className="font-semibold mb-2">
              {message.role === "user" ? "You" : "Assistant"}
            </div>
            <div>
              {message.parts.map((part, i) => {
                if (part.type === "text") {
                  return <span key={i}>{part.text}</span>;
                }
                return null;
              })}
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="p-4 bg-gray-800 text-white mr-8 rounded">
            <div>Sending...</div>
          </div>
        )}
      </div>

      {/* Error handling */}
      {error && (
        <div className="mx-4 mb-2 p-3 bg-red-600 text-white rounded flex-shrink-0">
          Error: {error.message}
        </div>
      )}

      {/* Input form - Sticky footer */}
      <div className="p-4 flex-shrink-0">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <input
            className="flex-1 p-3 border-2 border-gray-600 bg-gray-800 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400"
            value={input}
            placeholder="Ask me anything..."
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
