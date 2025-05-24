import { NextResponse } from "next/server";
import { addPaperChunk, getAllChunks } from "@/lib/weaviate/insert";
import { match } from "@/lib/result";
import { PaperChunk } from "@/types/paper";

export async function GET() {
  const res = await getAllChunks();
  return match<PaperChunk[], NextResponse>(res, {
    onSuccess: (data) => NextResponse.json(data),
    onError: (message) => NextResponse.json({ error: message }, { status: 500 }),
  });
}

export async function POST(req: Request) {
    // TODO: add validation
  const { paperEntry, paperEntryUuid } = await req.json();
  const res = await addPaperChunk(paperEntry, paperEntryUuid);
  return match<string[], NextResponse>(res, {
    onSuccess: (data) => NextResponse.json({ chunks: data }),
    onError: (message) => NextResponse.json({ error: message }, { status: 500 }),
  });
} 