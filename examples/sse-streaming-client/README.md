# SSE Streaming Client Test Suite

This directory contains test files specifically for testing the **streaming functionality** of the `query-with-status` endpoint before implementing it in the UI.

## 📁 Test Files

### 1. `streaming-test.html` - Visual Web Test

A comprehensive HTML test interface with real-time event logging.

**Features:**

- ✅ Real-time streaming event display
- ✅ Quick test queries
- ✅ Event statistics and timing
- ✅ Export test logs
- ✅ Connection status indicators
- ✅ Auto-scrolling event log

**How to use:**

```bash
# 1. Start your Netlify dev server
netlify dev

# 2. Open the test file in your browser
open examples/sse-streaming-client/streaming-test.html
# OR visit: http://localhost:8888/examples/sse-streaming-client/streaming-test.html
```

### 2. `streaming-test-cli.js` - Command Line Test

A Node.js CLI script for testing streaming functionality with detailed terminal output.

**Features:**

- ✅ Colored terminal output
- ✅ Real-time event parsing
- ✅ Detailed test statistics
- ✅ Error handling and reporting
- ✅ Timestamp logging

**How to use:**

```bash
# Default test query
node examples/sse-streaming-client/streaming-test-cli.js

# Custom query
node examples/sse-streaming-client/streaming-test-cli.js "Tell me about Tokyo attractions"

# Make sure Netlify dev server is running first:
netlify dev
```

## 🎯 What These Tests Focus On

### Streaming-Specific Features:

1. **Server-Sent Events Format** - Verifies proper SSE data format
2. **Real-time Updates** - Tests status updates as they happen
3. **Event Types** - Validates `status`, `final`, and `error` events
4. **Connection Handling** - Tests stream start, progress, and completion
5. **Buffer Management** - Ensures partial data is handled correctly
6. **Error Recovery** - Tests error scenarios and cleanup

### Expected Event Flow:

```
1. 🔌 Connection established
2. 📊 Status: "Starting query processing..."
3. 📊 Status: "Searching vector database..."
4. 📊 Status: "Calling OpenAI API..."
5. 📊 Status: "Processing response..."
6. 🎉 Final: Complete response with metadata
7. 🏁 Stream closed
```

## 🔍 Testing Scenarios

### Basic Streaming Test:

```javascript
// What gets sent to endpoint
{
  "query": "What are the best places in Tokyo?",
  "streaming": true  // This enables SSE streaming
}
```

### Expected SSE Response Format:

```
data: {"type": "status", "status": {"step": 1, "description": "Starting...", "status": "starting"}}

data: {"type": "status", "status": {"step": 2, "description": "Processing...", "status": "in_progress"}}

data: {"type": "final", "result": {"response": "Here's your answer...", "executionTimeMs": 1500}}
```

## 🚀 Quick Start

1. **Start your development server:**

   ```bash
   netlify dev
   ```

2. **Choose your testing method:**

   **Visual Test (Recommended):**

   ```bash
   open examples/sse-streaming-client/streaming-test.html
   ```

   **CLI Test:**

   ```bash
   node examples/sse-streaming-client/streaming-test-cli.js
   ```

3. **Watch for these key indicators:**
   - ✅ Connection established
   - ✅ Status events received in real-time
   - ✅ Final result with execution data
   - ✅ Clean stream termination

## 🐛 Troubleshooting

### Common Issues:

**No events received:**

- Check if Netlify dev server is running on localhost:8888
- Verify the endpoint URL is correct
- Check browser console for CORS errors

**Parse errors:**

- Verify your endpoint sends proper SSE format: `data: {json}\n\n`
- Check that JSON is valid in each data line

**Connection drops:**

- Test with shorter queries first
- Check server logs for errors
- Verify no firewall blocking localhost connections

### Debug Output:

Both test files provide detailed logging:

- **HTML version**: Visual event log with timestamps
- **CLI version**: Colored terminal output with statistics

## 📊 What Success Looks Like

**Successful streaming test should show:**

1. 🔌 **Connection**: Establishes SSE connection
2. 📊 **Status Events**: Multiple status updates during processing
3. 🎉 **Final Event**: Complete response with metadata
4. 📈 **Statistics**: Execution time, event counts, tools used
5. 🏁 **Clean Exit**: Stream closes without errors

**Example successful output:**

```
Total Events: 5
Status Updates: 4
Execution Time: 1,250ms
Stream Duration: 1.3s
Errors: 0
✅ Streaming test completed successfully!
```

This test suite ensures your streaming endpoint works perfectly before you integrate it with your UI components! 🎯
