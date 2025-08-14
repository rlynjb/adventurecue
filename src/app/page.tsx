"use client";

import { useState } from "react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

// Simple markdown renderer component
const MarkdownRenderer = ({ content }: { content: string }) => {
  const renderMarkdown = (text: string) => {
    return (
      text
        // Headers (h1-h6)
        .replace(
          /^### (.*$)/gim,
          '<h3 class="text-lg font-bold mt-4 mb-2">$1</h3>'
        )
        .replace(
          /^## (.*$)/gim,
          '<h2 class="text-xl font-bold mt-4 mb-2">$1</h2>'
        )
        .replace(
          /^# (.*$)/gim,
          '<h1 class="text-2xl font-bold mt-4 mb-2">$1</h1>'
        )
        .replace(
          /^#### (.*$)/gim,
          '<h4 class="text-base font-bold mt-3 mb-2">$1</h4>'
        )
        .replace(
          /^##### (.*$)/gim,
          '<h5 class="text-sm font-bold mt-3 mb-2">$1</h5>'
        )
        .replace(
          /^###### (.*$)/gim,
          '<h6 class="text-xs font-bold mt-3 mb-2">$1</h6>'
        )
        // Bold text
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        // Italic text
        .replace(/\*(.*?)\*/g, "<em>$1</em>")
        // Code blocks
        .replace(
          /```([\s\S]*?)```/g,
          '<pre class="bg-gray-700 p-2 rounded text-sm overflow-x-auto my-2"><code>$1</code></pre>'
        )
        // Inline code
        .replace(
          /`(.*?)`/g,
          '<code class="bg-gray-700 px-1 rounded text-sm">$1</code>'
        )
        // Links
        .replace(
          /\[([^\]]+)\]\(([^)]+)\)/g,
          '<a href="$2" class="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">$1</a>'
        )
        // Line breaks
        .replace(/\n/g, "<br/>")
    );
  };

  return (
    <div
      dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
      className="prose prose-invert max-w-none"
    />
  );
};

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

      try {
        const response = await fetch("/.netlify/functions/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: userMessage.content,
            sessionId: sessionId || undefined,
            streaming: true,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Capture session ID from response headers
        const responseSessionId = response.headers.get("x-session-id");
        if (responseSessionId && !sessionId) {
          setSessionId(responseSessionId);
          console.log("New session created:", responseSessionId);
        }
        console.log("Current session ID:", sessionId || responseSessionId);

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error("No response body");
        }

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "",
        };

        setMessages((prev) => [...prev, assistantMessage]);

        const decoder = new TextDecoder();
        let done = false;

        while (!done) {
          const { value, done: readerDone } = await reader.read();
          done = readerDone;

          if (value) {
            const chunk = decoder.decode(value);

            // Update the last message (assistant) with streaming content
            setMessages((prev) => {
              const newMessages = [...prev];
              const lastMessage = newMessages[newMessages.length - 1];
              if (lastMessage.role === "assistant") {
                lastMessage.content += chunk;
              }
              return newMessages;
            });
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto">
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
