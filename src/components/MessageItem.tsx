import { MarkdownRenderer } from "../components/MarkdownRenderer";
import { type Message } from "../utils";

interface MessageItemProps {
  message: Message;
  isLoading: boolean;
}

export const MessageItem = ({ message, isLoading }: MessageItemProps) => {
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
