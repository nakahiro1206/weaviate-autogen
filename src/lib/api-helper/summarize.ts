import { SummarizeDocumentInput, SummarizeDocumentResponse, SummarizeDocumentResponseSchema } from "@/app/api/summarize/schema";
import { safeFetch, match, Result, Err, Ok } from "../result";

export const summarizeDocument = async (text: string): Promise<Result<string>> => {
  const response = await safeFetch(
    "summarize",
    SummarizeDocumentResponseSchema,
    "/api/summarize",
    {
      method: "POST",
      body: JSON.stringify({ text }),
    },
  );
  
  return match(response, {
    onSuccess: (data) => Ok(data.summary),
    onError: (message) => {
      return Err(message);
    },
  });
};

export const summarizeDocumentStream = async (
  text: string,
  onChunk: (chunk: string) => void,
  onError?: (error: string) => void,
  onComplete?: () => void
): Promise<void> => {
  try {
    const response = await fetch("/api/summarize/stream", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      onError?.(`HTTP error! status: ${response.status}`);
      return;
    }

    const reader = response.body?.getReader();
    if (!reader) {
      onError?.("No response body");
      return;
    }

    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6);
          if (data === "[DONE]") {
            onComplete?.();
            return;
          }

          try {
            const parsed = JSON.parse(data);
            if (parsed.chunk) {
              onChunk(parsed.chunk);
            } else if (parsed.error) {
              onError?.(parsed.error);
              return;
            }
          } catch (e) {
            // Ignore parsing errors for incomplete chunks
          }
        }
      }
    }
  } catch (error) {
    onError?.(`Failed to stream summary: ${error}`);
  }
};