import { SummarizeStream } from "@/components/summarize/summarize-stream";

export default function SummarizeStreamPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Streaming Summary Demo</h1>
        <p className="text-gray-600 mb-8">
          This page demonstrates Server-Sent Events (SSE) for real-time document summarization. 
          Enter text below and watch the summary appear in real-time as it's generated.
        </p>
        <SummarizeStream />
      </div>
    </div>
  );
} 