"use client";

import { MarkdownRenderer } from "../components/MarkdownRenderer";
import { useChatbot } from "../hooks/useChatbot";
import { type Message } from "../utils";
import "./styles.css";

export default function Home() {
  const {
    input,
    setInput,
    sessionId,
    messages,
    isLoading,
    error,
    handleSubmit,
  } = useChatbot();

  const RenderMessageItemByRole = (message: Message) => {
    if (message.role === "user") {
      return (
        <div key={message.id} className="aq-chatbot--message bg-blue-600 ml-12">
          <div className="aq-chatbot--message__label">You</div>
          {message.content}
        </div>
      );
    }

    if (message.role === "assistant") {
      return (
        <div key={message.id} className="aq-chatbot--message bg-gray-800 mr-12">
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
        {messages.map((message) => RenderMessageItemByRole(message))}
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
