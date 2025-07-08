import { NextRequest, NextResponse } from "next/server";
import { SummarizeDocumentInputSchema, SummarizeDocumentResponse, SummarizeDocumentResponseSchema } from "./schema";
import { summarizeDocument } from "@/lib/openai/summary";

export async function POST(request: NextRequest) {
  const input = SummarizeDocumentInputSchema.safeParse(await request.json());
  if (!input.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  
  const result = await summarizeDocument(input.data.text);
  
  if (result.type === "success") {
    return NextResponse.json<SummarizeDocumentResponse>({ summary: result.data ?? "" });
  } else {
    return NextResponse.json({ error: result.message }, { status: 500 });
  }
}