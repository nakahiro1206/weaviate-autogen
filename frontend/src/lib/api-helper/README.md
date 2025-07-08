# API Helper - Streaming Chat

This module provides functionality to interact with the Python backend's streaming chat API.

## Features

- Real-time streaming responses from Python backend
- TypeScript interfaces for type safety
- React hook for easy integration
- Error handling and abort functionality
- Support for chat history

## Usage

### Basic Usage with StreamingFetcher

```typescript
import { StreamingFetcher, ChatMessage } from "@/lib/api-helper/streaming";

const fetcher = new StreamingFetcher("http://localhost:8501");

const messages: ChatMessage[] = [
  { source: "user", content: "Hello, how are you?" },
];

await fetcher.streamChatCompletion(
  messages,
  (chunk) => {
    console.log("Received chunk:", chunk);
  },
  () => {
    console.log("Stream completed");
  },
  (error) => {
    console.error("Stream error:", error);
  }
);
```

### Using the React Hook

```typescript
import { useStreamingChat } from "@/hooks/use-streaming-chat";

function MyChatComponent() {
  const {
    messages,
    currentResponse,
    isLoading,
    error,
    sendMessage,
    clearMessages,
  } = useStreamingChat({
    onComplete: () => console.log("Chat completed"),
    onError: (error) => console.error("Chat error:", error),
  });

  const handleSend = async (content: string) => {
    await sendMessage(content);
  };

  return <div>{/* Your chat UI */}</div>;
}
```

### Using ReadableStream

```typescript
import { StreamingFetcher } from "@/lib/api-helper/streaming";

const fetcher = new StreamingFetcher();
const stream = await fetcher.getStreamingResponse(messages);

const reader = stream.getReader();
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  console.log("Received:", value.content);
}
```

## API Reference

### StreamingFetcher

#### Constructor

```typescript
new StreamingFetcher(baseUrl?: string)
```

#### Methods

##### streamChatCompletion

```typescript
async streamChatCompletion(
  messages: ChatMessage[],
  onChunk: (content: string) => void,
  onComplete?: () => void,
  onError?: (error: Error) => void
): Promise<void>
```

##### getStreamingResponse

```typescript
async getStreamingResponse(messages: ChatMessage[]): Promise<ReadableStream<StreamingResponse>>
```

### useStreamingChat Hook

#### Options

```typescript
interface UseStreamingChatOptions {
  onComplete?: () => void;
  onError?: (error: Error) => void;
}
```

#### Return Value

```typescript
interface UseStreamingChatReturn {
  messages: ChatMessage[];
  currentResponse: string;
  isLoading: boolean;
  error: Error | null;
  sendMessage: (content: string) => Promise<void>;
  addMessage: (message: ChatMessage) => void;
  clearMessages: () => void;
  reset: () => void;
}
```

## Python Backend Requirements

The Python backend should:

1. Run on port 8501 (default)
2. Accept POST requests to `/chat/completions`
3. Return streaming responses in the format:
   ```
   {"content": "chunk1"}\n
   {"content": "chunk2"}\n
   {"content": "chunk3"}\n
   ```
4. Accept request body in the format:
   ```json
   {
     "messages": [
       { "source": "user", "content": "Hello" },
       { "source": "assistant", "content": "Hi there!" }
     ]
   }
   ```

## Error Handling

The fetcher handles various error scenarios:

- Network errors
- HTTP status errors
- JSON parsing errors
- Stream interruption

All errors are passed to the error callback or thrown as appropriate.

## CORS Configuration

Make sure your Python backend has CORS configured to allow requests from your frontend domain:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```
