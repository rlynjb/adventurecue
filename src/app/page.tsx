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

  const RenderMessageType = (message: Message) => {
    if (message.role === "user") {
      return (
        <div key={message.id} className="aq-chatbot--message bg-blue-600 ml-28">
          <div className="aq-chatbot--message__label">You</div>
          {message.content}
        </div>
      );
    }

    if (message.role === "assistant") {
      return (
        <div key={message.id} className="aq-chatbot--message bg-gray-800 mr-28">
          <div className="aq-chatbot--message__label">Assistant</div>
          <MarkdownRenderer content={message.content} />

          {isLoading && (
            <div className="aq-chatbot--loading">
              <div className="animate-pulse">●</div>
              <div>Assistant is typing...</div>
            </div>
          )}
        </div>
      );
    }

    return <div>{message.content}</div>;
  };

  return (
    <div className="aq-chatbot">
      <header className="aq-chatbot--header">
        <h2 className="aq-chatbot--header-title">advntrQ</h2>
        {sessionId && (
          <div className="aq-chatbot--header-subtitle">
            Session: {sessionId.slice(0, 8)}
          </div>
        )}
      </header>

      <div className="aq-chatbot--messages">
        {messages.map((message) => RenderMessageType(message))}
      </div>

      {error && <div className="aq-chatbot--error">Error: {error}</div>}

      <div className="aq-chatbot--composer">
        <form onSubmit={handleSubmit} className="aq-chatbot--composer__form">
          <input
            className="aq-chatbot--composer__input"
            value={input}
            placeholder="Ask me anything..."
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="aq-chatbot--composer__submit"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
