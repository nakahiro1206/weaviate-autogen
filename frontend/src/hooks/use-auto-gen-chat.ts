import { useState, useCallback, useRef, useEffect } from 'react';

export interface AutoGenMessage {
  type: 'message' | 'error' | 'system' | 'UserInputRequestedEvent';
  content: string;
  source?: string;
  timestamp?: string;
}

export interface UseAutoGenChatOptions {
  onComplete?: () => void;
  onError?: (error: Error) => void;
  onUserInputRequested?: () => void;
  onConnectionStatusChange?: (status: 'connected' | 'disconnected' | 'connecting') => void;
}

export function useAutoGenChat(options: UseAutoGenChatOptions = {}) {
  const [messages, setMessages] = useState<AutoGenMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isInputEnabled, setIsInputEnabled] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('disconnected');
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connectWebSocket = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    setConnectionStatus('connecting');
    
    try {
      wsRef.current = new WebSocket('ws://localhost:8002/ws/chat');

      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
        setConnectionStatus('connected');
        setError(null);
        options.onConnectionStatusChange?.('connected');
      };

      wsRef.current.onmessage = (event) => {
        console.log('onmessage', event.data);
        try {
          const message = JSON.parse(event.data);

          if (message.type === 'UserInputRequestedEvent') {
            // Re-enable input and send button if UserInputRequestedEvent is received
            setIsInputEnabled(true);
            options.onUserInputRequested?.();
            setMessages(prev => [...prev, {
              type: 'UserInputRequestedEvent',
              content: message.content || 'User input requested',
              source: message.source,
              timestamp: new Date().toISOString(),
            }]);
          } else if (message.type === 'error') {
            // Display error message
            setIsInputEnabled(true);
            const error = new Error(message.content);
            setError(error);
            options.onError?.(error);
            setMessages(prev => [...prev, {
              type: 'error',
              content: message.content,
              source: message.source,
              timestamp: new Date().toISOString(),
            }]);
          } else {
            // Display regular message
            setMessages(prev => [...prev, {
              type: 'message',
              content: message.content,
              source: message.source,
              timestamp: new Date().toISOString(),
            }]);
          }
        } catch (parseError) {
          const err = parseError instanceof Error ? parseError : new Error('Failed to parse message');
          setError(err);
          options.onError?.(err);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        const err = new Error('WebSocket error occurred. Please refresh the page.');
        setError(err);
        setIsInputEnabled(true);
        setConnectionStatus('disconnected');
        options.onError?.(err);
        options.onConnectionStatusChange?.('disconnected');
      };

      wsRef.current.onclose = () => {
        console.log('WebSocket connection closed');
        setConnectionStatus('disconnected');
        setIsInputEnabled(false);
        options.onConnectionStatusChange?.('disconnected');
        
        // Attempt to reconnect after 3 seconds
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
        reconnectTimeoutRef.current = setTimeout(() => {
          connectWebSocket();
        }, 3000);
      };

    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to create WebSocket connection');
      setError(err);
      setConnectionStatus('disconnected');
      options.onError?.(err);
      options.onConnectionStatusChange?.('disconnected');
    }
  }, [options]);

  const disconnectWebSocket = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    setConnectionStatus('disconnected');
    options.onConnectionStatusChange?.('disconnected');
  }, [options]);

  // Connect on mount
  useEffect(() => {
    connectWebSocket();
    
    return () => {
      disconnectWebSocket();
    };
  }, [connectWebSocket, disconnectWebSocket]);

  const addMessage = useCallback((message: AutoGenMessage) => {
    setMessages(prev => [...prev, message]);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  const reset = useCallback(() => {
    setMessages([]);
    setError(null);
    setIsLoading(false);
    setIsInputEnabled(true);
    disconnectWebSocket();
    connectWebSocket();
  }, [disconnectWebSocket, connectWebSocket]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || !isInputEnabled || connectionStatus !== 'connected' || !wsRef.current) return;

    // Add user message
    const userMessage: AutoGenMessage = { 
      type: 'message', 
      content,
      source: 'user',
      timestamp: new Date().toISOString()
    };
    addMessage(userMessage);

    // Disable input while processing
    setIsInputEnabled(false);
    setError(null);
    setIsLoading(true);

    try {
      // Send message via WebSocket
      wsRef.current.send(JSON.stringify({ 
        content, 
        source: 'user',
        type: 'TextMessage'
      }));
      
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      setError(error);
      setIsInputEnabled(true);
      options.onError?.(error);
    } finally {
      setIsLoading(false);
    }
  }, [isInputEnabled, connectionStatus, addMessage, options]);

  const loadHistory = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:8002/history');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const history = await response.json();
      const historyMessages: AutoGenMessage[] = history.map((msg: any) => ({
        type: msg.type || 'message',
        content: msg.content,
        source: msg.source,
        timestamp: msg.timestamp || new Date().toISOString(),
      }));
      setMessages(historyMessages);
    } catch (error) {
      console.error('Error loading history:', error);
      // Don't set error for history loading failure as it's not critical
    }
  }, []);

  // Load chat history on mount
  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    addMessage,
    clearMessages,
    reset,
    isInputEnabled,
    connectionStatus,
    loadHistory,
  };
} 