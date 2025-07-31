# Chat Memory System

This directory contains the foundation for a simple chat memory/history management system for the AdventureCue app.

## Database Schema

The chat memory system consists of two main tables:

### `chat_sessions`

Stores individual chat conversations.

| Column       | Type      | Description                         |
| ------------ | --------- | ----------------------------------- |
| `id`         | serial    | Primary key                         |
| `session_id` | text      | Unique identifier for the session   |
| `title`      | text      | Optional title for the chat session |
| `created_at` | timestamp | When the session was created        |
| `updated_at` | timestamp | When the session was last updated   |

### `chat_messages`

Stores individual messages within chat sessions.

| Column       | Type      | Description                                    |
| ------------ | --------- | ---------------------------------------------- |
| `id`         | serial    | Primary key                                    |
| `session_id` | text      | Foreign key to chat_sessions.session_id        |
| `role`       | text      | Message role: 'user', 'assistant', or 'system' |
| `content`    | text      | The message content                            |
| `created_at` | timestamp | When the message was created                   |

## Features

- **Session Management**: Each chat conversation has a unique session ID
- **Message History**: All messages are stored with timestamps and roles
- **Foreign Key Constraints**: Ensures data integrity between sessions and messages
- **Indexes**: Optimized for querying by session_id
- **Extensible**: Foundation can be extended with features like:
  - User authentication
  - Message metadata
  - Search functionality
  - Message reactions/ratings
  - Session sharing

## TypeScript Types

Types are defined in `netlify/services/memory/types.ts`:

- `ChatSession`: Database record type
- `ChatMessage`: Database record type
- `CreateChatSessionInput`: Input for creating new sessions
- `CreateChatMessageInput`: Input for creating new messages

## Utilities

Helper functions in `netlify/services/memory/utils.ts`:

- `generateSessionId()`: Creates unique session identifiers
- `generateSessionTitle()`: Creates session titles from first message
- `isValidChatRole()`: Validates message roles

## Database Verification

The `bin/verify-chat-tables.ts` script is a utility tool for verifying the chat memory database schema.

### Use Cases:

- **Development Debugging**: Verify table structure during development
- **Migration Verification**: Confirm schema changes were applied correctly
- **Production Health Checks**: Validate database integrity in different environments
- **Troubleshooting**: Diagnose database-related issues
- **Documentation**: Reference for expected schema structure

### Running the Verification:

```bash
npm run netlify dev:exec npx tsx bin/verify-chat-tables.ts
```

The script will display:

- Table column structures and data types
- Foreign key constraints
- Indexes and their definitions
- Overall database health status

## Next Steps

This is a foundation that can be extended with:

1. **API Endpoints**: Create REST or GraphQL endpoints for CRUD operations
2. **Database Queries**: Add Drizzle query functions for common operations
3. **UI Components**: Build React components for chat interface
4. **Real-time Updates**: Add WebSocket support for live messaging
5. **Persistence**: Implement auto-save and session recovery
6. **Analytics**: Track usage patterns and conversation metrics

## Migration

The database tables were created using migration `0003_ancient_blue_blade.sql`. The migration safely adds new tables without affecting existing data. Note that due to Drizzle migration tracking issues, the tables were applied manually but follow the same schema as defined in the migration file.

## How Drizzle Migration System Works

### Migration Tracking

Drizzle maintains a special table called `__drizzle_migrations` in your database that tracks:

- Which migrations have been applied
- When they were applied
- The migration hash/checksum

### Additive-Only Approach

Drizzle is designed to be **non-destructive** by default:

- ✅ **Adds** new tables, columns, indexes, constraints
- ✅ **Modifies** existing structures (with explicit instructions)
- ❌ **Never automatically drops** tables, columns, or data
- ❌ **Requires explicit commands** for destructive operations

### Schema Diffing Process

When you run `drizzle-kit generate`:

1. Compares your current `schema.ts` with the last known schema state
2. Generates SQL commands for **only the differences**
3. Creates a new migration file with incremental changes
4. Updates the migration metadata

### Migration Files Structure

The migration system uses several files:

- `migrations/meta/_journal.json` - Tracks all migrations
- `migrations/meta/XXXX_snapshot.json` - Schema snapshots for each migration
- Individual `.sql` files - The actual migration commands

### Best Practices for Future Migrations

1. **Always use Drizzle**: Avoid manual schema changes when possible
2. **Test migrations**: Run on a copy of production data first
3. **Backup before migrating**: Always have a rollback plan
4. **Keep schema in sync**: Make sure your `schema.ts` reflects reality
5. **Use transactions**: Migrations should be atomic (all or nothing)
