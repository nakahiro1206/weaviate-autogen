'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import JsonRenderer from '@/components/ui/json-renderer';
import {z} from 'zod';

const withTypeSchema = z.object({
  type: z.string(),
});

const errorMessageSchema = z.object({
  type: z.literal('error'),
  content: z.string(),
  source: z.string(),
});

type ErrorMessage = z.infer<typeof errorMessageSchema>;

const userInputRequestedEventSchema = z.object({
  type: z.literal('UserInputRequestedEvent'),
  content: z.string(),
  source: z.string(),
  // if error occurred, below fields are not present
  id: z.string().optional(),
  models_usage: z.null(),
  metadata: z.record(z.any()).optional(),
  created_at: z.string().optional(),
  request_id: z.string().optional(),
});

type UserInputRequestedEvent = z.infer<typeof userInputRequestedEventSchema>;

const toolCallRequestEventSchema = z.object({
  type: z.literal('ToolCallRequestEvent'),
  id: z.string(),
  source: z.string(),
  models_usage: z.object({
    completion_tokens: z.number(),
    prompt_tokens: z.number(),
  }).nullable(),
  metadata: z.record(z.any()),
  created_at: z.string(),
  content: z.array(z.object({
    id: z.string(),
    arguments: z.string(),
    name: z.string(),
  })),
});

type ToolCallRequestEvent = z.infer<typeof toolCallRequestEventSchema>;

const toolCallExecutionEventSchema = z.object({
  type: z.literal('ToolCallExecutionEvent'),
  id: z.string(),
  source: z.string(),
  models_usage: z.object({
    completion_tokens: z.number(),
    prompt_tokens: z.number(),
  }).nullable(),
  metadata: z.record(z.any()),
  created_at: z.string(),
  content: z.array(z.object({
    content: z.string(),
    name: z.string(),
    call_id: z.string(),
    is_error: z.boolean(),
  })),
});

type ToolCallExecutionEvent = z.infer<typeof toolCallExecutionEventSchema>;

const textMessageSchema = z.object({
  type: z.literal('TextMessage'),
  id: z.string(),
  source: z.string(),
  models_usage: z.object({
    completion_tokens: z.number(),
    prompt_tokens: z.number(),
  }).nullable(),
  metadata: z.record(z.any()),
  created_at: z.string(),
  content: z.string(),
});

type TextMessage = z.infer<typeof textMessageSchema>;

const getType = (json: unknown): string | null => {
  const parsed = withTypeSchema.safeParse(json);
  if (!parsed.success) {
    return null;
  }
  return parsed.data.type;
};

const parseJson = (message: string): unknown | null => {
  try {
    return JSON.parse(message);
  } catch (e) {
    console.error('invalid json', message);
    return null;
  }
};

const parseMessage = (
  message: string
): TextMessage | ToolCallRequestEvent | ToolCallExecutionEvent | UserInputRequestedEvent | ErrorMessage | null => {
  const json = parseJson(message);
  if (json === null) {
    console.error('invalid json', message);
    return null;
  }
  const t = getType(json);
  if (t === null) {
    console.error('no field type', json);
    return null;
  }
  if (t === 'TextMessage') {
    const r = textMessageSchema.safeParse(json);
    if (!r.success) {
      console.error('invalid text message', json, r.error);
      return null;
    }
    return r.data;
  } else if (t === 'ToolCallRequestEvent') {
    const r = toolCallRequestEventSchema.safeParse(json);
    if (!r.success) {
      console.error('invalid tool call request event', json, r.error);
      return null;
    }
    return r.data;
  } else if (t === 'ToolCallExecutionEvent') {
    const r = toolCallExecutionEventSchema.safeParse(json);
    if (!r.success) {
      console.error('invalid tool call execution event', json, r.error);
      return null;
    }
    return r.data;
  } else if (t === 'UserInputRequestedEvent') {
    const r = userInputRequestedEventSchema.safeParse(json);
    if (!r.success) {
      console.error('invalid user input requested event', json, r.error);
      return null;
    }
    return r.data;
  } else if (t === 'error') {
    const r = errorMessageSchema.safeParse(json);
    if (!r.success) {
      console.error('invalid error message', json, r.error);
      return null;
    }
    return r.data;
  } else {
    console.error('unknown message type', json, t);
    return null;
  }
}

type Session = {
  session_id: string;
  created_at: string;
  message_count: number;
  last_activity: string;
};

export default function AutoGenChatPage() {
  const [messages, setMessages] = useState<{content: string, source: string}[]>([]);
  const [input, setInput] = useState<string>('');
  const [isInputEnabled, setIsInputEnabled] = useState<boolean>(true);
  const [sessionId, setSessionId] = useState<string>('');
  const [isSessionCreated, setIsSessionCreated] = useState<boolean>(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const wsRef = useRef<WebSocket | null>(null);

  const createSession = async () => {
    try {
      const response = await fetch('http://localhost:8002/api/v1/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: 'user123',
          metadata: { source: 'frontend' }
        }),
      });
      
      if (response.ok) {
        const sessionData = await response.json();
        setSessionId(sessionData.session_id);
        setIsSessionCreated(true);
        console.log('Session created:', sessionData.session_id);
        // Refresh sessions list
        loadSessions();
      } else {
        console.error('Failed to create session');
      }
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };

  const loadSessions = async () => {
    try {
      const response = await fetch('http://localhost:8002/api/v1/sessions');
      if (response.ok) {
        const data = await response.json();
        setSessions(data.sessions || []);
      } else {
        console.error('Failed to load sessions');
      }
    } catch (error) {
      console.error('Error loading sessions:', error);
    }
  };

  const switchSession = async (newSessionId: string) => {
    // Close current WebSocket connection
    if (wsRef.current) {
      wsRef.current.close();
    }
    
    setSessionId(newSessionId);
    setIsSessionCreated(true);
    setMessages([]); // Clear current messages
  };

  const deleteSession = async (sessionIdToDelete: string) => {
    try {
      const response = await fetch(`http://localhost:8002/api/v1/sessions/${sessionIdToDelete}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        // If we're deleting the current session, clear it
        if (sessionIdToDelete === sessionId) {
          setSessionId('');
          setIsSessionCreated(false);
          setMessages([]);
          if (wsRef.current) {
            wsRef.current.close();
          }
        }
        // Refresh sessions list
        loadSessions();
      } else {
        console.error('Failed to delete session');
      }
    } catch (error) {
      console.error('Error deleting session:', error);
    }
  };

  useEffect(() => {
    if (!sessionId) return;
    
    const ws = new WebSocket(`ws://localhost:8002/ws/chat?session_id=${sessionId}`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('ws opened');
    };

    ws.onmessage = (event) => {
      const message = parseMessage(event.data);
      if (message === null) {
        console.error('unknown message', event.data);
        return;
      }
      switch (message.type) {
        case 'UserInputRequestedEvent':
          setIsInputEnabled(true);
          break;
        case 'error':
          setMessages((prev) => [...prev, {content: JSON.stringify(message), source: message.source}]);
          break;
        case 'ToolCallRequestEvent':
          setMessages((prev) => [...prev, {content: JSON.stringify(message.content), source: message.source}]);
          break;
        case 'ToolCallExecutionEvent':
          setMessages((prev) => [...prev, {content: JSON.stringify(message.content), source: message.source}]);
          break;
        case 'TextMessage':
          setMessages((prev) => [...prev, {content: JSON.stringify(message.content), source: message.source}]);
          setIsInputEnabled(false);
          break;
        default:
          console.error('unknown message type', message);
          break;
      }
    };

    ws.onerror = (event) => {
      console.log('ws error', event);
    };

    ws.onclose = () => {
      console.log('ws closed');
    };

    return () => {
      ws.close();
    };
  }, [sessionId]);

  const loadHistory = async () => {
    if (!sessionId) return;
    
    const response = await fetch(`http://localhost:8002/history?session_id=${sessionId}`);
    const history = await response.json();
    console.log('history', history);
    setMessages(history.map((message: any) => JSON.stringify(message.content)));
  };

  useEffect(() => {
    if (sessionId) {
      loadHistory();
    }
  }, [sessionId]);

  useEffect(() => {
    // Load sessions on component mount
    loadSessions();
  }, []);

  const handleSend = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        content: input,
        source: 'user',
      }));
      setInput('');
    } else {
      console.warn('WebSocket is not open.');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const truncateSessionId = (id: string) => {
    return id.substring(0, 8) + '...';
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className={`w-80 bg-gray-50 border-r border-gray-200 flex flex-col ${isSidebarOpen ? 'block' : 'hidden'}`}>
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Sessions</h2>
            <Button 
              onClick={createSession} 
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              New Session
            </Button>
          </div>
          <Button 
            onClick={() => setIsSidebarOpen(false)}
            variant="outline"
            size="sm"
            className="w-full"
          >
            Hide Sidebar
          </Button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          {sessions.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p>No sessions yet</p>
              <p className="text-sm">Create a new session to get started</p>
            </div>
          ) : (
            <div className="space-y-2">
              {sessions.map((session) => (
                <div 
                  key={session.session_id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    session.session_id === sessionId 
                      ? 'bg-blue-100 border-blue-300' 
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div 
                    className="flex justify-between items-start"
                    onClick={() => switchSession(session.session_id)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-gray-900 truncate">
                        {truncateSessionId(session.session_id)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Created: {formatDate(session.created_at)}
                      </div>
                      <div className="text-xs text-gray-500">
                        Messages: {session.message_count}
                      </div>
                      {session.last_activity !== session.created_at && (
                        <div className="text-xs text-gray-500">
                          Last: {formatDate(session.last_activity)}
                        </div>
                      )}
                    </div>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSession(session.session_id);
                      }}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 ml-2"
                    >
                      ×
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header with toggle button when sidebar is closed */}
        {!isSidebarOpen && (
          <div className="p-4 border-b border-gray-200">
            <Button 
              onClick={() => setIsSidebarOpen(true)}
              variant="outline"
              size="sm"
            >
              Show Sessions
            </Button>
          </div>
        )}

        <div className="flex-1 p-4 overflow-hidden">
          {!isSessionCreated ? (
            <div className="text-center h-full flex flex-col justify-center">
              <h2 className="text-2xl font-bold mb-4">Auto-Gen Chat</h2>
              <p className="mb-4">Create a new session to start chatting with the AI agents</p>
              <Button onClick={createSession} className="bg-blue-600 hover:bg-blue-700">
                Create New Session
              </Button>
            </div>
          ) : (
            <div className="h-full flex flex-col">
              <div className="mb-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Auto-Gen Chat</h2>
                  <div className="text-sm text-gray-600">
                    Session: {sessionId.substring(0, 8)}...
                  </div>
                </div>
              </div>
              <div className="flex-1 mb-4 space-y-2 overflow-y-auto border rounded-lg p-4 bg-gray-50">
                {messages.map((message, index) => (
                  <div key={index} className="border-b border-gray-200 pb-2 last:border-b-0">
                    <JsonRenderer data={JSON.parse(message.content)} source={message.source} />
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input 
                  value={input} 
                  onChange={(e) => setInput(e.target.value)} 
                  disabled={!isInputEnabled}
                  placeholder="Type your message..."
                  className="flex-1"
                />
                <Button onClick={handleSend} disabled={!isInputEnabled}>Send</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
