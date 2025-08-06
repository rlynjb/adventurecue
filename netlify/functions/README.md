# Netlify Functions Directory Structure

This directory follows a function-specific organization pattern where each function has its own subdirectory containing related files.

## Structure

```
netlify/functions/
├── shared/
│   └── types.ts                    # Shared types across all functions
├── chat/
│   ├── index.ts                    # Main chat handler
│   └── validation.ts               # Chat-specific validation logic
└── ingest/
    ├── index.ts                    # Main ingest handler
    └── validation.ts               # Ingest-specific validation logic
```

## Function Endpoints

- **`/chat`** - Enhanced query handler with real-time status updates and memory support
- **`/ingest`** - Text ingestion handler for processing content

## Benefits of This Structure

1. **Separation of Concerns** - Each function has its own validation and logic
2. **Shared Resources** - Common types are centralized in the `shared/` directory
3. **Scalability** - Easy to add new function-specific files (middleware, types, utilities)
4. **Maintainability** - Clear organization makes code easier to find and modify
5. **Netlify Compatible** - Each function's `index.ts` serves as the entry point

## Adding New Functions

To add a new function:

1. Create a new directory: `netlify/functions/my-function/`
2. Add `index.ts` as the main handler
3. Add function-specific files as needed (validation, types, etc.)
4. Import shared types from `../shared/types.ts`

## Migration Notes

- All existing function endpoints remain the same
- No breaking changes to the API
- Improved code organization and maintainability
