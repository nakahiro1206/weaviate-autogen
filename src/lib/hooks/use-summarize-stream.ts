import { useState, useCallback } from "react";
import { summarizeDocumentStream } from "@/lib/api-helper/summarize";

interface UseSummarizeStreamReturn {
  summary: string;
  isStreaming: boolean;
  error: string | null;
  startStream: (text: string) => Promise<void>;
  reset: () => void;
}

export const useSummarizeStream = (): UseSummarizeStreamReturn => {
  const [summary, setSummary] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startStream = useCallback(async (text: string) => {
    setSummary("");
    setError(null);
    setIsStreaming(true);

    try {
      await summarizeDocumentStream(
        text,
        (chunk) => {
          setSummary((prev) => prev + chunk);
        },
        (errorMessage) => {
          setError(errorMessage);
          setIsStreaming(false);
        },
        () => {
          setIsStreaming(false);
        }
      );
    } catch (err) {
      setError(`Failed to start stream: ${err}`);
      setIsStreaming(false);
    }
  }, []);

  const reset = useCallback(() => {
    setSummary("");
    setError(null);
    setIsStreaming(false);
  }, []);

  return {
    summary,
    isStreaming,
    error,
    startStream,
    reset,
  };
}; 