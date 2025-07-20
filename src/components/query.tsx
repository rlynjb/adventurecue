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

  return (
    <>
      <div className="mt-4 mb-6">
        {error && <p className=" text-red-500">Error: {error}</p>}
        {respondData && (
          <p className="mt-6 w-80 sm:w-[400px] md:w-[500px] lg:w-[600px] xl:w-[700px]">
            {respondData}
          </p>
        )}
      </div>

      <input
        type="text"
        placeholder="Type your query here..."
        className="mb-6"
        value={inputData}
        onChange={(e) => setInputData(e.target.value)}
        onKeyUp={handleKeyPress}
        disabled={loading}
      />

      <div className="flex gap-4 items-center flex-col sm:flex-row">
        <button onClick={handleQueryRAG} disabled={loading}>
          {loading ? "Loading..." : "Ask"}
        </button>
      </div>
    </>
  );
};

export default Query;
