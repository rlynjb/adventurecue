/**
 * Chat Input Component
 * Handles message input form and chat controls
 */
export function ChatInput({
  input,
  setInput,
  onSubmit,
  status,
  messagesCount,
  onNewChat,
}: {
  input: string;
  setInput: (value: string) => void;
  onSubmit: () => void;
  status: string;
  messagesCount: number;
  onNewChat: () => void;
}) {
  return (
    <>
      {/* Input form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (input.trim()) {
            onSubmit();
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
            onClick={onNewChat}
            className="hover:text-blue-600 dark:hover:text-blue-400"
          >
            New Chat
          </button>
        </div>
        <div>{messagesCount > 0 && <span>{messagesCount} messages</span>}</div>
      </div>
    </>
  );
}
