import { neon } from "@neondatabase/serverless";

const DATABASE_URL = process.env.NETLIFY_DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error("Missing DATABASE_URL in environment");
}

// Singleton pattern - initialize once
let sqlClient: any = null;

export const getSQLClient = () => {
  if (!sqlClient) {
    sqlClient = neon(DATABASE_URL);
  }
  return sqlClient;
};
