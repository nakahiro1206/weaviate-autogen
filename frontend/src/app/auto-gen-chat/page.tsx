'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type WebsocketMessage = {
  type: string;
  content: string;
  source: string;
};

type ToolCallRequestEvent = {
  type: 'ToolCallRequestEvent';
  id: string;
  source: string;
  models_usage: {
    prompt_tokens: number;
    completion_tokens: number;
  };
  metadata: Record<string, any>;
  created_at: string;
  content: Array<{
    id: string;
    arguments: string;
    name: string;
  }>;
};

type ToolCallExecutionEvent = {
  type: 'ToolCallExecutionEvent';
  id: string;
  source: string;
  models_usage: null;
  metadata: Record<string, any>;
  created_at: string;
  content: Array<{
    content: string;
    name: string;
    call_id: string;
    is_error: boolean;
  }>;
};

type TextMessage = {
  type: 'TextMessage';
  id: string;
  source: string;
  models_usage: null;
  metadata: Record<string, any>;
  created_at: string;
  content: string;
};

export default function AutoGenChatPage() {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState<string>('');
  const [isInputEnabled, setIsInputEnabled] = useState<boolean>(true);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8002/ws/chat');
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('ws opened');
    };

    ws.onmessage = (event) => {
      console.log('onmessage', event.data);
      const message: WebsocketMessage = JSON.parse(event.data);
      if (message.type === 'UserInputRequestedEvent') {
        setIsInputEnabled(true);
      } else if (message.type === 'error') {
        setMessages((prev) => [...prev, message.content]);
        setIsInputEnabled(true);
      } else if (message.type === 'ToolCallRequestEvent') {
        const m = message as any as ToolCallRequestEvent;
        console.log('ToolCallRequestEvent', m.content.map((c: any) => c.name));
        setMessages((prev) => [...prev, m.content.map((c: any) => c.name).join(', ')]);
      } else if (message.type === 'ToolCallExecutionEvent') {
        const m = message as any as ToolCallExecutionEvent;
        console.log('ToolCallExecutionEvent', m.content.map((c: any) => c.name));
        setMessages((prev) => [...prev, m.content.map((c: any) => JSON.stringify(c.content)).join(', ')]);
      } else if (message.type === 'TextMessage') {
        const m = message as any as TextMessage;
        setMessages((prev) => [...prev, JSON.stringify(m.content)]);
        setIsInputEnabled(false);
      } else {
        console.error('unknown message type', message);
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
  }, []);

  const loadHistory = async () => {
    const response = await fetch('http://localhost:8002/history');
    const history = await response.json();
    console.log('history', history);
    setMessages(history.map((message: any) => JSON.stringify(message.content)));
  };

  useEffect(() => {
    loadHistory();
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

  return (
    <div>
      <div>
        {messages.map((message, index) => (
          <div key={index}>{message}</div>
        ))}
      </div>
      <Input value={input} onChange={(e) => setInput(e.target.value)} disabled={!isInputEnabled} />
      <Button onClick={handleSend} disabled={!isInputEnabled}>Send</Button>
    </div>
  );
}
