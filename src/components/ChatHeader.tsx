interface ChatHeaderProps {
  sessionId: string;
}

export const ChatHeader = ({ sessionId }: ChatHeaderProps) => (
  <header className="aq-chatbot--header">
    <h2 className="aq-chatbot--header-title">advntrQ</h2>
    {sessionId && (
      <div className="aq-chatbot--header-subtitle">
        Session: {sessionId.slice(0, 8)}
      </div>
    )}
  </header>
);
