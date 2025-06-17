import { NextResponse } from "next/server";
import { apiChunkUseCase } from "../service";
import { match, tryCatch } from "@/lib/result";
import { PaperChunk } from "@/domain/entities/chunk";
import { PaperEntrySchema } from "@/domain/entities/paper";
import { z } from "zod";

export async function GET() {
  const res = await apiChunkUseCase.fetchAllChunks();
  return match<PaperChunk[], NextResponse>(res, {
    onSuccess: (data) => NextResponse.json(data),
    onError: (message) => NextResponse.json({ error: message }, { status: 500 }),
  });
}

const RequestSchema = z.object({
  paperEntry: PaperEntrySchema,
  paperEntryUuid: z.string(),
});

export async function POST(req: Request) {
  const bodyResult = tryCatch(async () => await req.json());
  if (bodyResult.type === "error") {
    return NextResponse.json({ error: "body is not a json" }, { status: 400 });
  }
  const body = await bodyResult.data;
  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  const { paperEntry, paperEntryUuid } = parsed.data;
  const res = await apiChunkUseCase.chunkPaper(paperEntry, paperEntryUuid);
  return match<string[], NextResponse>(res, {
    onSuccess: (data) => NextResponse.json({ chunks: data }),
    onError: (message) => NextResponse.json({ error: message }, { status: 500 }),
  });
} 