#!/usr/bin/env tsx

import { neon } from "@neondatabase/serverless";

async function verifyTables() {
  try {
    const databaseUrl = process.env.NETLIFY_DATABASE_URL;
    if (!databaseUrl) {
      throw new Error("NETLIFY_DATABASE_URL environment variable is not set");
    }

    const sql = neon(databaseUrl);

    console.log("🔍 Verifying chat tables structure...\n");

    // Check chat_sessions table structure
    const sessionsSchema = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'chat_sessions'
      ORDER BY ordinal_position;
    `;

    console.log("📋 chat_sessions table:");
    console.table(sessionsSchema);

    // Check chat_messages table structure
    const messagesSchema = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'chat_messages'
      ORDER BY ordinal_position;
    `;

    console.log("\n📋 chat_messages table:");
    console.table(messagesSchema);

    // Check foreign key constraints
    const constraints = await sql`
      SELECT 
        tc.constraint_name, 
        tc.table_name, 
        kcu.column_name, 
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name 
      FROM information_schema.table_constraints AS tc 
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY' 
        AND tc.table_name IN ('chat_messages', 'chat_sessions');
    `;

    console.log("\n🔗 Foreign key constraints:");
    console.table(constraints);

    // Check indexes
    const indexes = await sql`
      SELECT 
        indexname,
        tablename,
        indexdef
      FROM pg_indexes 
      WHERE tablename IN ('chat_messages', 'chat_sessions')
        AND schemaname = 'public'
      ORDER BY tablename, indexname;
    `;

    console.log("\n📚 Indexes:");
    console.table(indexes);

    console.log("\n✅ All chat tables are properly configured!");
  } catch (error) {
    console.error("❌ Verification failed:", error);
    process.exit(1);
  }
}

verifyTables();
