export interface StreamingResponse {
  content: string;
}

export interface ChatMessage {
  source: string;
  content: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
}

export class StreamingFetcher {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:8501') {
    this.baseUrl = baseUrl;
  }

  /**
   * Fetches streaming response from the Python backend
   * @param messages - Array of chat messages
   * @param onChunk - Callback function called for each chunk received
   * @param onComplete - Callback function called when stream completes
   * @param onError - Callback function called when an error occurs
   */
  async streamChatCompletion(
    messages: ChatMessage[],
    onChunk: (content: string) => void,
    onComplete?: () => void,
    onError?: (error: Error) => void
  ): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (!response.body) {
        throw new Error('Response body is null');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      try {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            break;
          }

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n').filter(line => line.trim());

          for (const line of lines) {
            try {
              const parsed: StreamingResponse = JSON.parse(line);
              if (parsed.content) {
                onChunk(parsed.content);
              }
            } catch (parseError) {
              // Skip malformed JSON lines
              console.warn('Failed to parse streaming response line:', line);
            }
          }
        }
      } finally {
        reader.releaseLock();
      }

      onComplete?.();
    } catch (error) {
      const errorMessage = error instanceof Error ? error : new Error('Unknown error occurred');
      onError?.(errorMessage);
    }
  }

  /**
   * Alternative method that returns a ReadableStream for more control
   */
  async getStreamingResponse(messages: ChatMessage[]): Promise<ReadableStream<StreamingResponse>> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (!response.body) {
      throw new Error('Response body is null');
    }

    return new ReadableStream({
      async start(controller) {
        const reader = response.body!.getReader();
        const decoder = new TextDecoder();

        try {
          while (true) {
            const { done, value } = await reader.read();
            
            if (done) {
              controller.close();
              break;
            }

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n').filter(line => line.trim());

            for (const line of lines) {
              try {
                const parsed: StreamingResponse = JSON.parse(line);
                controller.enqueue(parsed);
              } catch (parseError) {
                // Skip malformed JSON lines
                console.warn('Failed to parse streaming response line:', line);
              }
            }
          }
        } catch (error) {
          controller.error(error);
        } finally {
          reader.releaseLock();
        }
      },
    });
  }
}

// Default instance
export const streamingFetcher = new StreamingFetcher();

// Utility function for easy usage
export async function streamChatCompletion(
  messages: ChatMessage[],
  onChunk: (content: string) => void,
  onComplete?: () => void,
  onError?: (error: Error) => void
): Promise<void> {
  return streamingFetcher.streamChatCompletion(messages, onChunk, onComplete, onError);
} 