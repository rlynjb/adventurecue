import type { UIMessage } from "@ai-sdk/react";

/**
 * Messages Component
 * Displays chat messages, loading states, and empty state
 */
export function Messages({
  messages,
  status,
  stop,
  setInput,
}: {
  messages: UIMessage[];
  status: string;
  stop: () => void;
  setInput: (value: string) => void;
}) {
  return (
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
            {message.parts.map((part, i: number) => {
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
  );
}
