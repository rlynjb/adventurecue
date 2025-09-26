"use client";

import { useState } from "react";
import { MarkdownRenderer } from "../components/MarkdownRenderer";
import { streamChat, type Message } from "../utils";
import "./styles.css";

export default function Home() {
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (input.trim() && !isLoading) {
      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: input.trim(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      setIsLoading(true);
      setError(null);

      // Create assistant message placeholder
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "",
      };
      setMessages((prev) => [...prev, assistantMessage]);

      // Use the composable API utility
      const newSessionId = await streamChat(
        {
          query: userMessage.content,
          sessionId: sessionId || undefined,
          streaming: true,
        },
        // onChunk - handle streaming content
        (chunk: string) => {
          setMessages((prev) => {
            const newMessages = [...prev];
            const lastMessage = newMessages[newMessages.length - 1];
            if (lastMessage.role === "assistant") {
              lastMessage.content += chunk;
            }
            return newMessages;
          });
        },
        // onComplete - handle completion
        () => {
          setIsLoading(false);
        },
        // onError - handle errors
        (errorMessage: string) => {
          setError(errorMessage);
          setIsLoading(false);
          // Remove the empty assistant message on error
          setMessages((prev) => prev.slice(0, -1));
        }
      );

      // Update session ID if we got a new one
      if (newSessionId && !sessionId) {
        setSessionId(newSessionId);
      }
    }
  };

  return (
    <div className="aq-chatbot flex flex-col h-screen max-w-2xl mx-auto">
      <header className="p-4 flex-shrink-0">
        <h2 className="text-2xl font-semibold text-slate-500">
          advntrQ Chatbot
        </h2>
        {sessionId && (
          <div className="text-xs text-gray-500 mt-1">
            Session: {sessionId.slice(0, 8)}...
          </div>
        )}
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
            {message.role === "assistant" ? (
              <MarkdownRenderer content={message.content} />
            ) : (
              <div>{message.content}</div>
            )}
          </div>
        ))}

        {/* Loading indicator - Shows streaming in real-time */}
        {isLoading && (
          <div className="p-4 bg-gray-800 text-white mr-8 rounded">
            <div className="flex items-center space-x-2">
              <div className="animate-pulse">●</div>
              <div>Assistant is typing...</div>
            </div>
          </div>
        )}
      </div>

      {/* Error handling */}
      {error && (
        <div className="mx-4 mb-2 p-3 bg-red-600 text-white rounded flex-shrink-0">
          Error: {error}
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
