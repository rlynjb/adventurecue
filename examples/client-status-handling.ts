/**
 * Client-side examples for handling status updates from the chat system
 */

// Example 1: Regular request with full status information
async function queryWithStatus(userQuery: string) {
  try {
    const response = await fetch("/api/query-with-status", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: userQuery,
        streaming: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    // Handle the complete response with status information
    console.log("Chat Response:", result);
    console.log("Execution Time:", result.executionTimeMs + "ms");
    console.log("Tools Used:", result.toolsUsed);

    // Display status steps to user
    result.steps.forEach((step, index) => {
      console.log(`Step ${step.step}: ${step.description} (${step.status})`);
      updateStatusUI(step, index);
    });

    return result;
  } catch (error) {
    console.error("Query failed:", error);
    throw error;
  }
}

// Example 2: Streaming request with real-time updates
async function queryWithStreaming(userQuery: string) {
  try {
    const response = await fetch("/api/query-with-status", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: userQuery,
        streaming: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error("Response body is not readable");
    }

    let buffer = "";

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Process complete messages
        const lines = buffer.split("\n");
        buffer = lines.pop() || ""; // Keep incomplete line in buffer

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const eventData = JSON.parse(line.slice(6));
              handleStreamingEvent(eventData);
            } catch (e) {
              console.error("Failed to parse streaming data:", e);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  } catch (error) {
    console.error("Streaming query failed:", error);
    throw error;
  }
}

// Handle different types of streaming events
function handleStreamingEvent(eventData: any) {
  switch (eventData.type) {
    case "status":
      updateStatusUI(eventData.status);
      break;
    case "final":
      handleFinalResponse(eventData.result);
      break;
    case "error":
      handleError(eventData.error);
      break;
    default:
      console.log("Unknown event type:", eventData.type);
  }
}

// UI update functions (these would be implemented based on your UI framework)
function updateStatusUI(status: any, stepIndex?: number) {
  // Example React-style status update
  const statusElement = document.getElementById("chat-status");
  if (statusElement) {
    const statusHTML = `
      <div class="status-step ${status.status}">
        <span class="step-number">${status.step}</span>
        <span class="step-description">${status.description}</span>
        <span class="step-status">${status.status}</span>
        <small class="step-time">${new Date(
          status.timestamp
        ).toLocaleTimeString()}</small>
      </div>
    `;

    if (stepIndex !== undefined) {
      // Replace existing step
      const existingStep = statusElement.children[stepIndex];
      if (existingStep) {
        existingStep.outerHTML = statusHTML;
      } else {
        statusElement.innerHTML += statusHTML;
      }
    } else {
      // Append new step
      statusElement.innerHTML += statusHTML;
    }
  }
}

function handleFinalResponse(result: any) {
  console.log("Final response received:", result);

  // Update the main response area
  const responseElement = document.getElementById("chat-response");
  if (responseElement) {
    responseElement.innerHTML = result.response;
  }

  // Show execution summary
  const summaryElement = document.getElementById("execution-summary");
  if (summaryElement) {
    summaryElement.innerHTML = `
      <div class="execution-summary">
        <p>Execution completed in ${result.executionTimeMs}ms</p>
        <p>Tools used: ${result.toolsUsed.join(", ") || "None"}</p>
        <p>Steps completed: ${result.steps.length}</p>
      </div>
    `;
  }
}

function handleError(error: string) {
  console.error("Chat error:", error);

  const errorElement = document.getElementById("chat-error");
  if (errorElement) {
    errorElement.innerHTML = `
      <div class="error-message">
        <strong>Error:</strong> ${error}
      </div>
    `;
    errorElement.style.display = "block";
  }
}

// Example usage with a simple form
function setupChatForm() {
  const form = document.getElementById("chat-form") as HTMLFormElement;
  const input = document.getElementById("user-query") as HTMLInputElement;

  if (form && input) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const query = input.value.trim();
      if (!query) return;

      // Clear previous results
      clearChatUI();

      // Show loading state
      showLoadingState();

      try {
        // Use streaming for real-time updates
        await queryWithStreaming(query);
      } catch (error) {
        handleError(error instanceof Error ? error.message : "Unknown error");
      } finally {
        hideLoadingState();
      }
    });
  }
}

function clearChatUI() {
  const elements = [
    "chat-status",
    "chat-response",
    "execution-summary",
    "chat-error",
  ];
  elements.forEach((id) => {
    const element = document.getElementById(id);
    if (element) {
      element.innerHTML = "";
      element.style.display = "none";
    }
  });
}

function showLoadingState() {
  const loadingElement = document.getElementById("loading-indicator");
  if (loadingElement) {
    loadingElement.style.display = "block";
  }
}

function hideLoadingState() {
  const loadingElement = document.getElementById("loading-indicator");
  if (loadingElement) {
    loadingElement.style.display = "none";
  }
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", setupChatForm);

// Export for use in other modules
export {
  handleError,
  handleFinalResponse,
  queryWithStatus,
  queryWithStreaming,
  updateStatusUI,
};
