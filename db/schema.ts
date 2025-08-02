import { sql } from "drizzle-orm";
import {
  customType,
  foreignKey,
  index,
  integer,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

// Define custom vector type
const vector = customType<{ data: number[] }>({
  dataType() {
    return "vector(1536)";
  },
});

export const embeddings = pgTable(
  "embeddings",
  {
    id: serial("id"),
    chunk_index: integer("chunk_index").notNull(),
    content: text("content").notNull(),
    embedding: vector("embedding").notNull(),
    created_at: timestamp("created_at", { withTimezone: true }).default(
      sql`now()`
    ),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.id] }),
  })
);

// Chat Sessions - represents individual chat conversations
export const chatSessions = pgTable(
  "chat_sessions",
  {
    id: serial("id"),
    session_id: text("session_id").notNull().unique(), // UUID or unique identifier
    title: text("title"), // Optional title for the chat session
    created_at: timestamp("created_at", { withTimezone: true }).default(
      sql`now()`
    ),
    updated_at: timestamp("updated_at", { withTimezone: true }).default(
      sql`now()`
    ),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.id] }),
    sessionIdIdx: index("chat_sessions_session_id_idx").on(table.session_id),
  })
);

// Chat Messages - stores individual messages within a chat session
export const chatMessages = pgTable(
  "chat_messages",
  {
    id: serial("id"),
    session_id: text("session_id").notNull(),
    role: text("role").notNull(), // 'user', 'assistant', 'system'
    content: text("content").notNull(),
    created_at: timestamp("created_at", { withTimezone: true }).default(
      sql`now()`
    ),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.id] }),
    sessionIdIdx: index("chat_messages_session_id_idx").on(table.session_id),
    sessionFk: foreignKey({
      columns: [table.session_id],
      foreignColumns: [chatSessions.session_id],
    }),
  })
);
