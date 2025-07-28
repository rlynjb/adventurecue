"use client";

import { StreamEvent, StreamProcessor } from "@/lib/packages";
import { useState } from "react";

export interface ChatResult {
  type: string;
  intro: string;
  places?: {
    name: string;
    description: string;
    type: string;
    location: string;
  }[];
  outro?: string;
}

interface ChatStatus {
  type?: string;
  description: string;
}

interface ChatQuery {
  type: string;
  msg: string;
}

export const Query = () => {
  const [inputData, setInputData] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<
    (ChatQuery | ChatStatus | ChatResult)[]
  >([{ type: "final", intro: "Hi! What are you in the mood for?" }]);
  const [status, setStatus] = useState<ChatStatus | null>(null);

  /**
   * @todo
   * this is working so far,
   * improve status updates..
   * create setStatus state and set at the bottom of chat
   */

  const handleQueryRAG = async () => {
    setLoading(true);
    setError(null);
    setMessages((prev) => [...prev, { type: "query", msg: inputData }]);
    setInputData("");

    /**
     * @todo
     * display stream events repond objects in the UI
     */
    try {
      const processor = new StreamProcessor();
      await processor.processQuery(inputData, (event: StreamEvent) => {
        if (event.type === "status") {
          setStatus({
            description: event.status?.description,
          } as ChatStatus);
        }

        if (event.type === "final") {
          const result = event.result?.response;
          setMessages((prev) => [
            ...prev,
            {
              type: "final",
              ...JSON.parse(result ? result : "{}"),
            },
          ]);
        }
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleQueryRAG();
    }
  };

  return (
    <>
      <main className="app-container__main">
        <div className="chat-container">
          {messages.map((msg, index) => (
            <div key={index} className="chat-message">
              {msg.type === "query" && "msg" in msg && (
                <p className="chat-user">{msg.msg}</p>
              )}

              {msg.type === "final" && "intro" in msg && (
                <div className="chat-system">
                  <p className="chat-system__intro">{msg.intro}</p>
                  <ul className="chat-system__places">
                    {msg.places
                      ? msg.places.map((place, idx) => (
                          <li key={idx}>
                            <div>
                              <b>✅ {place.name}</b>
                              <p className="text-sm">📍 {place.location}</p>
                            </div>
                            <p>{place.description}</p>
                          </li>
                        ))
                      : []}
                  </ul>
                  <p className="chat-system__outro text-neutral-400">
                    {msg.outro}
                  </p>
                </div>
              )}
            </div>
          ))}
          {status && <div className="chat-status">{status.description}</div>}
        </div>
        {error && <p className=" text-red-500">Error: {error}</p>}
      </main>

      <footer className="app-container__footer">
        <input
          type="text"
          placeholder="Ask a travel question..."
          value={inputData}
          className="w-[36em]"
          onChange={(e) => setInputData(e.target.value)}
          onKeyUp={handleKeyPress}
          disabled={loading}
        />

        <button onClick={handleQueryRAG} disabled={loading}>
          {loading ? "Loading..." : "Ask"}
        </button>
      </footer>
    </>
  );
};

export default Query;
