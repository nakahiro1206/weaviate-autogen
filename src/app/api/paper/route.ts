import { NextResponse } from "next/server";
import { match, tryCatch } from "@/lib/result";
import { AddPaperRequestSchema, AddPaperResponse, GetAllPapersResponse } from "./schema";
import { PaperEntrySchema, RetrievedPaperEntry } from "@/models/paper";
import { getAllPapers } from "@/lib/weaviate/fetch";
import { addPaper } from "@/lib/weaviate/insert";
import { fileStorage } from "@/lib/storage/file-storage";
import { textStorage } from "@/lib/storage/text-storage";

const GetSuccess = (data: GetAllPapersResponse) => NextResponse.json<GetAllPapersResponse>(data, { status: 200 });
const PostSuccess = (data: AddPaperResponse) => NextResponse.json<AddPaperResponse>(data, { status: 200 });
const Failure = (data: { error: string }) => NextResponse.json(data, { status: 500 });

export async function GET(req: Request) {
  const res = await getAllPapers();
  return match<RetrievedPaperEntry[], NextResponse>(res, {
    onSuccess: (data) => {
      return GetSuccess({papers: data});
    },
    onError: (message) => Failure({ error: message }),
  });
}

export async function POST(req: Request) {
  const bodyResult = tryCatch(async () => await req.json());
  if (bodyResult.type === "error") {
    return Failure({ error: "body is not a json" });
  }
  const body = await bodyResult.data;
  const parsed = AddPaperRequestSchema.safeParse(body);
  if (!parsed.success) {
    return Failure({ error: "Invalid request body" });
  }

  const res = await addPaper(parsed.data);
  switch (res.type) {
    case "success":
      const saveResult = await fileStorage.saveFile(res.data, parsed.data.encoded);
      if (saveResult.type === 'error') {
        return Failure({ error: saveResult.message });
      } else {
        const saveTextResult = await textStorage.saveText(res.data, parsed.data.fullText);
        if (saveTextResult.type === 'error') {
          return Failure({ error: saveTextResult.message });
        } else {
          const response: AddPaperResponse = { id: res.data };
          return PostSuccess(response);
        }
      }
    case "error":
      return Failure({ error: res.message });
  }
}