"use client";

import { ChatComposer } from "../components/ChatComposer";
import { ChatHeader } from "../components/ChatHeader";
import { ErrorDisplay } from "../components/ErrorDisplay";
import { MessageItem } from "../components/MessageItem";
import { useChatbot } from "../hooks/useChatbot";
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

  return (
    <div className="aq-chatbot">
      <ChatHeader sessionId={sessionId} />

      <div className="aq-chatbot--messages">
        {messages.map((message, index) => (
          <MessageItem
            key={message.id}
            message={message}
            isLoading={isLoading}
            isLastMessage={index === messages.length - 1}
          />
        ))}
      </div>

      <ErrorDisplay error={error} />

      <ChatComposer
        input={input}
        setInput={setInput}
        handleSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  );
}
