/**
 * Example usage of the Chat Status Tracking system
 * This file demonstrates how to use the refactored status tracking functionality
 */

import {
  ChatStatusMessages,
  ChatStatusTracker,
  createStatus,
} from "./status-tracking";

// Example 1: Basic usage with callback
export const basicStatusTrackingExample = async () => {
  // Create a status tracker with a callback
  const statusTracker = new ChatStatusTracker((status) => {
    console.log(
      `[${status.status.toUpperCase()}] Step ${status.step}: ${
        status.description
      }`
    );
  });

  // Track different steps of a process
  statusTracker.executing(1, "Starting process");
  await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate work

  statusTracker.completed(1, "Process completed successfully");

  // Get summary
  const summary = statusTracker.getSummary();
  console.log("Process Summary:", summary);
};

// Example 2: Using predefined messages
export const predefinedMessagesExample = async () => {
  const statusTracker = new ChatStatusTracker();

  // Use predefined messages for common operations
  statusTracker.executing(1, ChatStatusMessages.ANALYZING_QUERY);
  statusTracker.completed(1, ChatStatusMessages.QUERY_PREPARED);

  statusTracker.executing(2, ChatStatusMessages.WEB_SEARCH_START);
  statusTracker.completed(2, ChatStatusMessages.WEB_SEARCH_COMPLETE);

  // Check for failures
  if (statusTracker.hasFailures()) {
    console.log("Process had failures:", statusTracker.getFailures());
  }

  console.log("All steps:", statusTracker.getSteps());
};

// Example 3: Error handling
export const errorHandlingExample = async () => {
  const statusTracker = new ChatStatusTracker();

  try {
    statusTracker.executing(1, "Attempting risky operation");

    // Simulate an error
    throw new Error("Something went wrong!");
  } catch (error) {
    statusTracker.failed(1, `Operation failed: ${error}`, { error });
  }

  // Get failure details
  const failures = statusTracker.getFailures();
  console.log("Failures:", failures);
};

// Example 4: Custom status creation
export const customStatusExample = () => {
  const customStatus = createStatus(
    1,
    "Custom operation in progress",
    "executing",
    { customData: "example", timestamp: new Date() }
  );

  console.log("Custom status:", customStatus);
};

// Example 5: Integration with existing chat function
export const integrationExample = async () => {
  const statusTracker = new ChatStatusTracker((status) => {
    // This could be sent to a WebSocket, logged, or used to update UI
    console.log(`Status Update: ${status.description} (${status.status})`);
  });

  // Example of how you might use this in your chat service
  statusTracker.executing(1, ChatStatusMessages.ANALYZING_QUERY);

  // Simulate some async work
  await new Promise((resolve) => setTimeout(resolve, 500));

  statusTracker.completed(1, ChatStatusMessages.QUERY_PREPARED);
  statusTracker.executing(2, ChatStatusMessages.WAITING_OPENAI);

  // Get the latest status
  const latest = statusTracker.getLatestStatus();
  console.log("Latest status:", latest);

  return statusTracker.getSteps();
};
