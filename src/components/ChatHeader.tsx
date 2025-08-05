/**
 * Chat Header Component
 * Displays session information and current status
 */
export function ChatHeader({
  sessionId,
  status,
}: {
  sessionId: string;
  status: string;
}) {
  return (
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
  );
}
