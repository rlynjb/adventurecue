/* eslint-disable @typescript-eslint/no-explicit-any */

import { ChatStatus } from "../types/chat";

/**
 * Creates a status update with standardized structure
 * @param step The step number in the process
 * @param description Human-readable description of the current step
 * @param status The current status of the step
 * @param data Optional additional data to include with the status
 * @returns A properly formatted ChatStatus object
 */
export const createStatus = (
  step: number,
  description: string,
  status: ChatStatus["status"],
  data?: any
): ChatStatus => {
  return {
    step,
    description,
    status,
    timestamp: Date.now(),
    data,
  };
};

/**
 * Status tracking manager for chat operations
 * Provides a centralized way to manage and track status updates throughout the chat process
 */
export class ChatStatusTracker {
  private steps: ChatStatus[] = [];
  private onStatusUpdate?: (status: ChatStatus) => void;

  constructor(onStatusUpdate?: (status: ChatStatus) => void) {
    this.onStatusUpdate = onStatusUpdate;
  }

  /**
   * Updates the status and notifies listeners
   * @param status The status update to record and broadcast
   */
  updateStatus(status: ChatStatus): void {
    this.steps.push(status);
    this.onStatusUpdate?.(status);
  }

  /**
   * Convenience method to create and update status in one call
   * @param step Step number
   * @param description Status description
   * @param status Status type
   * @param data Optional additional data
   */
  update(
    step: number,
    description: string,
    status: ChatStatus["status"],
    data?: any
  ): void {
    const statusUpdate = createStatus(step, description, status, data);
    this.updateStatus(statusUpdate);
  }

  /**
   * Get all recorded status updates
   * @returns Array of all status updates
   */
  getSteps(): ChatStatus[] {
    return [...this.steps];
  }

  /**
   * Get the latest status update
   * @returns The most recent status update, or null if none exist
   */
  getLatestStatus(): ChatStatus | null {
    return this.steps.length > 0 ? this.steps[this.steps.length - 1] : null;
  }

  /**
   * Check if any step has failed
   * @returns True if any step has failed status
   */
  hasFailures(): boolean {
    return this.steps.some((step) => step.status === "failed");
  }

  /**
   * Get all failed steps
   * @returns Array of failed status updates
   */
  getFailures(): ChatStatus[] {
    return this.steps.filter((step) => step.status === "failed");
  }

  /**
   * Mark a step as executing
   * @param step Step number
   * @param description Status description
   * @param data Optional additional data
   */
  executing(step: number, description: string, data?: any): void {
    this.update(step, description, "executing", data);
  }

  /**
   * Mark a step as completed
   * @param step Step number
   * @param description Status description
   * @param data Optional additional data
   */
  completed(step: number, description: string, data?: any): void {
    this.update(step, description, "completed", data);
  }

  /**
   * Mark a step as failed
   * @param step Step number
   * @param description Status description
   * @param data Optional additional data (typically error information)
   */
  failed(step: number, description: string, data?: any): void {
    this.update(step, description, "failed", data);
  }

  /**
   * Mark a step as pending
   * @param step Step number
   * @param description Status description
   * @param data Optional additional data
   */
  pending(step: number, description: string, data?: any): void {
    this.update(step, description, "pending", data);
  }

  /**
   * Reset the status tracker (clear all steps)
   */
  reset(): void {
    this.steps = [];
  }

  /**
   * Get execution summary
   * @returns Object with summary statistics
   */
  getSummary(): {
    totalSteps: number;
    completed: number;
    failed: number;
    executing: number;
    pending: number;
    duration: number;
  } {
    const completed = this.steps.filter((s) => s.status === "completed").length;
    const failed = this.steps.filter((s) => s.status === "failed").length;
    const executing = this.steps.filter((s) => s.status === "executing").length;
    const pending = this.steps.filter((s) => s.status === "pending").length;

    const startTime =
      this.steps.length > 0 ? this.steps[0].timestamp : Date.now();
    const endTime =
      this.steps.length > 0
        ? this.steps[this.steps.length - 1].timestamp
        : Date.now();

    return {
      totalSteps: this.steps.length,
      completed,
      failed,
      executing,
      pending,
      duration: endTime - startTime,
    };
  }
}

/**
 * Pre-defined status messages for common chat operations
 */
export const ChatStatusMessages = {
  // Query processing
  ANALYZING_QUERY: "Analyzing your query and preparing request",
  QUERY_PREPARED: "Query prepared, calling OpenAI",

  // OpenAI interactions
  WAITING_OPENAI: "Waiting for OpenAI response",
  RECEIVED_RESPONSE: "Received initial response from OpenAI",
  SENDING_TOOL_RESULTS: "Sending tool results back to OpenAI",
  RECEIVED_FINAL: "Received final response from OpenAI",

  // Tool execution
  EXECUTING_TOOL: (toolType: string) => `Executing ${toolType}`,
  TOOL_COMPLETED: (toolType: string) => `${toolType} completed successfully`,
  TOOL_FAILED: (toolType: string, error: string) =>
    `${toolType} failed: ${error}`,

  // Web search
  WEB_SEARCH_START: "Searching the web for relevant information",
  WEB_SEARCH_COMPLETE: "Web search completed",

  // API calls
  API_CALL_START: "Calling external API for additional data",
  API_CALL_COMPLETE: "API call completed successfully",

  // Database operations
  DB_LOOKUP_START: "Searching database for relevant records",
  DB_LOOKUP_COMPLETE: "Database lookup completed",

  // Completion
  RESPONSE_COMPLETE: "Response generation completed",
  RESPONSE_COMPLETE_NO_TOOLS: "Response generation completed (no tools needed)",

  // Errors
  ERROR_OCCURRED: (error: string) => `Error occurred: ${error}`,
} as const;
