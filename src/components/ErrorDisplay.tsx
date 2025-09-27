import React from "react";
import { UI_CONFIG } from "../constants/chat";

interface ErrorDisplayProps {
  error: string | null;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error }) => (
  <>
    {error && (
      <div className="aq-chatbot--error">
        {UI_CONFIG.ERROR_PREFIX}
        {error}
      </div>
    )}
  </>
);
