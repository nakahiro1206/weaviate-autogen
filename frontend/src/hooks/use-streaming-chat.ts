import { useState, useCallback, useRef } from 'react';
import { streamChatCompletion, ChatMessage } from '@/lib/api-helper/streaming';

export interface UseStreamingChatOptions {
  onComplete?: () => void;
  onError?: (error: Error) => void;
}

export interface UseStreamingChatReturn {
  messages: ChatMessage[];
  currentResponse: string;
  isLoading: boolean;
  error: Error | null;
  sendMessage: (content: string) => Promise<void>;
  addMessage: (message: ChatMessage) => void;
  clearMessages: () => void;
  reset: () => void;
}

export function useStreamingChat(options: UseStreamingChatOptions = {}): UseStreamingChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentResponse, setCurrentResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);

  const addMessage = useCallback((message: ChatMessage) => {
    setMessages(prev => [...prev, message]);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setCurrentResponse('');
    setError(null);
  }, []);

  const reset = useCallback(() => {
    setMessages([]);
    setCurrentResponse('');
    setError(null);
    setIsLoading(false);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    // Abort any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    // Add user message
    const userMessage: ChatMessage = { source: 'user', content };
    addMessage(userMessage);

    // Reset state
    setCurrentResponse('');
    setError(null);
    setIsLoading(true);

    try {
      // Prepare messages for the API (including the new user message)
      const apiMessages = [...messages, userMessage];

      await streamChatCompletion(
        apiMessages,
        (chunk) => {
          setCurrentResponse(prev => prev + chunk);
        },
        () => {
          // Add assistant response to messages
          if (currentResponse.trim()) {
            const assistantMessage: ChatMessage = { 
              source: 'assistant', 
              content: currentResponse 
            };
            console.log("assistantMessage", assistantMessage);
            setMessages(prev => [...prev, assistantMessage]);
          }
        //   setCurrentResponse(''); TODO: separate this to the history
          setIsLoading(false);
          options.onComplete?.();
        },
        (error) => {
          setError(error);
          setIsLoading(false);
          options.onError?.(error);
        }
      );
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      setError(error);
      setIsLoading(false);
      options.onError?.(error);
    } finally {
      abortControllerRef.current = null;
    }
  }, [messages, currentResponse, addMessage, options]);

  return {
    messages,
    currentResponse,
    isLoading,
    error,
    sendMessage,
    addMessage,
    clearMessages,
    reset,
  };
} 