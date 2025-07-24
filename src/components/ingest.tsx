"use client";

import { ingestText } from "@/lib/api";
import { useState } from "react";

export const Ingest = () => {
  const [text, setText] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string>("");

  const handleUpload = async () => {
    setStatus("Uploading...");
    let inputText = text;

    if (file) {
      const content = await file.text();
      inputText = content;
    }

    try {
      const data = await ingestText({ text: inputText });
      console.log("Upload response:", data);
      setStatus(data.message || "Upload complete");
    } catch (error) {
      console.error("Error uploading text:", error);
      setStatus("Error uploading text. Please try again.");
    }
  };

  return (
    <>
      <textarea
        className="w-full mb-6"
        placeholder="Paste markdown or text here..."
        rows={8}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <div className="flex justify-between gap-4">
        <input
          type="file"
          accept=".md,.txt,.pdf"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
        <button onClick={handleUpload}>Upload</button>
      </div>

      {status && <p className="text-sm text-green-600">{status}</p>}
    </>
  );
};

export default Ingest;
