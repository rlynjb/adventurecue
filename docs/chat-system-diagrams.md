# Chat System Architecture Diagrams

This document contains flow diagrams and class diagrams for the enhanced chat system with status tracking capabilities.

## 1. Enhanced Chat System Flow Diagram

```mermaid
flowchart TD
    A[User Query] --> B[generateAnswer]
    B --> C{Initialize Status Tracking}
    C --> D[Step 1: Analyze Query]
    D --> E[Create Input Array]
    E --> F[Define Tools Array]
    F --> G[Step 2: Call OpenAI API]
    G --> H[callOpenAI Function]
    H --> I{Tool Call Required?}

    I -->|Yes| J[Step 3: Execute Tool]
    J --> K[executeToolCall with Switch]
    K --> L{Tool Type}

    L -->|web_search_call| M[Web Search Logic]
    L -->|custom_api_call| N[Custom API Logic]
    L -->|database_lookup| O[Database Query Logic]
    L -->|default| P[Default Behavior]

    M --> Q[Update Tool Status]
    N --> Q
    O --> Q
    P --> Q

    Q --> R[Step 4: Send Results to OpenAI]
    R --> S[callOpenAI with Tool Results]
    S --> T[Step 5: Generate Final Response]

    I -->|No| U[Direct Response Processing]
    U --> V[Step 2: Complete Response]

    T --> W[Return ChatResponse]
    V --> W

    W --> X[Status Steps Array]
    W --> Y[Tools Used Array]
    W --> Z[Execution Time]
    W --> AA[Final Response Text]

    subgraph "Status Updates"
        BB[onStatusUpdate Callback]
        CC[createStatus Helper]
        DD[updateStatus Internal]
    end

    D --> BB
    G --> BB
    J --> BB
    Q --> BB
    R --> BB
    T --> BB
    V --> BB

    BB --> CC
    CC --> DD
```

## 2. Status Tracking Flow Diagram

```mermaid
flowchart TD
    A[Status Update Triggered] --> B[createStatus Helper]
    B --> C[Create ChatStatus Object]
    C --> D{onStatusUpdate Callback Provided?}

    D -->|Yes| E[Call External Callback]
    D -->|No| F[Internal Tracking Only]

    E --> G[Update UI Components]
    F --> H[Add to Steps Array]

    G --> H
    H --> I[Store with Timestamp]

    subgraph "Status Types"
        J[pending]
        K[executing]
        L[completed]
        M[failed]
    end

    C --> J
    C --> K
    C --> L
    C --> M

    subgraph "Status Steps"
        N[Step 1: Query Analysis]
        O[Step 2: OpenAI Call]
        P[Step 3: Tool Execution]
        Q[Step 4: Follow-up Call]
        R[Step 5: Completion]
    end

    I --> N
    I --> O
    I --> P
    I --> Q
    I --> R
```

## 3. Tool Execution Flow Diagram

```mermaid
flowchart TD
    A[executeToolCall Called] --> B[Extract Tool Type]
    B --> C[Update Status: Executing Tool]
    C --> D[Switch Statement]

    D --> E{Tool Type}

    E -->|web_search_call| F[Web Search Branch]
    E -->|custom_api_call| G[Custom API Branch]
    E -->|database_lookup| H[Database Branch]
    E -->|default| I[Default Branch]

    F --> J[Log Web Search]
    J --> K[Update Status: Searching Web]
    K --> L[Simulate Search Delay]
    L --> M[Update Status: Search Complete]
    M --> N[Return Tool Result]

    G --> O[Log API Call]
    O --> P[Update Status: Calling API]
    P --> Q[Simulate API Delay]
    Q --> R[Update Status: API Complete]
    R --> S[Return Enhanced Result]

    H --> T[Log Database Query]
    T --> U[Update Status: Searching DB]
    U --> V[Simulate DB Delay]
    V --> W[Update Status: DB Complete]
    W --> X[Return DB Result]

    I --> Y[Log Unknown Tool]
    Y --> Z[Update Status: Default Behavior]
    Z --> AA[Return Original Tool]

    N --> BB[Success Path]
    S --> BB
    X --> BB
    AA --> BB

    BB --> CC[Return to Main Flow]

    subgraph "Error Handling"
        DD[Catch Exception]
        EE[Update Status: Failed]
        FF[Throw Error]
    end

    F --> DD
    G --> DD
    H --> DD
    I --> DD

    DD --> EE
    EE --> FF
```

## 4. Class/Interface Diagram

```mermaid
classDiagram
    class ChatStatus {
        +number step
        +string description
        +string status
        +number timestamp
        +any data?
    }

    class ChatResponse {
        +boolean success
        +string response
        +ChatStatus[] steps
        +string[] toolsUsed
        +number executionTimeMs
    }

    class EmbeddingRow {
        +string content
        +number[] embedding
        +any metadata?
    }

    class OpenAIClient {
        +responses: ResponsesAPI
    }

    class ChatService {
        -OpenAIClient openai
        +createStatus(step, description, status, data?) ChatStatus
        +callOpenAI(input, tools, store?) Promise~any~
        +executeToolCall(toolCall, context, onStatusUpdate?) Promise~any~
        +buildContextPrompt(rows) string
        +generateAnswer(query, contextText, onStatusUpdate?) Promise~ChatResponse~
        +generateSimpleAnswer(query, contextText) Promise~string~
    }

    class ToolContext {
        +string query
        +string contextText
    }

    class StatusCallback {
        <<interface>>
        +call(status: ChatStatus) void
    }

    ChatService --> ChatStatus : creates
    ChatService --> ChatResponse : returns
    ChatService --> EmbeddingRow : uses
    ChatService --> OpenAIClient : uses
    ChatService --> ToolContext : uses
    ChatService --> StatusCallback : accepts

    ChatResponse --> ChatStatus : contains[]

    note for ChatStatus "Status tracking for each processing step"
    note for ChatResponse "Complete response with metadata"
    note for ChatService "Main service with enhanced status tracking"
```

## 5. API Integration Flow Diagram

```mermaid
sequenceDiagram
    participant Client
    participant NetlifyFunction
    participant ChatService
    participant OpenAI
    participant Tools

    Client->>NetlifyFunction: POST /api/query-with-status
    NetlifyFunction->>ChatService: generateAnswer(query, context, callback)

    ChatService->>ChatService: createStatus(1, "Analyzing query", "executing")
    ChatService->>NetlifyFunction: onStatusUpdate callback
    NetlifyFunction->>Client: Status Update (Step 1)

    ChatService->>OpenAI: callOpenAI(input, tools)
    ChatService->>ChatService: createStatus(2, "Waiting for OpenAI", "executing")
    ChatService->>NetlifyFunction: onStatusUpdate callback
    NetlifyFunction->>Client: Status Update (Step 2)

    OpenAI-->>ChatService: Response with tool call
    ChatService->>ChatService: createStatus(2, "Received response", "completed")

    alt Tool Call Required
        ChatService->>Tools: executeToolCall(toolCall, context, callback)
        Tools->>Tools: createStatus(3, "Executing tool", "executing")
        Tools->>NetlifyFunction: onStatusUpdate callback
        NetlifyFunction->>Client: Status Update (Step 3)

        Tools->>Tools: Switch statement execution
        Tools->>Tools: createStatus(3, "Tool completed", "completed")
        Tools-->>ChatService: Tool result

        ChatService->>OpenAI: callOpenAI(input + toolResult, tools, true)
        ChatService->>ChatService: createStatus(4, "Sending results", "executing")
        ChatService->>NetlifyFunction: onStatusUpdate callback
        NetlifyFunction->>Client: Status Update (Step 4)

        OpenAI-->>ChatService: Final response
        ChatService->>ChatService: createStatus(5, "Generation complete", "completed")
    end

    ChatService-->>NetlifyFunction: ChatResponse object
    NetlifyFunction-->>Client: Complete response with all status steps
```

## 6. Client-Side Status Handling Flow

```mermaid
flowchart TD
    A[Client Initiates Query] --> B{Streaming Mode?}

    B -->|No| C[Regular POST Request]
    B -->|Yes| D[Server-Sent Events Request]

    C --> E[Wait for Complete Response]
    E --> F[Receive ChatResponse Object]
    F --> G[Process All Status Steps]
    G --> H[Update UI with Final State]

    D --> I[Establish SSE Connection]
    I --> J[Listen for Events]
    J --> K{Event Type}

    K -->|status| L[Update Status UI]
    K -->|final| M[Display Final Response]
    K -->|error| N[Show Error Message]

    L --> J
    M --> O[Close Connection]
    N --> O

    H --> P[Display Response]
    O --> P

    subgraph "UI Updates"
        Q[Status Steps Container]
        R[Loading Indicators]
        S[Progress Bars]
        T[Response Display]
        U[Error Messages]
    end

    L --> Q
    L --> R
    L --> S
    M --> T
    N --> U
    H --> T
```

## 7. Error Handling Flow Diagram

```mermaid
flowchart TD
    A[Operation Starts] --> B{Try Block}
    B --> C[Normal Execution]
    B --> D[Exception Thrown]

    C --> E[Success Status Updates]
    E --> F[Complete Successfully]

    D --> G[Catch Block]
    G --> H[Create Failed Status]
    H --> I[Update Status: Failed]
    I --> J[Log Error Details]
    J --> K{Error Type}

    K -->|Tool Execution Error| L[Return ChatResponse with Error]
    K -->|OpenAI API Error| M[Return ChatResponse with Error]
    K -->|Network Error| N[Return ChatResponse with Error]
    K -->|Unknown Error| O[Return Generic Error Response]

    L --> P[Set success: false]
    M --> P
    N --> P
    O --> P

    P --> Q[Include Error in Steps Array]
    Q --> R[Return to Client]

    F --> S[Set success: true]
    S --> T[Include All Success Steps]
    T --> R

    subgraph "Error Status Details"
        U[Step: -1 for errors]
        V[Status: 'failed']
        W[Error object in data]
        X[Descriptive error message]
    end

    H --> U
    H --> V
    H --> W
    H --> X
```

## Key Improvements Visualized

1. **Status Tracking**: Every operation now provides real-time feedback
2. **Tool Composability**: Switch-based system for easy tool addition
3. **Error Handling**: Comprehensive error tracking and reporting
4. **Performance Metrics**: Execution time and tool usage tracking
5. **Client Integration**: Support for both streaming and batch processing
6. **Backward Compatibility**: Maintained through wrapper functions

These diagrams illustrate how the enhanced chat system provides comprehensive status tracking while maintaining the core functionality and adding new capabilities for better user experience and system observability.
