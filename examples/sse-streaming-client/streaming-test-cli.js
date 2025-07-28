#!/usr/bin/env node

/**
 * Node.js CLI Test for SSE Streaming Endpoint
 *
 * This script tests ONLY the streaming functionality of the query-with-status endpoint.
 * It focuses on Server-Sent Events parsing and real-time status updates.
 *
 * Usage:
 *   node streaming-test-cli.js "Your test query here"
 *   node streaming-test-cli.js
 */

const API_URL = "http://localhost:8888/.netlify/functions/query-with-status";

// ANSI color codes for terminal output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  gray: "\x1b[90m",
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

function logWithTimestamp(message, color = "reset") {
  const timestamp = new Date().toLocaleTimeString();
  console.log(
    `${colors.gray}[${timestamp}]${colors.reset} ${colorize(message, color)}`
  );
}

async function testStreamingEndpoint(query) {
  console.log(colorize("🧪 SSE Streaming Endpoint Test", "bright"));
  console.log(colorize("=".repeat(50), "gray"));
  console.log(`${colorize("Query:", "cyan")} ${query}`);
  console.log(`${colorize("Endpoint:", "cyan")} ${API_URL}`);
  console.log("");

  const stats = {
    startTime: Date.now(),
    totalEvents: 0,
    statusEvents: 0,
    executionTime: null,
    errors: [],
  };

  try {
    logWithTimestamp("🔌 Initiating streaming connection...", "blue");

    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: query,
        streaming: true, // This is the key - we only test streaming
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    // Verify we got the right content type for SSE
    const contentType = response.headers.get("content-type");
    if (!contentType?.includes("text/event-stream")) {
      console.warn(
        colorize(
          `⚠️ Warning: Expected 'text/event-stream', got '${contentType}'`,
          "yellow"
        )
      );
    }

    logWithTimestamp("✅ Connection established, reading stream...", "green");
    console.log("");

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        logWithTimestamp("🏁 Stream ended naturally", "green");
        break;
      }

      buffer += decoder.decode(value, { stream: true });

      // Process complete lines (SSE format)
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          try {
            const eventData = JSON.parse(line.slice(6));
            handleStreamEvent(eventData, stats);
          } catch (error) {
            logWithTimestamp(`❌ Failed to parse event: ${line}`, "red");
            stats.errors.push(`Parse error: ${error.message}`);
          }
        } else if (line.trim()) {
          // Non-data lines (might be comments or other SSE fields)
          logWithTimestamp(`📝 Non-data line: ${line}`, "gray");
        }
      }
    }

    reader.releaseLock();
  } catch (error) {
    logWithTimestamp(`💥 Connection error: ${error.message}`, "red");
    stats.errors.push(`Connection error: ${error.message}`);
  }

  // Print summary
  printTestSummary(stats);
}

function handleStreamEvent(eventData, stats) {
  stats.totalEvents++;

  switch (eventData.type) {
    case "status":
      if (eventData.status) {
        stats.statusEvents++;
        const { step, description, status } = eventData.status;
        const statusColor = getStatusColor(status);
        logWithTimestamp(
          `📊 Step ${step}: ${description} (${colorize(
            status.toUpperCase(),
            statusColor
          )})`,
          "blue"
        );
      }
      break;

    case "final":
      if (eventData.result) {
        const { response, executionTimeMs, toolsUsed, steps } =
          eventData.result;
        stats.executionTime = executionTimeMs;

        logWithTimestamp("🎉 Final result received!", "green");
        logWithTimestamp(`⏱️  Execution time: ${executionTimeMs}ms`, "cyan");
        logWithTimestamp(
          `🛠️  Tools used: ${toolsUsed.join(", ") || "None"}`,
          "cyan"
        );
        logWithTimestamp(`📋 Total steps: ${steps.length}`, "cyan");
        logWithTimestamp(
          `💬 Response preview: ${response.substring(0, 100)}...`,
          "magenta"
        );
      }
      break;

    case "error":
      logWithTimestamp(`💥 Stream error: ${eventData.error}`, "red");
      stats.errors.push(`Stream error: ${eventData.error}`);
      break;

    default:
      logWithTimestamp(`❓ Unknown event type: ${eventData.type}`, "yellow");
      console.log(colorize(JSON.stringify(eventData, null, 2), "gray"));
  }
}

function getStatusColor(status) {
  switch (status) {
    case "starting":
      return "yellow";
    case "in_progress":
      return "blue";
    case "completed":
      return "green";
    case "error":
      return "red";
    default:
      return "gray";
  }
}

function printTestSummary(stats) {
  const duration = Date.now() - stats.startTime;

  console.log("");
  console.log(colorize("📊 Test Summary", "bright"));
  console.log(colorize("=".repeat(30), "gray"));
  console.log(
    `${colorize("Stream Duration:", "cyan")} ${(duration / 1000).toFixed(2)}s`
  );
  console.log(`${colorize("Total Events:", "cyan")} ${stats.totalEvents}`);
  console.log(`${colorize("Status Updates:", "cyan")} ${stats.statusEvents}`);
  console.log(
    `${colorize("Server Execution Time:", "cyan")} ${
      stats.executionTime ? stats.executionTime + "ms" : "N/A"
    }`
  );
  console.log(`${colorize("Errors:", "cyan")} ${stats.errors.length}`);

  if (stats.errors.length > 0) {
    console.log("");
    console.log(colorize("❌ Errors encountered:", "red"));
    stats.errors.forEach((error, index) => {
      console.log(`  ${index + 1}. ${error}`);
    });
  }

  console.log("");
  if (stats.errors.length === 0 && stats.totalEvents > 0) {
    console.log(colorize("✅ Streaming test completed successfully!", "green"));
  } else if (stats.totalEvents === 0) {
    console.log(
      colorize("⚠️ No events received - check if endpoint is working", "yellow")
    );
  } else {
    console.log(colorize("⚠️ Test completed with some issues", "yellow"));
  }
}

// Test queries for easy testing
const TEST_QUERIES = [
  "What are the best places to visit in Tokyo?",
  "Tell me about Paris attractions",
  "Plan a 3-day trip to Rome",
  "Best hiking trails in Switzerland",
  "Cultural experiences in Kyoto",
];

async function main() {
  // Check if fetch is available (Node 18+)
  if (typeof fetch === "undefined") {
    console.error(
      colorize("❌ This script requires Node.js 18+ with built-in fetch", "red")
    );
    console.error("Alternative: npm install node-fetch and modify the script");
    process.exit(1);
  }

  // Get query from command line or use default
  let query = process.argv[2];

  if (!query) {
    console.log(
      colorize("No query provided. Using default test query.", "yellow")
    );
    console.log(
      colorize('Usage: node streaming-test-cli.js "Your query here"', "gray")
    );
    console.log("");
    query = TEST_QUERIES[0];
  }

  console.log(
    colorize(
      "🚀 Make sure your Netlify dev server is running on localhost:8888",
      "bright"
    )
  );
  console.log("");

  await testStreamingEndpoint(query);
}

// Handle Ctrl+C gracefully
process.on("SIGINT", () => {
  console.log("");
  console.log(colorize("🛑 Test interrupted by user", "yellow"));
  process.exit(0);
});

main().catch((error) => {
  console.error(colorize(`💥 Unexpected error: ${error.message}`, "red"));
  process.exit(1);
});
