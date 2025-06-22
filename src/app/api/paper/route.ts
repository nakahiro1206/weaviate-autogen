import { NextResponse } from "next/server";
import { match, tryCatch } from "@/lib/result";
import { AddPaperResponse, GetAllPapersResponse } from "./schema";
import { PaperEntrySchema, RetrievedPaperEntry } from "@/models/paper";
import { getAllPapers } from "@/lib/weaviate/fetch";
import { addPaper } from "@/lib/weaviate/insert";
import { fileStorage } from "@/lib/storage/file-storage";

export async function GET(req: Request) {
  const res = await getAllPapers();
  return match<RetrievedPaperEntry[], NextResponse>(res, {
    onSuccess: (data) => {
      const res: GetAllPapersResponse = { papers: data };
      return NextResponse.json(res);
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
  const parsed = PaperEntrySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const res = await addPaper(parsed.data);
  switch (res.type) {
    case "success":
      const saveResult = await fileStorage.saveFile(res.data, parsed.data.encoded);
      if (saveResult.type === 'error') {
        return NextResponse.json({ error: saveResult.message }, { status: 500 });
      }
      const response: AddPaperResponse = { id: res.data };
      return NextResponse.json(response);
    case "error":
      return NextResponse.json({ error: res.message }, { status: 500 });
  }
}