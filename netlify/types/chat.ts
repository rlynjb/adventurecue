// Status tracking interfaces
export interface ChatStatus {
  step: number;
  description: string;
  status: "pending" | "executing" | "completed" | "failed";
  timestamp: number;
  data?: any;
}

export interface ChatResponse {
  success: boolean;
  response: string;
  steps: ChatStatus[];
  toolsUsed: string[];
  executionTimeMs: number;
}
