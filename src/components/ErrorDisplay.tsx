interface ErrorDisplayProps {
  error: string | null;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error }) => (
  <>{error && <div className="aq-chatbot--error">Error: {error}</div>}</>
);
