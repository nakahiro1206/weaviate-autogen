# Server-Sent Events (SSE) for Document Summarization

This implementation provides real-time streaming document summarization using Server-Sent Events (SSE). Users can see the summary being generated in real-time as chunks arrive from the OpenAI API.

## Features

- **Real-time streaming**: Watch summaries appear as they're generated
- **Error handling**: Graceful error handling with user feedback
- **React hooks**: Easy-to-use custom hook for React components
- **Type safety**: Full TypeScript support
- **Backward compatibility**: Original non-streaming API still works

## API Endpoints

### 1. Streaming Endpoint (SSE)

```
POST /api/summarize/stream
```

**Request Body:**

```json
{
  "text": "Your document text here..."
}
```

**Response:** Server-Sent Events stream with chunks:

```
data: {"chunk": "This is the first part of the summary..."}

data: {"chunk": "This is the second part..."}

data: [DONE]
```

### 2. Traditional Endpoint (Non-streaming)

```
POST /api/summarize
```

**Request Body:**

```json
{
  "text": "Your document text here..."
}
```

**Response:**

```json
{
  "summary": "Complete summary text..."
}
```

## Usage

### Using the React Hook

```tsx
import { useSummarizeStream } from "@/lib/hooks/use-summarize-stream";

function MyComponent() {
  const { summary, isStreaming, error, startStream, reset } =
    useSummarizeStream();

  const handleSummarize = async () => {
    await startStream("Your document text here...");
  };

  return (
    <div>
      <button onClick={handleSummarize} disabled={isStreaming}>
        {isStreaming ? "Summarizing..." : "Start Summary"}
      </button>

      {error && <div className="error">{error}</div>}

      {summary && (
        <div>
          <h3>Summary:</h3>
          <p>{summary}</p>
          {isStreaming && <span>Generating...</span>}
        </div>
      )}
    </div>
  );
}
```

### Using the API Helper Directly

```tsx
import { summarizeDocumentStream } from "@/lib/api-helper/summarize";

const handleStream = async () => {
  await summarizeDocumentStream(
    "Your document text here...",
    (chunk) => {
      console.log("Received chunk:", chunk);
      // Update UI with new chunk
    },
    (error) => {
      console.error("Stream error:", error);
      // Handle error
    },
    () => {
      console.log("Stream completed");
      // Handle completion
    }
  );
};
```

## Demo Page

Visit `/summarize-stream` to see a working demo of the SSE functionality.

## Implementation Details

### Backend Components

1. **`/api/summarize/stream/route.ts`**: SSE endpoint that streams summary chunks
2. **`/lib/openai/summary.ts`**: Contains both streaming and non-streaming functions
3. **`/lib/api-helper/summarize.ts`**: Client-side helper functions

### Frontend Components

1. **`/lib/hooks/use-summarize-stream.ts`**: React hook for easy SSE integration
2. **`/components/summarize/summarize-stream.tsx`**: Example component
3. **`/app/summarize-stream/page.tsx`**: Demo page

### Key Features

- **Chunked streaming**: Each piece of the summary is sent as it's generated
- **Error recovery**: Proper error handling for network issues
- **State management**: Built-in loading and error states
- **Type safety**: Full TypeScript support with proper types
- **Accessibility**: Proper ARIA labels and keyboard navigation

## Error Handling

The implementation handles various error scenarios:

- Network connection issues
- Invalid input data
- OpenAI API errors
- Stream parsing errors

Errors are displayed to users with clear messages and the ability to retry.

## Performance Considerations

- Uses `ReadableStream` for efficient streaming
- Proper cleanup of event listeners
- Memory-efficient chunk processing
- Connection keep-alive for long summaries
