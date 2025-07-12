import { RAGResponse, RAGQuery } from "@/lib/types";

const endpoint = {
  query: "/.netlify/functions/query",
};

export const queryRAG = async (queryObj: RAGQuery): Promise<RAGResponse> => {
  try {
    const response = await fetch(endpoint.query, {
      method: "POST",
      body: JSON.stringify(queryObj),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};