import { Ingest } from "@/components/ingest";
import { Query } from "@/components/query";

export default function Home() {
  return (
    <div className="app-container">
      <header className="app-container__header">
        <h2 className="antialiased text-[2em] text-slate-500 font-semibold">
          advntrQ
        </h2>
      </header>

      <Query />

      <div className="ingest-mode invisible">
        {/**
         * Backlog features:
         * - Add a "New Ingest" button to allow users to create custom ingests
         * - Implement an "Ingest Executor" interface to handle different ingest types
         * - Add an "Ingest" history to track executed ingests
         * - Implement an "Ingest" editor to modify existing ingests
         * - Add an "Ingest" search feature to find specific ingests
         * - Implement an "Ingest" validation to ensure correct parameters
         * - Add an "Ingest" documentation to explain each ingest's usage
         * - Implement an "Ingest" testing feature to simulate ingest execution
         * - Add an "Ingest" analytics to track usage and performance
         * - Implement an "Ingest" versioning to manage changes over time
         */}
        <Ingest />
      </div>

      {/**
       * Backlog features:
       * - Add a "New Tool" button to allow users to create custom tools
       * - Implement a "Tool Executor" interface to handle different tool types
       * - Add a "Tool Call" history to track executed tools
       * - Implement a "Tool Call" editor to modify existing tool calls
       * - Add a "Tool Call" search feature to find specific tool calls
       * - Implement a "Tool Call" validation to ensure correct parameters
       * - Add a "Tool Call" documentation to explain each tool's usage
       * - Implement a "Tool Call" testing feature to simulate tool execution
       * - Add a "Tool Call" analytics to track usage and performance
       * - Implement a "Tool Call" versioning to manage changes over time
       */}

      {/**
       * Backlog feature:
       * - add a button to clear chat history
       */}
    </div>
  );
}
