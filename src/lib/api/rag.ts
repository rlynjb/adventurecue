import { RAGIngest, RAGQuery, RAGResponse } from "@/lib/types";

export const endpoint = {
  query: "/.netlify/functions/query",
  ingest: "/.netlify/functions/ingest",
  queryStream: "/.netlify/functions/chat",
};

export const queryRAG = async (queryObj: RAGQuery): Promise<RAGResponse> => {
  try {
    const res = await fetch(endpoint.query, {
      method: "POST",
      body: JSON.stringify(queryObj),
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

export const ingestText = async (ingestObj: RAGIngest) => {
  try {
    const res = await fetch(endpoint.ingest, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: ingestObj.text,
        source: ingestObj.source || "pasted-text",
      }),
    });

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error ingesting text:", error);
    throw error;
  }
};
