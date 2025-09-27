import React from "react";
import { UI_CONFIG } from "../constants/chat";

interface ChatComposerProps {
  input: string;
  setInput: (value: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}

export const ChatComposer: React.FC<ChatComposerProps> = ({
  input,
  setInput,
  handleSubmit,
  isLoading,
}) => (
  <div className="aq-chatbot--composer">
    <form onSubmit={handleSubmit} className="aq-chatbot--composer__form">
      <input
        className="aq-chatbot--composer__input"
        value={input}
        placeholder={UI_CONFIG.PLACEHOLDER_TEXT}
        onChange={(e) => setInput(e.target.value)}
        disabled={isLoading}
      />
      <button
        type="submit"
        disabled={isLoading || !input.trim()}
        className="aq-chatbot--composer__submit"
      >
        {UI_CONFIG.SUBMIT_BUTTON_TEXT}
      </button>
    </form>
  </div>
);
