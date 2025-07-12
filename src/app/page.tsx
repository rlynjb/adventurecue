"use client";
import { useState } from "react";
import { queryRAG } from "@/lib/api";
import { RAGResponse } from "@/lib/types/rag";

export default function Home() {
  const [inputData, setInputData] = useState<string>('');
  const [respondData, setRespondData] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleQueryRAG = async () => {
    setLoading(true);
    setError(null);
    try {
      const result: RAGResponse = await queryRAG({ query: inputData });
      setRespondData(result.answer);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleQueryRAG();
    }
  };

  return (
    <div className="grid items-center justify-items-center min-h-screen p-8 pb-20 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px]">
        <h2 className="antialiased text-[3em] text-slate-500 font-semibold">AdventureCue</h2>

        <div>
          <input
            type="text"
            placeholder="Type your query here..."
            className="border border-solid border-black/[.08] dark:border-white/[.145] rounded-md p-2 w-80 sm:w-[400px] md:w-[500px] lg:w-[600px] xl:w-[700px] focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-300 transition-colors"
            value={inputData}
            onChange={(e) => setInputData(e.target.value)}
            onKeyUp={handleKeyPress}
            disabled={loading}
          />
        </div>

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <button
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto md:w-[158px]"
            onClick={handleQueryRAG}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Ask'}
          </button>
        </div>

        {error && (
          <p className="mt-4 text-red-500">
            Error: {error}
          </p>
        )}

        {respondData && (
          <p className="mt-6 w-80 sm:w-[400px] md:w-[500px] lg:w-[600px] xl:w-[700px]">
            {respondData}
          </p>
        )}
      </main>
    </div>
  );
}
