import { NextResponse } from "next/server";
import { match, tryCatch } from "@/lib/result";
import { PaperChunk } from "@/models/chunk";
import { AddPaperChunkInputSchema, AddPaperChunkResponse, FetchAllChunksResponse } from "./schema";
import { getAllChunks, addPaperChunk } from "@/lib/weaviate/insert";

export async function GET() {
  const res = await getAllChunks();
  return match<PaperChunk[], NextResponse>(res, {
    onSuccess: (data) => {
      const response: FetchAllChunksResponse = { chunks: data };
      return NextResponse.json(response);
    },
    onError: (message) => NextResponse.json({ error: message }, { status: 500 }),
  });
}

export async function POST(req: Request) {
  const bodyResult = tryCatch(async () => await req.json());
  if (bodyResult.type === "error") {
    return NextResponse.json({ error: "body is not a json" }, { status: 400 });
  }
  const body = await bodyResult.data;
  const parsed = AddPaperChunkInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  const { paperEntry, paperEntryUuid } = parsed.data;
  const res = await addPaperChunk(paperEntry, paperEntryUuid);
  return match<string[], NextResponse>(res, {
    onSuccess: (data) => {
      const response: AddPaperChunkResponse = { chunkIds: data };
      return NextResponse.json(response);
    },
    onError: (message) => NextResponse.json({ error: message }, { status: 500 }),
  });
} 