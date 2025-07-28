# Type System and Interface Documentation

## TypeScript Interface Relationships

```mermaid
erDiagram
    ChatStatus {
        number step
        string description
        string status
        number timestamp
        any data
    }

    ChatResponse {
        boolean success
        string response
        number executionTimeMs
    }

    EmbeddingRow {
        string content
        number[] embedding
        any metadata
    }

    ToolContext {
        string query
        string contextText
    }

    StatusCallback {
        function call
    }

    OpenAIInput {
        string role
        string content
    }

    OpenAITool {
        string type
        any parameters
    }

    ChatResponse ||--o{ ChatStatus : contains
    ChatResponse ||--o{ string : toolsUsed
    ChatService ||--|| ChatResponse : returns
    ChatService ||--|| ChatStatus : creates
    ChatService ||--|| EmbeddingRow : processes
    ChatService ||--|| ToolContext : uses
    ChatService ||--|| StatusCallback : accepts
    executeToolCall ||--|| ToolContext : receives
    callOpenAI ||--o{ OpenAIInput : processes
    callOpenAI ||--o{ OpenAITool : uses
```

## Status State Machine

```mermaid
stateDiagram-v2
    [*] --> pending : Status Created
    pending --> executing : Process Starts
    executing --> executing : Progress Updates
    executing --> completed : Success
    executing --> failed : Error Occurs
    completed --> [*]
    failed --> [*]

    note right of executing : Multiple status updates\ncan occur in this state
    note right of failed : Error details stored\nin data property
```

## Tool Execution State Flow

```mermaid
stateDiagram-v2
    [*] --> ToolReceived : Tool call initiated
    ToolReceived --> TypeIdentified : Extract tool type
    TypeIdentified --> WebSearch : web_search_call
    TypeIdentified --> CustomAPI : custom_api_call
    TypeIdentified --> DatabaseLookup : database_lookup
    TypeIdentified --> DefaultHandler : unknown type

    WebSearch --> Searching : Update status
    Searching --> WebCompleted : Search finished
    WebCompleted --> [*]

    CustomAPI --> APICalling : Update status
    APICalling --> APICompleted : API response
    APICompleted --> [*]

    DatabaseLookup --> DBQuerying : Update status
    DBQuerying --> DBCompleted : Query finished
    DBCompleted --> [*]

    DefaultHandler --> DefaultCompleted : Log unknown type
    DefaultCompleted --> [*]

    WebSearch --> ErrorState : Exception
    CustomAPI --> ErrorState : Exception
    DatabaseLookup --> ErrorState : Exception
    DefaultHandler --> ErrorState : Exception
    ErrorState --> [*]
```

## Function Signature Mappings

```typescript
// Core Functions with Status Tracking
interface ChatServiceFunctions {
  // Main entry point with optional status callback
  generateAnswer(
    query: string,
    contextText: string,
    onStatusUpdate?: (status: ChatStatus) => void
  ): Promise<ChatResponse>;

  // Tool execution with status updates
  executeToolCall(
    toolCall: any,
    context: ToolContext,
    onStatusUpdate?: (status: ChatStatus) => void
  ): Promise<any>;

  // OpenAI API wrapper
  callOpenAI(input: any[], tools: any[], store?: boolean): Promise<any>;

  // Status creation helper
  createStatus(
    step: number,
    description: string,
    status: ChatStatus["status"],
    data?: any
  ): ChatStatus;

  // Context formatting utility
  buildContextPrompt(rows: EmbeddingRow[]): string;

  // Backward compatibility wrapper
  generateSimpleAnswer(query: string, contextText: string): Promise<string>;
}
```

## Status Update Patterns

```mermaid
sequenceDiagram
    participant GS as generateAnswer
    participant CS as createStatus
    participant CB as onStatusUpdate
    participant UI as Client UI

    Note over GS,UI: Step 1: Query Analysis
    GS->>CS: createStatus(1, "Analyzing query", "executing")
    CS-->>GS: ChatStatus object
    GS->>CB: status callback
    CB->>UI: Update status display

    Note over GS,UI: Step 2: OpenAI Call
    GS->>CS: createStatus(2, "Waiting for OpenAI", "executing")
    CS-->>GS: ChatStatus object
    GS->>CB: status callback
    CB->>UI: Update status display

    Note over GS,UI: Step 3: Tool Execution (if needed)
    GS->>CS: createStatus(3, "Executing tool", "executing")
    CS-->>GS: ChatStatus object
    GS->>CB: status callback
    CB->>UI: Update status display

    Note over GS,UI: Completion
    GS->>CS: createStatus(5, "Complete", "completed")
    CS-->>GS: ChatStatus object
    GS->>CB: status callback
    CB->>UI: Final status update
```

## Error Handling Pattern

```mermaid
flowchart TD
    A[Function Entry] --> B[Try Block Start]
    B --> C[Normal Processing]
    B --> D[Exception Thrown]

    C --> E[Success Status]
    E --> F[Return Success Response]

    D --> G[Catch Block]
    G --> H[Create Error Status]
    H --> I{Error Type Check}

    I -->|Tool Error| J[Tool-specific Error Handling]
    I -->|API Error| K[API Error Handling]
    I -->|Network Error| L[Network Error Handling]
    I -->|Unknown| M[Generic Error Handling]

    J --> N[Update Status: Failed]
    K --> N
    L --> N
    M --> N

    N --> O[Log Error Details]
    O --> P[Return Error Response]

    F --> Q[Include Success Steps]
    P --> R[Include Error in Steps]

    Q --> S[Final ChatResponse]
    R --> S
```

## Integration Points

The enhanced chat system integrates at these key points:

1. **Type Safety**: All interfaces ensure type safety across the system
2. **Status Callbacks**: Optional callbacks allow real-time UI updates
3. **Error Boundaries**: Comprehensive error handling with status tracking
4. **Tool Extensibility**: Switch-based tool system for easy additions
5. **Performance Tracking**: Built-in timing and metrics collection
6. **Backward Compatibility**: Wrapper functions maintain existing API contracts

This type system provides a robust foundation for the enhanced chat functionality while maintaining flexibility for future extensions.
