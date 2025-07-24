"use client";

import { queryRAG } from "@/lib/api";
import { RAGResponse } from "@/lib/types/rag";
import { useState } from "react";

export const Query = () => {
  const [inputData, setInputData] = useState<string>("");
  const [respondData, setRespondData] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleQueryRAG = async () => {
    setLoading(true);
    setError(null);

    try {
      const result: RAGResponse = await queryRAG({ query: inputData });
      console.log("RAG response:", result);
      setRespondData(result.answer);
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
        {respondData && <p className="text-neutral-400">{respondData}</p>}
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
