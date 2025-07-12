# AutoGen TRPC Implementation

This implementation provides real-time WebSocket communication with the AutoGen backend through TRPC, offering type-safe, real-time chat functionality.

## Features

- **TRPC Integration**: Full TRPC integration with type safety
- **Real-time WebSocket communication**: Direct WebSocket connection to the AutoGen backend
- **Message type handling**: Support for different message types (UserInputRequestedEvent, error, system, regular messages)
- **Input state management**: Automatic enable/disable of input based on message types
- **Error handling**: Comprehensive error handling with user feedback
- **React hooks**: Easy-to-use custom hook for React components
- **Connection status monitoring**: Real-time connection status updates
- **Chat history**: Load and display chat history
- **Health checks**: Monitor backend server health

## Architecture

### TRPC Router Structure

The `autoGenRouter` provides the following procedures:

1. **sendMessage** - Send a message to the AutoGen backend
2. **receiveMessage** - Subscribe to real-time messages from the backend
3. **connectionStatus** - Subscribe to connection status changes
4. **errorStream** - Subscribe to error messages
5. **getHistory** - Get chat history from the backend
6. **healthCheck** - Check backend server health
7. **getAutoGen** - Basic health check endpoint

### WebSocket Connection

- **URL**: `ws://localhost:8002/ws/chat`
- **Protocol**: Standard WebSocket protocol
- **Message Format**: JSON
- **Connection Management**: Automatic reconnection and status monitoring

### Message Types

1. **UserInputRequestedEvent**

   ```json
   {
     "type": "UserInputRequestedEvent",
     "content": "User input requested",
     "source": "system",
     "timestamp": "2024-01-01T00:00:00Z"
   }
   ```

2. **Error Messages**

   ```json
   {
     "type": "error",
     "content": "Error message",
     "source": "system",
     "timestamp": "2024-01-01T00:00:00Z"
   }
   ```

3. **Regular Messages**

   ```json
   {
     "content": "Message content",
     "source": "user|assistant|system",
     "timestamp": "2024-01-01T00:00:00Z"
   }
   ```

4. **System Messages**
   ```json
   {
     "type": "system",
     "content": "Connection closed. Please refresh the page.",
     "source": "system",
     "timestamp": "2024-01-01T00:00:00Z"
   }
   ```

## Usage

### Using the React Hook

```tsx
import { useAutoGenChat } from "@/hooks/use-auto-gen-chat";

function MyComponent() {
  const {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    isInputEnabled,
    connectionStatus,
  } = useAutoGenChat({
    onComplete: () => console.log("Chat completed"),
    onError: (error) => console.error("Chat error:", error),
    onUserInputRequested: () => console.log("User input requested"),
    onConnectionStatusChange: (status) =>
      console.log("Connection status:", status),
  });

  const handleSend = async (content: string) => {
    await sendMessage(content);
  };

  return (
    <div>
      {/* Your chat UI */}
      <div>Status: {connectionStatus}</div>
      <input
        disabled={!isInputEnabled}
        placeholder={
          isInputEnabled ? "Type a message..." : "Waiting for response..."
        }
      />
      <button onClick={() => handleSend("Hello")} disabled={!isInputEnabled}>
        Send
      </button>
    </div>
  );
}
```

### Using the React Component

```tsx
import { AutoGenChat } from "@/components/chat/auto-gen-chat";

function MyPage() {
  return (
    <div>
      <h1>AutoGen Chat</h1>
      <AutoGenChat />
    </div>
  );
}
```

### Direct TRPC Usage

```tsx
import { trpc } from "@/lib/trpc/client";

function MyComponent() {
  // Send a message
  const sendMessageMutation = trpc.autoGen.sendMessage.useMutation();

  const handleSend = async (content: string) => {
    await sendMessageMutation.mutateAsync({
      content,
      source: "user",
    });
  };

  // Subscribe to messages
  trpc.autoGen.receiveMessage.useSubscription(undefined, {
    onData: (trackedMessage) => {
      const message = trackedMessage.data;
      console.log("Received message:", message);
    },
  });

  // Get history
  const historyQuery = trpc.autoGen.getHistory.useQuery({});

  // Check health
  const healthQuery = trpc.autoGen.healthCheck.useQuery();

  return (
    <div>
      <button onClick={() => handleSend("Hello")}>Send Message</button>
      <div>Health: {healthQuery.data?.status}</div>
      <div>History: {historyQuery.data?.length} messages</div>
    </div>
  );
}
```

## API Reference

### TRPC Router Procedures

#### sendMessage

Sends a message to the AutoGen backend.

```typescript
sendMessage: procedure
  .input(
    z.object({
      content: z.string(),
      source: z.string().optional().default("user"),
    })
  )
  .mutation(async ({ input }) => {
    // Implementation
  });
```

#### receiveMessage

Subscribes to real-time messages from the AutoGen backend.

```typescript
receiveMessage: procedure
  .input(
    z
      .object({
        lastEventId: z.string().nullish(),
      })
      .optional()
  )
  .subscription(async function* (opts) {
    // Implementation
  });
```

#### connectionStatus

Subscribes to connection status changes.

```typescript
connectionStatus: procedure.subscription(async function* (opts) {
  // Implementation
});
```

#### errorStream

Subscribes to error messages.

```typescript
errorStream: procedure.subscription(async function* (opts) {
  // Implementation
});
```

#### getHistory

Gets chat history from the backend.

```typescript
getHistory: procedure
  .input(
    z.object({
      sessionId: z.string().optional(),
    })
  )
  .query(async ({ input }) => {
    // Implementation
  });
```

#### healthCheck

Checks backend server health.

```typescript
healthCheck: procedure.query(async () => {
  // Implementation
});
```

## Hook API

### useAutoGenChat

#### Options

```typescript
interface UseAutoGenChatOptions {
  onComplete?: () => void;
  onError?: (error: Error) => void;
  onUserInputRequested?: () => void;
  onConnectionStatusChange?: (
    status: "connected" | "disconnected" | "connecting"
  ) => void;
}
```

#### Return Value

```typescript
interface UseAutoGenChatReturn {
  messages: AutoGenMessage[];
  isLoading: boolean;
  error: Error | null;
  sendMessage: (content: string) => Promise<void>;
  addMessage: (message: AutoGenMessage) => void;
  clearMessages: () => void;
  reset: () => void;
  isInputEnabled: boolean;
  connectionStatus: "connected" | "disconnected" | "connecting";
}
```

## Message Interface

```typescript
interface AutoGenMessage {
  type: "message" | "error" | "system" | "UserInputRequestedEvent";
  content: string;
  source?: string;
  timestamp?: string;
}
```

## Backend Requirements

The Python backend should:

1. Run on port 8002
2. Accept WebSocket connections at `/ws/chat`
3. Handle the following message types:
   - `UserInputRequestedEvent` - When user input is needed
   - `error` - For error messages
   - Regular messages with `content`, `source`, and optional `timestamp`
4. Provide a `/history` endpoint for chat history
5. Provide a `/health` endpoint for health checks

## Error Handling

The implementation handles various error scenarios:

- WebSocket connection errors
- Message parsing errors
- Network errors
- Server errors
- TRPC subscription errors

All errors are displayed to the user and logged to the console.

## State Management

The hook manages several states:

- **messages**: Array of all received messages
- **isLoading**: Whether a message is being processed
- **error**: Current error state
- **isInputEnabled**: Whether the input should be enabled
- **connectionStatus**: Current connection status

The input is automatically disabled when:

- A message is being sent
- The WebSocket connection is closed
- An error occurs

The input is automatically enabled when:

- A `UserInputRequestedEvent` is received
- An error message is received
- The connection is restored

## Connection Management

The implementation provides robust connection management:

- **Automatic reconnection**: WebSocket connections are automatically reestablished
- **Status monitoring**: Real-time connection status updates
- **Health checks**: Periodic health checks to ensure backend availability
- **Error recovery**: Automatic error recovery and user notification

## Testing

To test the implementation:

1. Start the Python backend server on port 8002
2. Navigate to `/auto-gen-chat` in the frontend
3. Send messages and observe real-time responses
4. Check connection status and error handling

## Comparison with Direct WebSocket Implementation

This TRPC-based implementation offers several advantages over direct WebSocket usage:

1. **Type Safety**: Full TypeScript support with automatic type inference
2. **Error Handling**: Built-in error handling and retry logic
3. **State Management**: Automatic state synchronization
4. **Developer Experience**: Better debugging and development tools
5. **Consistency**: Consistent API patterns across the application
6. **Caching**: Built-in caching and optimization
7. **Subscriptions**: Efficient real-time subscriptions with automatic cleanup

## Migration from Direct WebSocket

If migrating from direct WebSocket implementation:

1. Replace direct WebSocket calls with TRPC procedures
2. Update message handling to use TRPC subscriptions
3. Use the new `useAutoGenChat` hook instead of custom WebSocket logic
4. Update error handling to use TRPC error patterns
5. Test thoroughly to ensure all functionality works as expected
