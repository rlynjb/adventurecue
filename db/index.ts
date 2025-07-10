import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

import * as schema from './schema';

// Get the database URL from environment variables
const databaseUrl = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL or NEON_DATABASE_URL environment variable is required');
}

const sql = neon(databaseUrl);

export const db = drizzle(sql, {
  schema,
});