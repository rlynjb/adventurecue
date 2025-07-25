"use client";

import { queryRAG } from "@/lib/api";
import { RAGResponse } from "@/lib/types/rag";
import { useState } from "react";

export interface Result {
  intro: string;
  places?: {
    name: string;
    description: string;
    type: string;
    location: string;
  }[];
  outro?: string;
}

export const Query = () => {
  const [inputData, setInputData] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<(string | Result)[]>([
    { intro: "Hi! What are you in the mood for?" },
  ]);

  const handleQueryRAG = async () => {
    setLoading(true);
    setError(null);
    setMessages((prev) => [...prev, inputData]);
    setInputData("");

    // insert loading message in messages array
    // come up with a way to organize different types of messages

    try {
      const result: RAGResponse = await queryRAG({ query: inputData });
      console.log("RAG response:", JSON.parse(result.answer));
      setMessages((prev) => [...prev, JSON.parse(result.answer)]);
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

  /**
   * @note
   * make this like a chat app UI layout.
   * look into formatting teh response to Hybrid Output.
   *
   * also show query status. base on the tools used.
   * e.g. if web search is used, show a message like:
   * "Searching web... Hang tight!"
   * or if RAG is used, show:
   * "Querying for places... Please wait."
   * or if both are used, show:
   * "Fetching results... This may take a few seconds."
   */

  return (
    <>
      <main className="app-container__main">
        <div className="chat-container">
          {messages.map((msg, index) => (
            <div key={index} className="chat-message">
              {typeof msg === "string" ? (
                <p className="chat-user">{msg}</p>
              ) : (
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
