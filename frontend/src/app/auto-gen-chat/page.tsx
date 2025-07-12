'use client';

import { AutoGenChat } from '@/components/chat/auto-gen-chat';
import { trpc } from '@/lib/trpc/client';

function AutoGenChatPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">
          AutoGen WebSocket Chat Demo
        </h1>
        <p className="text-center text-gray-600 mb-8">
          This demo shows real-time WebSocket communication with the AutoGen backend.
          Make sure the Python server is running on port 8002 with WebSocket support.
        </p>
        <AutoGenChat />
      </div>
    </div>
  );
}

export default trpc.withTRPC(AutoGenChatPage);