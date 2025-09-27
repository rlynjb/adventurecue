"use client";

import { useState } from "react";
import { streamChat, type Message } from "../utils";

export const useChatbot = () => {
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

  return {
    input,
    setInput,
    sessionId,
    messages,
    isLoading,
    error,
    handleSubmit,
  };
};
