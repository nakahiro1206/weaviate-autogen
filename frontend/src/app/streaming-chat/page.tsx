import { StreamingChat } from '@/components/chat/streaming-chat';

export default function StreamingChatPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">
          Python Backend Streaming Chat Demo
        </h1>
        <p className="text-center text-gray-600 mb-8">
          This demo shows real-time streaming responses from the Python backend.
          Make sure the Python server is running on port 8501.
        </p>
        <StreamingChat />
      </div>
    </div>
  );
} 