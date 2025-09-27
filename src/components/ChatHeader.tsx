import { APP_CONFIG, UI_CONFIG } from "../constants/chat";

interface ChatHeaderProps {
  sessionId: string;
}

export const ChatHeader = ({ sessionId }: ChatHeaderProps) => (
  <header className="aq-chatbot--header">
    <h2 className="aq-chatbot--header-title">{APP_CONFIG.TITLE}</h2>
    {sessionId && (
      <div className="aq-chatbot--header-subtitle">
        Session: {sessionId.slice(0, UI_CONFIG.SESSION_ID_PREVIEW_LENGTH)}
      </div>
    )}
  </header>
);
