#!/usr/bin/env tsx

import { ingestFiles } from "../netlify/services";
import { IngestionConfig } from "../netlify/types";

// Environment validation
const OPENAI_KEY = process.env.OPENAI_API_KEY;
const DATABASE_URL = process.env.NETLIFY_DATABASE_URL;

if (!OPENAI_KEY) {
  console.error("Missing OPENAI_API_KEY in environment");
  process.exit(1);
}
if (!DATABASE_URL) {
  console.error("Missing DATABASE_URL in environment");
  process.exit(1);
}

// Main execution
async function main() {
  const targetDir = process.argv[2] || "./data";
  
  const config: IngestionConfig = {
    targetDir,
    fileExtensions: [".md", ".txt"],
    rateLimitMs: 200,
    batchSize: 10
  };
  
  await ingestFiles(config);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});