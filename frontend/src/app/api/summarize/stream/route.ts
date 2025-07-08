import { NextRequest } from "next/server";
import { SummarizeDocumentInputSchema } from "../schema";
import { summarizeDocumentStream } from "@/lib/openai/summary";

export async function POST(request: NextRequest) {
  const input = SummarizeDocumentInputSchema.safeParse(await request.json());
  if (!input.success) {
    return new Response(JSON.stringify({ error: "Invalid input" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const summaryStream = await summarizeDocumentStream(input.data.text);
        
        for await (const chunk of summaryStream) {
          const data = JSON.stringify({ chunk });
          controller.enqueue(encoder.encode(`data: ${data}\n\n`));
        }
        
        controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
        controller.close();
      } catch (error) {
        const errorData = JSON.stringify({ error: `Failed to summarize: ${error}` });
        controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
} 