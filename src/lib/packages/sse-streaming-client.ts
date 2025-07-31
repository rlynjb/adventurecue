import { endpoint } from "@/lib/api";

/**
 * TRAINEE-FRIENDLY STREAMING EXAMPLE
 *
 * This file shows how to build a streaming chat client using simple,
 * modular components that are easy to understand and maintain.
 *
 * Each component has ONE job and is documented clearly.
 */

// =============================================================================
// 1. DATA TYPES - What information flows through our system
// =============================================================================

export interface StreamEvent {
  type: "status" | "final" | "error";
  status?: {
    step: number;
    description: string;
    status: "starting" | "in_progress" | "completed" | "error";
    timestamp: number;
  };
  result?: {
    response: string;
    executionTimeMs: number;
    toolsUsed: string[];
    steps: Array<{
      step: number;
      description: string;
      status: string;
      timestamp: number;
    }>;
  };
  error?: string;
}

// =============================================================================
// 2. CONNECTION HANDLER - Manages server communication
// =============================================================================

/**
 * Handles connecting to the server and setting up the stream.
 * This is the "networking" part of our streaming system.
 */
class StreamConnection {
  /**
   * Connect to the streaming endpoint and return a reader.
   * Think of this like opening a phone line to the server.
   */
  async connect(
    userQuery: string
  ): Promise<ReadableStreamDefaultReader<Uint8Array>> {
    // Step 1: Make the HTTP request
    const response = await fetch(endpoint.queryStream, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: userQuery,
        streaming: true, // This tells the server we want real-time updates
      }),
    });

    // Step 2: Check if the request worked
    if (!response.ok) {
      throw new Error(`Server responded with error: ${response.status}`);
    }

    // Step 3: Get the stream reader (this lets us read data as it arrives)
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("Server didn't provide a readable stream");
    }

    return reader;
  }
}

// =============================================================================
// 3. BUFFER MANAGER - Handles incoming data chunks
// =============================================================================

/**
 * Manages the buffer where we collect data until we have complete messages.
 * Think of this like collecting puzzle pieces until we have a complete picture.
 */
class StreamBuffer {
  private buffer = ""; // Where we store incomplete data
  private decoder = new TextDecoder(); // Converts bytes to text

  /**
   * Add new data to our buffer.
   * Data arrives in chunks, so we need to collect it.
   */
  addChunk(chunk: Uint8Array): void {
    // Convert bytes to text and add to our buffer
    const text = this.decoder.decode(chunk, { stream: true });
    this.buffer += text;
  }

  /**
   * Extract complete lines from the buffer.
   * Returns complete lines and keeps incomplete ones for next time.
   */
  extractCompleteLines(): string[] {
    // Split buffer into lines
    const lines = this.buffer.split("\n");

    // The last line might be incomplete, so keep it in the buffer
    this.buffer = lines.pop() || "";

    // Return the complete lines
    return lines;
  }

  /**
   * Clear the buffer (used for cleanup)
   */
  clear(): void {
    this.buffer = "";
  }
}

// =============================================================================
// 4. EVENT PARSER - Converts text lines into event objects
// =============================================================================

/**
 * Parses text lines into structured event objects.
 * This is like a translator that converts server messages into objects we can use.
 */
class EventParser {
  /**
   * Parse a single line that might contain event data.
   * Server sends data in format: "data: {json object}"
   */
  parseLine(line: string): StreamEvent | null {
    // We only care about lines that start with "data: "
    if (!line.startsWith("data: ")) {
      return null; // Skip this line
    }

    try {
      // Remove "data: " prefix and parse the JSON
      const jsonText = line.substring(6); // Remove first 6 characters "data: "
      const event = JSON.parse(jsonText) as StreamEvent;
      return event;
    } catch (error) {
      console.warn("Could not parse line as JSON:", line, error);
      return null; // Skip lines we can't parse
    }
  }
}

// =============================================================================
// 5. STREAM PROCESSOR - Coordinates all the components
// =============================================================================

/**
 * The main processor that uses all other components together.
 * This is like the conductor of an orchestra - it coordinates everything.
 */
export class StreamProcessor {
  private connection = new StreamConnection();
  private buffer = new StreamBuffer();
  private parser = new EventParser();

  /**
   * Process a streaming query from start to finish.
   * This is the main method that does all the work.
   */
  async processQuery(
    userQuery: string,
    onEvent: (event: StreamEvent) => void
  ): Promise<void> {
    let reader: ReadableStreamDefaultReader<Uint8Array> | null = null;

    try {
      // STEP 1: Connect to the server and get a stream reader
      console.log("🔌 Connecting to server...");
      reader = await this.connection.connect(userQuery);

      // STEP 2: Read data in a loop until the stream ends
      console.log("📡 Starting to read stream...");
      while (true) {
        // Read the next chunk of data
        const { done, value } = await reader.read();

        // If stream is finished, exit the loop
        if (done) {
          console.log("✅ Stream finished");
          break;
        }

        // STEP 3: Add the chunk to our buffer
        this.buffer.addChunk(value);

        // STEP 4: Extract complete lines from the buffer
        const completeLines = this.buffer.extractCompleteLines();

        // STEP 5: Parse each line and call the event handler
        for (const line of completeLines) {
          const event = this.parser.parseLine(line);
          if (event) {
            onEvent(event); // Call the function provided by the user
          }
        }
      }
    } catch (error) {
      console.error("❌ Stream processing failed:", error);
      throw error;
    } finally {
      // STEP 6: Always clean up, even if something went wrong
      if (reader) {
        reader.releaseLock(); // Release the reader so others can use it
      }
      this.buffer.clear(); // Clear the buffer
      console.log("🧹 Cleanup completed");
    }
  }
}

// =============================================================================
// 6. EVENT HANDLER - Handles different types of events
// =============================================================================

/**
 * Handles different types of events that come from the stream.
 * This is like a receptionist that routes messages to the right place.
 */
class EventHandler {
  /**
   * Handle a single event based on its type
   */
  handleEvent(event: StreamEvent): void {
    console.log(`📨 Received ${event.type} event`);

    switch (event.type) {
      case "status":
        if (event.status) {
          this.handleStatusUpdate(event.status);
        }
        break;

      case "final":
        if (event.result) {
          this.handleFinalResult(event.result);
        }
        break;

      case "error":
        if (event.error) {
          this.handleError(event.error);
        }
        break;

      default:
        console.warn("Unknown event type:", event.type);
    }
  }

  /**
   * Handle a status update (progress information)
   */
  private handleStatusUpdate(status: NonNullable<StreamEvent["status"]>): void {
    console.log(
      `⏳ Step ${status.step}: ${status.description} (${status.status})`
    );

    // Update the UI
    this.updateStatusInUI(status);
  }

  /**
   * Handle the final result
   */
  private handleFinalResult(result: NonNullable<StreamEvent["result"]>): void {
    console.log("🎉 Final result received!");
    console.log(`Response: ${result.response}`);
    console.log(`Execution time: ${result.executionTimeMs}ms`);
    console.log(`Tools used: ${result.toolsUsed.join(", ") || "None"}`);

    // Update the UI with final result
    this.showFinalResultInUI(result);
  }

  /**
   * Handle an error
   */
  private handleError(error: string): void {
    console.error("💥 Error occurred:", error);

    // Show error in UI
    this.showErrorInUI(error);
  }

  /**
   * Update status in the user interface
   */
  private updateStatusInUI(status: NonNullable<StreamEvent["status"]>): void {
    const statusElement = document.getElementById("chat-status");
    if (statusElement) {
      const statusHTML = `
        <div class="status-step status-${status.status}">
          <span class="step-number">${status.step}</span>
          <span class="step-description">${status.description}</span>
          <span class="step-status">${status.status}</span>
          <span class="step-time">${new Date(
            status.timestamp
          ).toLocaleTimeString()}</span>
        </div>
      `;
      statusElement.innerHTML += statusHTML;
    }
  }

  /**
   * Show final result in the user interface
   */
  private showFinalResultInUI(
    result: NonNullable<StreamEvent["result"]>
  ): void {
    // Show the main response
    const responseElement = document.getElementById("chat-response");
    if (responseElement) {
      responseElement.innerHTML = result.response;
    }

    // Show execution summary
    const summaryElement = document.getElementById("execution-summary");
    if (summaryElement) {
      summaryElement.innerHTML = `
        <div class="execution-summary">
          <h3>Execution Summary</h3>
          <p><strong>Time:</strong> ${result.executionTimeMs}ms</p>
          <p><strong>Tools used:</strong> ${
            result.toolsUsed.join(", ") || "None"
          }</p>
          <p><strong>Steps completed:</strong> ${result.steps.length}</p>
        </div>
      `;
    }
  }

  /**
   * Show error in the user interface
   */
  private showErrorInUI(error: string): void {
    const errorElement = document.getElementById("chat-error");
    if (errorElement) {
      errorElement.innerHTML = `
        <div class="error-message">
          <strong>❌ Error:</strong> ${error}
        </div>
      `;
      errorElement.style.display = "block";
    }
  }
}

// =============================================================================
// 7. MAIN FUNCTION - Simple and clean!
// =============================================================================

/**
 * The main function that puts everything together.
 * This is what you would call from your application.
 */
export async function queryWithStreaming(userQuery: string): Promise<void> {
  console.log(`🚀 Starting streaming query: "${userQuery}"`);

  // Create our components
  const processor = new StreamProcessor();
  const eventHandler = new EventHandler();

  // Process the stream, letting the event handler deal with each event
  await processor.processQuery(userQuery, (event: StreamEvent) => {
    eventHandler.handleEvent(event);
  });

  console.log("🏁 Streaming query completed!");
}

// =============================================================================
// 8. USAGE EXAMPLES
// =============================================================================

/**
 * Example 1: Basic usage
 */
export async function example1_BasicUsage(): Promise<void> {
  try {
    await queryWithStreaming("What is the weather like today?");
  } catch (error) {
    console.error("Example 1 failed:", error);
  }
}

/**
 * Example 2: Custom event handling
 */
export async function example2_CustomEventHandling(
  userQuery: string
): Promise<void> {
  const processor = new StreamProcessor();

  await processor.processQuery(userQuery, (event: StreamEvent) => {
    // Custom handling - just log everything
    console.log("📦 Custom handler received:", event);

    if (event.type === "status") {
      console.log("⏳ Progress update:", event.status?.description);
    } else if (event.type === "final") {
      console.log("🎯 Got final answer:", event.result?.response);
    }
  });
}

/**
 * Example 3: With error handling and UI updates
 */
export async function example3_WithErrorHandling(
  userQuery: string
): Promise<void> {
  // Clear previous results
  const statusEl = document.getElementById("chat-status");
  const responseEl = document.getElementById("chat-response");
  const errorEl = document.getElementById("chat-error");

  [statusEl, responseEl, errorEl].forEach((el) => {
    if (el) el.innerHTML = "";
  });

  try {
    // Show loading state
    if (statusEl) {
      statusEl.innerHTML =
        '<div class="loading">🔄 Processing your query...</div>';
    }

    // Run the streaming query
    await queryWithStreaming(userQuery);
  } catch (error) {
    // Handle any errors
    console.error("Streaming failed:", error);
    if (errorEl) {
      errorEl.innerHTML = `<div class="error">❌ Failed: ${error}</div>`;
    }
  }
}

/**
 * Example 4: Non-streaming version for comparison
 */
export async function example4_NonStreaming(
  userQuery: string
): Promise<StreamEvent["result"]> {
  console.log("📞 Making non-streaming request...");

  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: userQuery,
      streaming: false, // No real-time updates
    }),
  });

  if (!response.ok) {
    throw new Error(`Server error: ${response.status}`);
  }

  const result = await response.json();
  console.log("📋 Non-streaming result:", result);
  return result;
}

// =============================================================================
// 9. INITIALIZATION - Set up event listeners
// =============================================================================

/**
 * Set up the chat form when the page loads
 */
/*
export function initializeChatForm(): void {
  document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("chat-form") as HTMLFormElement;
    const input = document.getElementById("user-query") as HTMLInputElement;

    if (form && input) {
      form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const query = input.value.trim();
        if (!query) return;

        console.log("🎯 Form submitted with query:", query);

        try {
          await example3_WithErrorHandling(query);
        } catch (error) {
          console.error("Form submission failed:", error);
        }
      });
    }
  });
}
*/

// Initialize when this module is imported
//initializeChatForm();
