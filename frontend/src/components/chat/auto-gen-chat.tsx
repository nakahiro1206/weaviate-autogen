import { useState } from 'react';
import { useAutoGenChat, AutoGenMessage } from '@/hooks/use-auto-gen-chat';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';

export function AutoGenChat() {
  const [inputValue, setInputValue] = useState('');
  const {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    isInputEnabled,
    connectionStatus,
    loadHistory,
  } = useAutoGenChat({
    onComplete: () => {
      console.log('AutoGen chat completion finished');
    },
    onError: (error) => {
      console.error('AutoGen chat error:', error);
    },
    onUserInputRequested: () => {
      console.log('User input requested');
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading || !isInputEnabled) return;

    await sendMessage(inputValue);
    setInputValue('');
  };

  const getMessageStyle = (message: AutoGenMessage) => {
    switch (message.type) {
      case 'message':
        return message.source === 'user' 
          ? 'bg-blue-100 ml-8 text-right' 
          : 'bg-gray-100 mr-8';
      case 'error':
        return 'bg-red-100 border border-red-300 text-red-800';
      case 'system':
        return 'bg-yellow-100 border border-yellow-300 text-yellow-800';
      case 'UserInputRequestedEvent':
        return 'bg-green-100 border border-green-300 text-green-800';
      default:
        return 'bg-gray-100';
    }
  };

  const getMessageLabel = (message: AutoGenMessage) => {
    switch (message.type) {
      case 'message':
        return message.source === 'user' ? 'You' : message.source || 'Assistant';
      case 'error':
        return 'Error';
      case 'system':
        return 'System';
      case 'UserInputRequestedEvent':
        return 'Input Requested';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            AutoGen WebSocket Chat
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={loadHistory}
                disabled={connectionStatus !== 'connected'}
              >
                Reload History
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={clearMessages}
                disabled={messages.length === 0}
              >
                Clear Chat
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Messages */}
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg ${getMessageStyle(message)}`}
                >
                  <div className="font-semibold text-sm mb-1">
                    {getMessageLabel(message)}
                  </div>
                  <div className="whitespace-pre-wrap">{message.content}</div>
                  {message.timestamp && (
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </div>
                  )}
                </div>
              ))}
              
              {/* Loading indicator */}
              {isLoading && (
                <div className="p-3 rounded-lg bg-gray-100 mr-8">
                  <div className="font-semibold text-sm mb-1 flex items-center gap-2">
                    Processing
                    <Spinner className="w-4 h-4" />
                  </div>
                  <div className="text-gray-600">Waiting for response...</div>
                </div>
              )}
            </div>

            {/* Error display */}
            {error && (
              <div className="p-3 rounded-lg bg-red-100 border border-red-300 text-red-800">
                <div className="font-semibold text-sm mb-1">Error</div>
                <div>{error.message}</div>
              </div>
            )}

            {/* Input form */}
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={
                  !isInputEnabled 
                    ? "Waiting for response..." 
                    : "Type a message..."
                }
                disabled={!isInputEnabled || isLoading}
                className="flex-1"
              />
              <Button 
                type="submit" 
                disabled={!inputValue.trim() || isLoading || !isInputEnabled}
              >
                {isLoading ? (
                  <>
                    <Spinner className="w-4 h-4 mr-2" />
                    Sending
                  </>
                ) : (
                  'Send'
                )}
              </Button>
            </form>

            {/* Connection status */}
            <div className="text-sm text-gray-600">
              Status: {connectionStatus === 'connected' ? 'Connected' : connectionStatus === 'connecting' ? 'Connecting...' : 'Disconnected'}
              {connectionStatus === 'disconnected' && (
                <div className="text-xs text-red-600 mt-1">
                  Make sure the AutoGen backend is running on port 8002
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 