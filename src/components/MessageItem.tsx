import { MarkdownRenderer } from "../components/MarkdownRenderer";
import { MESSAGE_LABELS, MESSAGE_TYPES, UI_CONFIG } from "../constants/chat";
import { type Message } from "../utils";

interface MessageItemProps {
  message: Message;
  isLoading: boolean;
  isLastMessage?: boolean;
}

export const MessageItem = ({
  message,
  isLoading,
  isLastMessage = false,
}: MessageItemProps) => {
  if (message.role === MESSAGE_TYPES.USER) {
    return (
      <div key={message.id} className="aq-chatbot--message bg-blue-600 ml-12">
        <div className="aq-chatbot--message__label">{MESSAGE_LABELS.USER}</div>
        {message.content}
      </div>
    );
  }

  if (message.role === MESSAGE_TYPES.ASSISTANT) {
    return (
      <div key={message.id} className="aq-chatbot--message bg-gray-800 mr-12">
        <div className="aq-chatbot--message__label">
          {MESSAGE_LABELS.ASSISTANT}
        </div>
        <MarkdownRenderer content={message.content} />

        {isLoading && isLastMessage && (
          <div className="aq-chatbot--loading">
            <div className="animate-pulse">{UI_CONFIG.LOADING_INDICATOR}</div>
            <div>{UI_CONFIG.TYPING_INDICATOR_TEXT}</div>
          </div>
        )}
      </div>
    );
  }

  return <div>{message.content}</div>;
};
