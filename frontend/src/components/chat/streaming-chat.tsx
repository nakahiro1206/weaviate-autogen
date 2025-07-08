'use client';

import { useState } from 'react';
import { useStreamingChat } from '@/hooks/use-streaming-chat';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';

export function StreamingChat() {
  const [inputValue, setInputValue] = useState('');
  const {
    messages,
    currentResponse,
    isLoading,
    error,
    sendMessage,
    clearMessages,
  } = useStreamingChat({
    onComplete: () => {
      console.log('Chat completion finished');
    },
    onError: (error) => {
      console.error('Chat error:', error);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    await sendMessage(inputValue);
    setInputValue('');
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Streaming Chat
            <Button
              variant="outline"
              size="sm"
              onClick={clearMessages}
              disabled={messages.length === 0}
            >
              Clear Chat
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Messages */}
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg ${
                    message.source === 'user'
                      ? 'bg-blue-100 ml-8'
                      : 'bg-gray-100 mr-8'
                  }`}
                >
                  <div className="font-semibold text-sm mb-1">
                    {message.source === 'user' ? 'You' : 'Assistant'}
                  </div>
                  <div className="whitespace-pre-wrap">{message.content}</div>
                </div>
              ))}
              
              {/* Current streaming response */}
              {isLoading && currentResponse && (
                <div className="p-3 rounded-lg bg-gray-100 mr-8">
                  <div className="font-semibold text-sm mb-1 flex items-center gap-2">
                    Assistant
                    <Spinner className="w-4 h-4" />
                  </div>
                  <div className="whitespace-pre-wrap">{currentResponse}</div>
                </div>
              )}
              {currentResponse && (
                <div className="p-3 rounded-lg bg-gray-100 mr-8">
                  <div className="font-semibold text-sm mb-1 flex items-center gap-2">
                    Assistant: Curr
                  </div>
                  <div className="whitespace-pre-wrap">{currentResponse}</div>
                </div>
              )}
            </div>

            {/* Error display */}
            {error && (
              <div className="p-3 bg-red-100 border border-red-300 rounded-lg text-red-700">
                Error: {error.message}
              </div>
            )}

            {/* Input form */}
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your message..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button type="submit" disabled={isLoading || !inputValue.trim()}>
                {isLoading ? <Spinner className="w-4 h-4" /> : 'Send'}
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 